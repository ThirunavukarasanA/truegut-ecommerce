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

          if (!email || !password) {
               return NextResponse.json({ error: 'Please provide email and password' }, { status: 400 });
          }

          await dbConnect();

          // 1. Validate Customer
          const customer = await Customer.findOne({ email });
          if (!customer) {
               return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
          }

          const isMatch = await customer.comparePassword(password);
          if (!isMatch) {
               return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
          }

          // 2. Generate Token
          const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret_key');
          const alg = 'HS256';

          const token = await new SignJWT({ sub: customer._id.toString(), email: customer.email, role: 'customer' })
               .setProtectedHeader({ alg })
               .setIssuedAt()
               .setExpirationTime('30d') // Long session for customers
               .sign(secret);

          // 3. Set Cookie
          (await cookies()).set({
               name: 'customer_token',
               value: token,
               httpOnly: true,
               path: '/',
               secure: process.env.NODE_ENV === 'production',
               maxAge: 60 * 60 * 24 * 30, // 30 days
          });

          // 4. Merge Temp Cart (if exists)
          const cookieStore = await cookies();
          const sessionId = cookieStore.get('cart_session_id')?.value;

          if (sessionId) {
               const tempCart = await TempCart.findOne({ sessionId });
               if (tempCart && tempCart.items.length > 0) {
                    let userCart = await Cart.findOne({ customerId: customer._id });
                    if (!userCart) {
                         userCart = new Cart({ customerId: customer._id, items: [] });
                    }

                    // Merge logic
                    for (const tempItem of tempCart.items) {
                         const existingItemIndex = userCart.items.findIndex(item =>
                              item.productId.toString() === tempItem.productId.toString() &&
                              (tempItem.variantId ? item.variantId?.toString() === tempItem.variantId.toString() : !item.variantId)
                         );

                         if (existingItemIndex > -1) {
                              userCart.items[existingItemIndex].quantity += tempItem.quantity;
                         } else {
                              userCart.items.push(tempItem);
                         }
                    }

                    await userCart.save();
                    await TempCart.deleteOne({ sessionId });

                    // Optional: Clear session cookie or let it expire
                    cookieStore.delete('cart_session_id');
               }
          }

          return NextResponse.json({
               success: true,
               message: 'Login successful',
               customer: {
                    id: customer._id,
                    name: customer.name,
                    email: customer.email
               }
          });

     } catch (error) {
          console.error("Login Error:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
