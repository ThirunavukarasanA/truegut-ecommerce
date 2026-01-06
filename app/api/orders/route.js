import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Customer from '@/models/Customer';

// Customer: Get their own orders
export async function GET(req) {
     try {
          await dbConnect();

          const { searchParams } = new URL(req.url);
          const customerEmail = searchParams.get('email');
          const orderId = searchParams.get('orderId');

          if (!customerEmail) {
               return NextResponse.json({
                    success: false,
                    error: 'Customer email is required'
               }, { status: 400 });
          }

          let query = { 'customer.email': customerEmail };

          // If specific order ID is requested
          if (orderId) {
               query._id = orderId;
          }

          const orders = await Order.find(query)
               .populate('items.product', 'name images sku category')
               .sort({ createdAt: -1 });

          return NextResponse.json({
               success: true,
               data: orderId ? orders[0] : orders
          });
     } catch (error) {
          console.error("Customer Order GET Error:", error);
          return NextResponse.json({
               success: false,
               error: error.message
          }, { status: 500 });
     }
}

// Customer: Create new order
export async function POST(req) {
     try {
          await dbConnect();
          // We need to import models here if they aren't globally registered yet, 
          // or rely on top imports. Best to ensure imports are present.
          // (Batch and Variant imports are needed)
          const { default: Batch } = await import('@/models/Batch');
          const { default: Variant } = await import('@/models/Variant');

          const body = await req.json();

          // Validate required fields
          if (!body.customer?.email || !body.customer?.name) {
               return NextResponse.json({
                    success: false,
                    error: 'Customer information is required'
               }, { status: 400 });
          }

          if (!body.items || body.items.length === 0) {
               return NextResponse.json({
                    success: false,
                    error: 'Order must contain at least one item'
               }, { status: 400 });
          }

          // Validate and process items
          let calculatedTotal = 0;
          const processedItems = [];

          for (const item of body.items) {
               // item should have variantId (or product if we supported legacy, but let's enforce variant for now)
               if (!item.variant) {
                    return NextResponse.json({ success: false, error: 'Item variant is required' }, { status: 400 });
               }

               const variant = await Variant.findById(item.variant).populate('product');
               if (!variant) {
                    return NextResponse.json({ success: false, error: `Variant ${item.variant} not found` }, { status: 400 });
               }
               if (!variant.product) {
                    return NextResponse.json({ success: false, error: `Product not found for variant ${variant.name}` }, { status: 400 });
               }

               const product = variant.product;

               // Check if product/variant is available
               if (product.status === 'archived' || !variant.isActive) {
                    return NextResponse.json({
                         success: false,
                         error: `Product ${product.name} (${variant.name}) is not available`
                    }, { status: 400 });
               }

               // 1. Check Total Stock across all active batches
               const batches = await Batch.find({
                    variant: variant._id,
                    status: 'active',
                    expiryDate: { $gt: new Date() }, // Not expired
                    quantity: { $gt: 0 }
               }).sort({ expiryDate: 1 }); // FIFO

               const totalAvailable = batches.reduce((sum, b) => sum + b.quantity, 0);

               if (totalAvailable < item.quantity) {
                    return NextResponse.json({
                         success: false,
                         error: `Insufficient stock for ${product.name} - ${variant.name}. Available: ${totalAvailable}`
                    }, { status: 400 });
               }

               // 2. Deduct Stock from Batches
               let remainingToDeduct = item.quantity;
               const usedBatches = [];

               for (const batch of batches) {
                    if (remainingToDeduct <= 0) break;

                    const take = Math.min(batch.quantity, remainingToDeduct);
                    batch.quantity -= take;
                    remainingToDeduct -= take;

                    // Add to used batches list for this item
                    usedBatches.push({
                         batch: batch._id,
                         quantity: take
                    });

                    // Update batch status if empty? Maybe keep active but 0 qty?
                    // Usually we keep it active until manually closed or expired, but 0 qty prevents selection.
                    await batch.save();
               }

               // Create product snapshot
               const processedItem = {
                    product: product._id,
                    variant: variant._id,
                    productSnapshot: {
                         name: product.name,
                         image: product.images?.[0]?.url || null,
                         sku: variant.sku,
                         variantName: variant.name
                    },
                    quantity: item.quantity,
                    price: variant.price, // Use variant price
                    batches: usedBatches
               };

               calculatedTotal += variant.price * item.quantity;
               processedItems.push(processedItem);
          }

          // Create order with processed items and calculated total
          const orderData = {
               customer: body.customer,
               items: processedItems,
               totalAmount: calculatedTotal,
               status: 'Pending',
               paymentStatus: body.paymentDetails?.method === 'Cash on Delivery' ? 'Pending' : 'Pending',
               paymentDetails: body.paymentDetails || {},
               notes: body.notes || '',
          };

          const order = await Order.create(orderData);
          await order.populate([
               { path: 'items.product', select: 'name images' },
               { path: 'items.variant', select: 'name sku' }
          ]);

          return NextResponse.json({
               success: true,
               data: order,
               message: 'Order placed successfully'
          }, { status: 201 });
     } catch (error) {
          console.error("Customer Order POST Error:", error);
          return NextResponse.json({
               success: false,
               error: error.message
          }, { status: 500 });
     }
}

// Customer: Cancel their order
export async function DELETE(req) {
     try {
          await dbConnect();

          const { searchParams } = new URL(req.url);
          const orderId = searchParams.get('orderId');
          const customerEmail = searchParams.get('email');

          if (!orderId || !customerEmail) {
               return NextResponse.json({
                    success: false,
                    error: 'Order ID and customer email are required'
               }, { status: 400 });
          }

          const order = await Order.findOne({
               _id: orderId,
               'customer.email': customerEmail
          });

          if (!order) {
               return NextResponse.json({
                    success: false,
                    error: 'Order not found'
               }, { status: 404 });
          }

          // Only allow cancellation if order is in early stages
          if (!['Pending', 'Processing'].includes(order.status)) {
               return NextResponse.json({
                    success: false,
                    error: `Cannot cancel order with status: ${order.status}`
               }, { status: 400 });
          }

          // Restore stock for cancelled items
          const { default: Batch } = await import('@/models/Batch');

          for (const item of order.items) {
               // If item track batches, restore to them
               if (item.batches && item.batches.length > 0) {
                    for (const batchRecord of item.batches) {
                         await Batch.findByIdAndUpdate(batchRecord.batch, {
                              $inc: { quantity: batchRecord.quantity }
                         });
                    }
               } else {
                    // Fallback for old orders (or if batch tracking failed?): 
                    // Should we try to add to any active batch? 
                    // For now, let's just log or ignore as we can't accurately restore.
                    // Or find the latest active batch and dump it there.
                    if (item.variant) {
                         const latestBatch = await Batch.findOne({
                              variant: item.variant,
                              status: 'active'
                         }).sort({ expiryDate: -1 });

                         if (latestBatch) {
                              latestBatch.quantity += item.quantity;
                              await latestBatch.save();
                         }
                    }
               }
          }

          order.status = 'Cancelled';
          await order.save();

          return NextResponse.json({
               success: true,
               message: 'Order cancelled successfully',
               data: order
          });
     } catch (error) {
          console.error("Customer Order DELETE Error:", error);
          return NextResponse.json({
               success: false,
               error: error.message
          }, { status: 500 });
     }
}
