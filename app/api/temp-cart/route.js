import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TempCart from '@/models/TempCart';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

async function getOrSetSession() {
     const cookieStore = await cookies();
     let sessionId = cookieStore.get('cart_session_id')?.value;
     if (!sessionId) {
          sessionId = uuidv4();
          cookieStore.set({
               name: 'cart_session_id',
               value: sessionId,
               httpOnly: true,
               path: '/',
               maxAge: 60 * 60 * 24 * 30, // 30 days
          });
     }
     return sessionId;
}

function getMetadata(req) {
     const userAgent = req.headers.get('user-agent') || 'Unknown';
     const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';

     // Simple device detection
     let deviceType = 'Desktop';
     if (/mobile/i.test(userAgent)) deviceType = 'Mobile';
     else if (/tablet/i.test(userAgent)) deviceType = 'Tablet';

     return {
          userAgent,
          deviceType,
          ipAddress: ip,
     };
}

export async function GET(req) {
     try {
          await dbConnect();
          const sessionId = await getOrSetSession();
          const cart = await TempCart.findOne({ sessionId });
          return NextResponse.json({ cart: cart || { items: [] } });
     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}

export async function POST(req) {
     try {
          const { productId, quantity, price, name, image } = await req.json();
          await dbConnect();
          const sessionId = await getOrSetSession();
          const metadata = getMetadata(req);

          let cart = await TempCart.findOne({ sessionId });
          if (!cart) {
               cart = new TempCart({ sessionId, items: [], metadata });
          }

          const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
          if (existingItemIndex > -1) {
               cart.items[existingItemIndex].quantity += (quantity || 1);
          } else {
               cart.items.push({ productId, quantity: quantity || 1, price, name, image });
          }

          cart.metadata = metadata; // Update metadata on every activity
          await cart.save();
          return NextResponse.json({ success: true, cart });
     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}

export async function PUT(req) {
     try {
          const { productId, quantity } = await req.json();
          await dbConnect();
          const sessionId = await getOrSetSession();

          const cart = await TempCart.findOne({ sessionId });
          if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });

          const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
          if (itemIndex > -1) {
               if (quantity <= 0) {
                    cart.items.splice(itemIndex, 1);
               } else {
                    cart.items[itemIndex].quantity = quantity;
               }
               await cart.save();
          }

          return NextResponse.json({ success: true, cart });
     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}

export async function DELETE(req) {
     try {
          const { productId } = await req.json();
          await dbConnect();
          const sessionId = await getOrSetSession();

          const cart = await TempCart.findOne({ sessionId });
          if (!cart) return NextResponse.json({ success: true });

          if (productId) {
               cart.items = cart.items.filter(item => item.productId.toString() !== productId);
               await cart.save();
          } else {
               await TempCart.deleteOne({ sessionId });
          }

          return NextResponse.json({ success: true });
     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
