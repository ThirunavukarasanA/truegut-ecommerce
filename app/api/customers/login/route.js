import { SignJWT } from 'jose';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';
import Cart from '@/models/Cart';
import TempCart from '@/models/TempCart';
import { cookies } from 'next/headers';

export async function POST(req) {
     try {
          const { email, password } = await req.json();

          await dbConnect();

          const customer = await Customer.findOne({ email });
          if (!customer) {
               return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
          }

          const isMatch = await customer.comparePassword(password);
          if (!isMatch) {
               return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
          }

          // Create JWT
          const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret_key');
          const alg = 'HS256';

          const token = await new SignJWT({ sub: customer._id.toString(), role: 'customer', email: customer.email })
               .setProtectedHeader({ alg })
               .setIssuedAt()
               .setExpirationTime('30d')
               .sign(secret);

          const cookieStore = await cookies();

          // Set Customer Token Cookie
          cookieStore.set({
               name: 'customer_token',
               value: token,
               httpOnly: true,
               path: '/',
               secure: process.env.NODE_ENV === 'production',
               maxAge: 60 * 60 * 24 * 30, // 30 days
          });

          // Merge TempCart if exists
          const sessionId = cookieStore.get('cart_session_id')?.value;
          if (sessionId) {
               const tempCart = await TempCart.findOne({ sessionId });
               if (tempCart && tempCart.items.length > 0) {
                    let customerCart = await Cart.findOne({ customerId: customer._id });
                    if (!customerCart) {
                         customerCart = new Cart({ customerId: customer._id, items: [] });
                    }

                    // Simple merge: add items from tempCart that are not in customerCart, 
                    // or update quantity for existing items
                    for (const tempItem of tempCart.items) {
                         const existingItemIndex = customerCart.items.findIndex(
                              (item) => item.productId.toString() === tempItem.productId.toString()
                         );

                         if (existingItemIndex > -1) {
                              customerCart.items[existingItemIndex].quantity += tempItem.quantity;
                         } else {
                              customerCart.items.push(tempItem);
                         }
                    }

                    await customerCart.save();
                    await TempCart.deleteOne({ sessionId });
                    cookieStore.delete('cart_session_id');
               }
          }

          return NextResponse.json({
               success: true,
               customer: {
                    id: customer._id,
                    name: customer.name,
                    email: customer.email,
               }
          });
     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
