import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
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
          const variantsWithStock = await Promise.all(variants.map(async (variant) => {
               const batches = await Batch.find({
                    variant: variant._id,
                    status: 'active',
                    expiryDate: { $gt: new Date() },
                    quantity: { $gt: 0 }
               });

               const totalStock = batches.reduce((sum, b) => sum + b.quantity, 0);

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
