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
     // Prefer the explicit client IP passed from frontend if available
     const ip = req.headers.get('x-client-ip') || req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';

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
          let cart = await TempCart.findOne({ sessionId })
               .populate('items.productId')
               .populate('items.variantId');

          if (cart) {
               const { default: Batch } = await import('@/models/Batch');
               const itemsWithStock = await Promise.all(cart.items.map(async (item) => {
                    if (!item.variantId) return item;
                    const batches = await Batch.find({
                         variant: item.variantId._id,
                         status: 'active',
                         expiryDate: { $gt: new Date() },
                         quantity: { $gt: 0 }
                    });
                    const stock = batches.reduce((sum, b) => sum + b.quantity, 0);
                    // Convert Mongoose doc to object to append property
                    const itemObj = item.toObject ? item.toObject() : item;
                    return { ...itemObj, stock };
               }));
               // Return cart with modified items
               const cartObj = cart.toObject ? cart.toObject() : cart;
               cartObj.items = itemsWithStock;
               cart = cartObj;
          }

          return NextResponse.json({ cart: cart || { items: [] }, success: true });
     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}

export async function POST(req) {
     try {
          const { productId, variantId, quantity, price, name, image } = await req.json();
          await dbConnect();
          const sessionId = await getOrSetSession();
          const metadata = getMetadata(req);

          let cart = await TempCart.findOne({ sessionId });
          if (!cart) {
               cart = new TempCart({ sessionId, items: [], metadata });
          }

          const existingItemIndex = cart.items.findIndex(item =>
               item.productId.toString() === productId &&
               (variantId ? item.variantId?.toString() === variantId : !item.variantId)
          );


          // Stock Validation Logic
          const { default: Batch } = await import('@/models/Batch');
          const batches = await Batch.find({
               variant: variantId,
               status: 'active',
               expiryDate: { $gt: new Date() },
               quantity: { $gt: 0 }
          });
          const totalAvailable = batches.reduce((sum, b) => sum + b.quantity, 0);

          let finalQuantity = quantity || 1;
          if (existingItemIndex > -1) {
               finalQuantity += cart.items[existingItemIndex].quantity;
          }

          if (finalQuantity > totalAvailable) {
               return NextResponse.json({
                    error: `Insufficient stock. Available: ${totalAvailable}`
               }, { status: 400 });
          }

          if (existingItemIndex > -1) {
               cart.items[existingItemIndex].quantity = finalQuantity;
          } else {
               cart.items.push({ productId, variantId, quantity: quantity || 1, price, name, image });
          }

          cart.metadata = metadata; // Update metadata on every activity
          cart.updatedAt = Date.now();
          await cart.save();
          return NextResponse.json({ success: true, cart });
     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}

export async function PUT(req) {
     try {
          const { productId, variantId, quantity } = await req.json();
          await dbConnect();
          const sessionId = await getOrSetSession();

          const cart = await TempCart.findOne({ sessionId });
          if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });

          const itemIndex = cart.items.findIndex(item =>
               item.productId.toString() === productId &&
               (variantId ? item.variantId?.toString() === variantId : !item.variantId)
          );


          if (itemIndex > -1) {
               if (quantity <= 0) {
                    cart.items.splice(itemIndex, 1);
               } else {
                    // Stock Validation for Update
                    const { default: Batch } = await import('@/models/Batch');
                    const item = cart.items[itemIndex];
                    // Use item.variantId or if not present (product level? assuming variantId always there for now)
                    const vId = item.variantId || variantId; // Should rely on what's in cart or request? Request has variantId.

                    if (vId) {
                         const batches = await Batch.find({
                              variant: vId,
                              status: 'active',
                              expiryDate: { $gt: new Date() },
                              quantity: { $gt: 0 }
                         });
                         const totalAvailable = batches.reduce((sum, b) => sum + b.quantity, 0);

                         if (quantity > totalAvailable) {
                              return NextResponse.json({
                                   error: `Insufficient stock. Available: ${totalAvailable}`
                              }, { status: 400 });
                         }
                    }
                    cart.items[itemIndex].quantity = quantity;
               }
               cart.updatedAt = Date.now();
               await cart.save();
          }

          return NextResponse.json({ success: true, cart });
     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}

export async function DELETE(req) {
     try {
          const { productId, variantId } = await req.json();
          await dbConnect();
          const sessionId = await getOrSetSession();

          const cart = await TempCart.findOne({ sessionId });
          if (!cart) return NextResponse.json({ success: true });

          if (productId) {
               cart.items = cart.items.filter(item =>
                    !(item.productId.toString() === productId &&
                         (variantId ? item.variantId?.toString() === variantId : !item.variantId))
               );
               cart.updatedAt = Date.now();
               await cart.save();
          } else {
               await TempCart.deleteOne({ sessionId });
          }

          return NextResponse.json({ success: true });
     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
