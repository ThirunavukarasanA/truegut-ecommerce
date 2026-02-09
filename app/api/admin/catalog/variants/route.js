import { NextResponse } from 'next/server';
import dbConnect from '@/lib/admin/db';
import Variant from '@/models/Variant';
import Product from '@/models/Product';
import { getAuthenticatedUser } from '@/lib/admin/api-auth';

export async function GET(req) {
     const user = await getAuthenticatedUser();
     if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

     const { searchParams } = new URL(req.url);
     const productId = searchParams.get('product');

     if (!productId) {
          return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
     }

     await dbConnect();
     try {
          const variants = await Variant.find({ product: productId }).sort('-createdAt');
          return NextResponse.json({ success: true, data: variants });
     } catch (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
     }
}

export async function POST(req) {
     const user = await getAuthenticatedUser();
     const allowedRoles = ['admin', 'system_admin', 'owner'];
     if (!user || !allowedRoles.includes(user.role)) {
          return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required' }, { status: 401 });
     }

     await dbConnect();
     try {
          const body = await req.json();

          if (!body.product || !body.name || !body.price) {
               return NextResponse.json({ success: false, error: 'Product, Name, and Price are required' }, { status: 400 });
          }

          // Verify Product exists
          const productExists = await Product.findById(body.product);
          if (!productExists) {
               return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
          }

          // Auto-generate SKU
          // Format: PRODUCT-VARIANT-001 (simplified slug)
          if (!body.sku) {
               // We need product name
               const cleanName = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
               const pSlug = cleanName(productExists.name).substring(0, 3).toUpperCase();
               const vSlug = cleanName(body.name).substring(0, 3).toUpperCase();

               // Check if SKU exists to increment? User said "001".
               // Let's try 001, if exists, maybe error or increment? 
               // For now, straight implementation of User Request: "product name+variant name + 001"
               // We should probably check if it exists to be safe, but sticking to simple requirement first.
               body.sku = `${pSlug}-${vSlug}-001`.toUpperCase();

               // Ensure distinctness if multiple same names? 
               // Ideally we'd check DB.
               let counter = 1;
               while (await Variant.findOne({ sku: body.sku })) {
                    counter++;
                    const suffix = counter.toString().padStart(3, '0');
                    body.sku = `${pSlug}-${vSlug}-${suffix}`.toUpperCase();
               }
          }

          // Check for duplicate SKU (if manually provided or after generation)
          const skuExists = await Variant.findOne({ sku: body.sku });
          if (skuExists) {
               return NextResponse.json({ success: false, error: 'SKU already exists' }, { status: 400 });
          }

          const variant = await Variant.create(body);
          return NextResponse.json({ success: true, data: variant });
     } catch (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 400 });
     }
}
