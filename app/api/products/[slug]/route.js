import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/admin/db';
import Product from '@/models/Product';
import Variant from '@/models/Variant';
import Batch from '@/models/Batch';
import Category from '@/models/Category';

export async function GET(req, { params }) {
     try {
          const { slug } = await params;
          await dbConnect();

          // Allow lookup by slug OR productCode
          const product = await Product.findOne({
               status: 'active',
               $or: [{ slug: slug }, { productCode: slug }]
          }).populate('category');

          if (!product) {
               return NextResponse.json({ error: 'Product not found' }, { status: 404 });
          }
          // Fetch active variants
          const variants = await Variant.find({ product: product._id, isActive: true });

          // Fetch stock for each variant
          const { searchParams } = new URL(req.url);
          const vendorId = searchParams.get('vendor');
          const pincode = searchParams.get('pincode');
          const { default: VendorStock } = await import('@/models/VendorStock');

          const variantsWithStock = await Promise.all(variants.map(async (variant) => {
               let totalStock = 0;

               if (vendorId && mongoose.Types.ObjectId.isValid(vendorId)) {
                    // Case 1: Serviceable Pincode (Vendor Mapped)
                    const vendorStocks = await VendorStock.find({
                         vendor: vendorId,
                         variant: variant._id
                    });
                    totalStock = vendorStocks.reduce((sum, s) => sum + s.quantity, 0);
               } else if (pincode) {
                    // Case 2: Non-Serviceable Pincode (Not in DB)
                    // Explicitly return 0 stock to trigger STOCK REQUEST
                    totalStock = 0;
               } else {
                    // Case 3: No location context (SEO/Initial)
                    // Fallback to global batches
                    const batches = await Batch.find({
                         variant: variant._id,
                         status: 'active',
                         expiryDate: { $gt: new Date() },
                         quantity: { $gt: 0 }
                    });
                    totalStock = batches.reduce((sum, b) => sum + b.quantity, 0);
               }

               return {
                    ...variant.toObject(),
                    stock: totalStock
               };
          }));

          return NextResponse.json({
               success: true,
               product: {
                    ...product.toObject(),
                    variants: variantsWithStock
               }
          });

     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
