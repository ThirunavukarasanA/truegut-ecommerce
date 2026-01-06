import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Cart from '@/models/Cart';
import TempCart from '@/models/TempCart';
import Batch from '@/models/Batch';
import Variant from '@/models/Variant';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

async function getCustomerId() {
     const cookieStore = await cookies();
     const token = cookieStore.get('customer_token')?.value;
     if (!token) return null;
     try {
          const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret_key');
          const { payload } = await jwtVerify(token, secret);
          return payload.sub;
     } catch { return null; }
}

async function getSessionId() {
     return (await cookies()).get('cart_session_id')?.value;
}

export async function POST(req) {
     try {
          await dbConnect();
          const customerId = await getCustomerId();
          const sessionId = await getSessionId();

          let cart = null;
          if (customerId) {
               cart = await Cart.findOne({ customerId });
          } else if (sessionId) {
               cart = await TempCart.findOne({ sessionId });
          }

          if (!cart || cart.items.length === 0) {
               return NextResponse.json({ valid: false, error: 'Cart is empty' }, { status: 400 });
          }

          let isValid = true;
          let calculatedTotal = 0;
          const errors = [];
          const validatedItems = [];

          for (const item of cart.items) {
               const variantId = item.variantId || item.variant; // Handle potential naming diffs
               if (!variantId) continue;

               // Fetch Variant for Price
               const variant = await Variant.findById(variantId);
               if (!variant || !variant.isActive) {
                    isValid = false;
                    errors.push(`Item ${item.name || 'Unknown'} is no longer available.`);
                    continue;
               }

               // Check Stock
               const batches = await Batch.find({
                    variant: variantId,
                    status: 'active',
                    expiryDate: { $gt: new Date() },
                    quantity: { $gt: 0 }
               });
               const maxStock = batches.reduce((acc, b) => acc + b.quantity, 0);

               if (item.quantity > maxStock) {
                    isValid = false;
                    errors.push(`Insufficient stock for ${item.name}. Available: ${maxStock}`);
               }

               calculatedTotal += variant.price * item.quantity;
               validatedItems.push({
                    productId: item.productId,
                    variantId: variantId,
                    name: variant.name, // Or product Name + Variant Name
                    price: variant.price,
                    quantity: item.quantity,
                    stockAvailable: maxStock
               });
          }

          if (!isValid) {
               return NextResponse.json({ valid: false, errors }, { status: 400 });
          }

          return NextResponse.json({
               valid: true,
               totalAmount: calculatedTotal,
               items: validatedItems
          });

     } catch (error) {
          console.error("Checkout Validation Error:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
