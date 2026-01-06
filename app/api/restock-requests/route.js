import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import RestockRequest from '@/models/RestockRequest';

export async function POST(req) {
     try {
          const { productId, variantId, customerId, name, email, phone } = await req.json();

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
               phone: phone || null
          });

          return NextResponse.json({
               success: true,
               message: 'We will notify you when this item is back in stock!'
          });

     } catch (error) {
          console.error('Restock Request Error:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
