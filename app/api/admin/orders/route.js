import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { getAuthenticatedUser } from '@/lib/api-auth';

// Admin: Get all orders with advanced filtering
export async function GET(req) {
     const user = await getAuthenticatedUser();
     if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

     await dbConnect();
     try {
          const { searchParams } = new URL(req.url);
          const status = searchParams.get('status');
          const search = searchParams.get('search');
          const paymentStatus = searchParams.get('paymentStatus');
          const startDate = searchParams.get('startDate');
          const endDate = searchParams.get('endDate');
          const vendor = searchParams.get('vendor');

          let query = {};

          if (status && status !== 'All') {
               query.status = status;
          }

          if (paymentStatus && paymentStatus !== 'All') {
               query.paymentStatus = paymentStatus;
          }

          if (vendor) {
               query.vendor = vendor;
          }

          if (search) {
               // Search by customer name, email, order ID, or tracking number
               query.$or = [
                    { 'customer.name': { $regex: search, $options: 'i' } },
                    { 'customer.email': { $regex: search, $options: 'i' } },
                    { trackingNumber: { $regex: search, $options: 'i' } },
                    { _id: search.match(/^[0-9a-fA-F]{24}$/) ? search : null }
               ];
          }

          // Date range filtering
          if (startDate || endDate) {
               query.createdAt = {};
               if (startDate) query.createdAt.$gte = new Date(startDate);
               if (endDate) query.createdAt.$lte = new Date(endDate);
          }

          const orders = await Order.find(query)
               .populate('items.product', 'name images category')
               .populate('items.variant', 'name sku')
               .populate('vendor', 'name email phone')
               .sort('-createdAt');

          return NextResponse.json({ success: true, data: orders });
     } catch (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
     }
}

// Admin: Create manual order
export async function POST(req) {
     const user = await getAuthenticatedUser();
     if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

     await dbConnect();
     try {
          // Import models dynamically if needed
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

          // Create product snapshots and handle stock reduction
          let calculatedTotal = 0;
          const processedItems = [];

          for (const item of body.items) {
               if (!item.variant) {
                    return NextResponse.json({ success: false, error: 'Item variant is required' }, { status: 400 });
               }

               const variant = await Variant.findById(item.variant).populate('product');
               if (!variant || !variant.product) {
                    return NextResponse.json({ success: false, error: `Variant/Product not found` }, { status: 400 });
               }
               const product = variant.product;

               // Admin override: Assuming admin implies checking availability but allowing force?
               // Let's stick to standard logic for now to ensure data integrity with batches.

               // 1. Check Total Stock
               const batches = await Batch.find({
                    variant: variant._id,
                    status: 'active',
                    expiryDate: { $gt: new Date() },
                    quantity: { $gt: 0 }
               }).sort({ expiryDate: 1 });

               const totalAvailable = batches.reduce((sum, b) => sum + b.quantity, 0);

               if (totalAvailable < item.quantity) {
                    return NextResponse.json({
                         success: false,
                         error: `Insufficient stock for ${product.name} - ${variant.name}. Available: ${totalAvailable}`
                    }, { status: 400 });
               }

               // 2. Deduct Stock
               let remainingToDeduct = item.quantity;
               const usedBatches = [];

               for (const batch of batches) {
                    if (remainingToDeduct <= 0) break;
                    const take = Math.min(batch.quantity, remainingToDeduct);
                    batch.quantity -= take;
                    remainingToDeduct -= take;
                    usedBatches.push({ batch: batch._id, quantity: take });
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
                    // Use provided price or variant price
                    price: item.price !== undefined ? item.price : variant.price,
                    batches: usedBatches
               };

               calculatedTotal += processedItem.price * item.quantity;
               processedItems.push(processedItem);
          }

          // Use provided total or calculated total
          if (!body.totalAmount) {
               body.totalAmount = calculatedTotal;
          }

          const orderData = {
               ...body,
               items: processedItems,
               totalAmount: body.totalAmount
          };

          const order = await Order.create(orderData);

          // Populate the created order before returning
          await order.populate([
               { path: 'items.product', select: 'name images' },
               { path: 'items.variant', select: 'name sku' }
          ]);

          return NextResponse.json({
               success: true,
               data: order,
               message: 'Order created successfully'
          }, { status: 201 });
     } catch (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 400 });
     }
}

// Admin: Update order (status, payment, tracking, etc.)
export async function PATCH(req) {
     const user = await getAuthenticatedUser();
     if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

     await dbConnect();
     try {
          const { searchParams } = new URL(req.url);
          const orderId = searchParams.get('orderId');
          const body = await req.json();

          if (!orderId) {
               return NextResponse.json({
                    success: false,
                    error: 'Order ID is required'
               }, { status: 400 });
          }

          const order = await Order.findById(orderId);

          if (!order) {
               return NextResponse.json({
                    success: false,
                    error: 'Order not found'
               }, { status: 404 });
          }

          // Update allowed fields
          if (body.status) order.status = body.status;
          if (body.paymentStatus) order.paymentStatus = body.paymentStatus;
          if (body.trackingNumber) order.trackingNumber = body.trackingNumber;
          if (body.notes) order.notes = body.notes;
          if (body.vendor) order.vendor = body.vendor;

          // Update payment details
          if (body.paymentDetails) {
               order.paymentDetails = {
                    ...order.paymentDetails,
                    ...body.paymentDetails
               };

               // Set payment date if status changed to Paid
               if (body.paymentStatus === 'Paid' && !order.paymentDetails.paidAt) {
                    order.paymentDetails.paidAt = new Date();
               }

               // Set refund date if status changed to Refunded
               if (body.paymentStatus === 'Refunded' && !order.paymentDetails.refundedAt) {
                    order.paymentDetails.refundedAt = new Date();
               }
          }

          await order.save();
          await order.populate([
               { path: 'items.product', select: 'name images' },
               { path: 'items.variant', select: 'name sku' }
          ]);

          return NextResponse.json({
               success: true,
               data: order,
               message: 'Order updated successfully'
          });
     } catch (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
     }
}

// Admin: Delete order (soft delete by marking as cancelled)
export async function DELETE(req) {
     const user = await getAuthenticatedUser();
     if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

     await dbConnect();
     try {
          const { searchParams } = new URL(req.url);
          const orderId = searchParams.get('orderId');
          const { default: Batch } = await import('@/models/Batch');

          if (!orderId) {
               return NextResponse.json({
                    success: false,
                    error: 'Order ID is required'
               }, { status: 400 });
          }

          const order = await Order.findById(orderId);

          if (!order) {
               return NextResponse.json({
                    success: false,
                    error: 'Order not found'
               }, { status: 404 });
          }

          // Restore stock if order was not already cancelled
          if (order.status !== 'Cancelled') {
               for (const item of order.items) {
                    if (item.batches && item.batches.length > 0) {
                         for (const batchRecord of item.batches) {
                              await Batch.findByIdAndUpdate(batchRecord.batch, {
                                   $inc: { quantity: batchRecord.quantity }
                              });
                         }
                    } else if (item.variant) {
                         // Fallback logic
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
               message: 'Order cancelled successfully'
          });
     } catch (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
     }
}
