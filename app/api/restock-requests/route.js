import { NextResponse } from 'next/server';
import dbConnect from '@/lib/admin/db';
import RestockRequest from '@/models/RestockRequest';

export async function POST(req) {
     try {
          const { productId, variantId, customerId, name, email, phone, pincode, postOffice, vendorId } = await req.json();

          if (!productId || !variantId || !name || !email) {
               return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
          }

          await dbConnect();

          // Check if request already exists for this email/variant
          const existing = await RestockRequest.findOne({
               email,
               variant: variantId,
               status: 'pending'
          });

          if (existing) {
               return NextResponse.json({
                    success: true,
                    message: 'You are already on the list!'
               });
          }

          await RestockRequest.create({
               product: productId,
               variant: variantId,
               customerId: customerId || null,
               name,
               email,
               phone: phone || null,
               pincode: pincode || null,
               postOffice: postOffice || null,
               vendor: vendorId || null
          });

          // Fetch details for email
          // We assume Product/Variant models are available or can be imported
          const { default: Product } = await import('@/models/Product');
          const { default: Variant } = await import('@/models/Variant');

          const productDoc = await Product.findById(productId);
          const variantDoc = await Variant.findById(variantId);

          if (productDoc && variantDoc) {
               // Send Email to Admin
               // TODO: Configure ADMIN_EMAIL in env
               const adminEmail = process.env.ADMIN_EMAIL || 'admin@fermentaa.com';
               const productName = `${productDoc.name} (${variantDoc.name})`;

               const { sendEmail } = await import('@/lib/admin/email');
               const { restockRequestTemplate } = await import('@/lib/admin/email-templates');

               await sendEmail({
                    to: adminEmail,
                    subject: 'New Restock Request',
                    html: restockRequestTemplate(productName, 1, `${name} (${email})`)
               });
          }

          return NextResponse.json({
               success: true,
               message: 'We will notify you when this item is back in stock!'
          });

     } catch (error) {
          console.error('Restock Request Error:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
