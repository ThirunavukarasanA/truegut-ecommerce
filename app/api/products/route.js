import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/admin/db';
import Product from '@/models/Product';
import Variant from '@/models/Variant';
import Batch from '@/models/Batch';
import Category from '@/models/Category';

export async function GET(req) {
     try {
          await dbConnect();
          const { searchParams } = new URL(req.url);

          const page = parseInt(searchParams.get('page')) || 1;
          const limit = parseInt(searchParams.get('limit')) || 12;
          const search = searchParams.get('search') || '';
          const categorySlug = searchParams.get('category');
          const minPrice = parseFloat(searchParams.get('minPrice'));
          const maxPrice = parseFloat(searchParams.get('maxPrice'));
          const sort = searchParams.get('sort') || 'newest'; // newest, price_asc, price_desc
          const fermentation = searchParams.get('fermentation');

          // Build Query
          let query = { status: 'active' };

          if (search) {
               query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
               ];
          }

          if (fermentation) {
               query['fermentation.type'] = fermentation;
          }

          if (categorySlug) {
               const category = await Category.findOne({ slug: categorySlug });
               if (category) {
                    query.category = category._id;
               }
          }

          // Handle Price Filtering & Sorting via Aggregation
          // We prefer aggregation to seamlessly handle variants price check + sorting + pagination
          const pipeline = [
               { $match: query },
               {
                    $lookup: {
                         from: 'variants',
                         localField: '_id',
                         foreignField: 'product',
                         as: 'variants'
                    }
               },
               // Filter variants to only include active ones (optional, but good for pricing)
               {
                    $addFields: {
                         activeVariants: {
                              $filter: {
                                   input: '$variants',
                                   as: 'v',
                                   cond: { $eq: ['$$v.isActive', true] }
                              }
                         }
                    }
               },
               // Calculate minPrice for the product based on active variants
               {
                    $addFields: {
                         minPrice: { $min: '$activeVariants.price' },
                         maxPrice: { $max: '$activeVariants.price' }
                    }
               },
               // Filter products that have at least one active variant (implied? maybe allow empty but usually not)
               { $match: { minPrice: { $ne: null } } }
          ];

          // Apply Price Filter
          if (!isNaN(minPrice)) {
               pipeline.push({ $match: { minPrice: { $gte: minPrice } } });
          }
          if (!isNaN(maxPrice)) {
               pipeline.push({ $match: { minPrice: { $lte: maxPrice } } });
          }

          // Sort
          let sortStage = {};
          if (sort === 'price_asc') sortStage = { minPrice: 1 };
          else if (sort === 'price_desc') sortStage = { minPrice: -1 };
          else sortStage = { createdAt: -1 }; // newest

          pipeline.push({ $sort: sortStage });

          // Pagination using Facet
          pipeline.push({
               $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                         { $skip: (page - 1) * limit },
                         { $limit: limit },
                         // Cleanup output
                         {
                              $addFields: {
                                   activeVariants: { $slice: ['$activeVariants', 1] }
                              }
                         },
                         {
                              $project: {
                                   variants: 0 // Now valid as we are only doing exclusion
                              }
                         },
                         {
                              $lookup: { // Re-populate category if needed
                                   from: 'categories',
                                   localField: 'category',
                                   foreignField: '_id',
                                   as: 'category'
                              }
                         },
                         { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } }
                    ]
               }
          });

          const result = await Product.aggregate(pipeline);
          const data = result[0].data;
          const total = result[0].metadata[0]?.total || 0;

          // ------------------------------------------------------------------
          // HYDRATE WITH STOCK (VENDOR OR BATCH-BASED)
          // ------------------------------------------------------------------
          const vendorId = searchParams.get('vendor');
          const { default: VendorStock } = await import('@/models/VendorStock');

          const productsWithStock = await Promise.all(data.map(async (p) => {
               let totalStock = 0;

               if (vendorId && mongoose.Types.ObjectId.isValid(vendorId)) {
                    // Fetch stock from VendorStock for specific vendor
                    const vendorStocks = await VendorStock.find({
                         vendor: vendorId,
                         product: p._id,
                    });
                    totalStock = vendorStocks.reduce((sum, s) => sum + s.quantity, 0);
               } else {
                    // Fallback to global batch stock if no vendor specified (legacy or admin view)
                    const variants = await Variant.find({ product: p._id, isActive: true }).select('_id');
                    const variantIds = variants.map(v => v._id);

                    const batches = await Batch.find({
                         variant: { $in: variantIds },
                         status: 'active',
                         expiryDate: { $gt: new Date() },
                         quantity: { $gt: 0 }
                    });

                    totalStock = batches.reduce((sum, b) => sum + b.quantity, 0);
               }

               return {
                    ...p,
                    totalStock
               };
          }));

          return NextResponse.json({
               success: true,
               products: productsWithStock,
               pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit)
               }
          });

     } catch (error) {
          console.error("Product List Error:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
