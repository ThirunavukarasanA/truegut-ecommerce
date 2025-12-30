import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Cart from '@/models/Cart';
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
     } catch (error) {
          return null;
     }
}

export async function GET(req) {
     try {
          await dbConnect();
          const customerId = await getCustomerId();
          if (!customerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

          const cart = await Cart.findOne({ customerId });
          return NextResponse.json({ cart: cart || { items: [] } });
     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}

export async function POST(req) {
     try {
          const { productId, quantity, price, name, image } = await req.json();
          await dbConnect();
          const customerId = await getCustomerId();
          if (!customerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

          let cart = await Cart.findOne({ customerId });
          if (!cart) {
               cart = new Cart({ customerId, items: [] });
          }

          const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
          if (existingItemIndex > -1) {
               cart.items[existingItemIndex].quantity += (quantity || 1);
          } else {
               cart.items.push({ productId, quantity: quantity || 1, price, name, image });
          }

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
          const customerId = await getCustomerId();
          if (!customerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

          const cart = await Cart.findOne({ customerId });
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
          const customerId = await getCustomerId();
          if (!customerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

          const cart = await Cart.findOne({ customerId });
          if (!cart) return NextResponse.json({ success: true });

          if (productId) {
               cart.items = cart.items.filter(item => item.productId.toString() !== productId);
               await cart.save();
          } else {
               await Cart.deleteOne({ customerId });
          }

          return NextResponse.json({ success: true });
     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
