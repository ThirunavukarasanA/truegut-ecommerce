import { NextResponse } from 'next/server';
import dbConnect from '@/lib/admin/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { getAuthenticatedUser } from '@/lib/admin/api-auth';
import mongoose from 'mongoose';

// Admin: Get all orders with advanced filtering
export async function GET(req) {
     const user = await getAuthenticatedUser();
     if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

     await dbConnect();
     mongoose.set('strictPopulate', false);

     try {
          const isVendor = user.role === 'vendor';
          let vendorId = null;
          if (isVendor) {
               const { default: Vendor } = await import('@/models/Vendor');
               const vendorProfile = await Vendor.findOne({ userId: user._id });
               vendorId = vendorProfile?._id;
               if (!vendorId) {
                    return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
               }
          }

          const { searchParams } = new URL(req.url);
          const orderId = searchParams.get('orderId');
          const status = searchParams.get('status');
          const search = searchParams.get('search');
          const paymentStatus = searchParams.get('paymentStatus');
          const startDate = searchParams.get('startDate');
          const endDate = searchParams.get('endDate');
          const vendor = searchParams.get('vendor');
          const page = parseInt(searchParams.get('page')) || 1;
          const limit = parseInt(searchParams.get('limit')) || 20;
          const skip = (page - 1) * limit;

          let query = {};

          if (orderId) {
               if (!mongoose.Types.ObjectId.isValid(orderId)) {
                    return NextResponse.json({ error: 'Invalid Order ID format' }, { status: 400 });
               }
               query._id = orderId;
          }

          if (status && status !== 'All') {
               query.status = status;
          }

          if (paymentStatus && paymentStatus !== 'All') {
               query.paymentStatus = paymentStatus;
          }

          if (isVendor) {
               query.vendor = vendorId;
          } else if (vendor) {
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

          const [orders, total] = await Promise.all([
               Order.find(query)
                    .populate('items.product', 'name images category')
                    .populate('items.variant', 'name sku')
                    .populate('vendor', 'name email phone')
                    .sort('-createdAt')
                    .skip(skip)
                    .limit(limit),
               Order.countDocuments(query)
          ]);

          return NextResponse.json({
               success: true,
               data: orders,
               pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total,
                    limit
               }
          });
     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}

// Admin: Create manual order
export async function POST(req) {
     const user = await getAuthenticatedUser();
     if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

     await dbConnect();
     const session = await mongoose.startSession();
     session.startTransaction();

     try {
          // Import models dynamically if needed
          const { default: Batch } = await import('@/models/Batch');
          const { default: Variant } = await import('@/models/Variant');

          const body = await req.json();

          // Validate required fields
          if (!body.customer?.email || !body.customer?.name) {
               return NextResponse.json({
                    error: 'Customer information is required'
               }, { status: 400 });
          }

          if (!body.items || body.items.length === 0) {
               return NextResponse.json({
                    error: 'Order must contain at least one item'
               }, { status: 400 });
          }

          // Create product snapshots and handle stock reduction
          let calculatedTotal = 0;
          const processedItems = [];

          for (const item of body.items) {
               if (!item.variant) {
                    throw new Error('Item variant is required');
               }

               const variant = await Variant.findById(item.variant).populate('product').session(session);
               if (!variant || !variant.product) {
                    throw new Error(`Variant/Product not found`);
               }
               const product = variant.product;

               // 1. Check Total Stock
               const batches = await Batch.find({
                    variant: variant._id,
                    status: 'active',
                    expiryDate: { $gt: new Date() },
                    quantity: { $gt: 0 }
               }).sort({ expiryDate: 1 }).session(session);

               const totalAvailable = batches.reduce((sum, b) => sum + b.quantity, 0);

               if (totalAvailable < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name} - ${variant.name}. Available: ${totalAvailable}`);
               }

               // 2. Deduct Stock
               let remainingToDeduct = item.quantity;
               const usedBatches = [];

               for (const batch of batches) {
                    if (remainingToDeduct <= 0) break;
                    const take = Math.min(batch.quantity, remainingToDeduct);

                    // Atomic update for each batch within the transaction
                    batch.quantity -= take;
                    remainingToDeduct -= take;
                    usedBatches.push({ batch: batch._id, quantity: take });
                    await batch.save({ session });
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

          const [order] = await Order.create([orderData], { session });

          // Commit transaction
          await session.commitTransaction();
          session.endSession();

          // Populate the created order before returning (outside session is fine, or separate query)
          await Order.populate(order, [
               { path: 'items.product', select: 'name images' },
               { path: 'items.variant', select: 'name sku' }
          ]);

          return NextResponse.json({
               success: true,
               data: order[0], // Order is an array when created via 'create([data], {session})'
               message: 'Order created successfully'
          }, { status: 201 });

     } catch (error) {
          await session.abortTransaction();
          session.endSession();
          return NextResponse.json({ error: error.message }, { status: 400 });
     }
}

// Admin: Update order (status, payment, tracking, etc.)
export async function PATCH(req) {
     const user = await getAuthenticatedUser();
     if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

     await dbConnect();
     try {
          const { searchParams } = new URL(req.url);
          const orderId = searchParams.get('orderId');
          const body = await req.json();

          if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
               return NextResponse.json({
                    error: 'Valid Order ID is required'
               }, { status: 400 });
          }

          const order = await Order.findById(orderId);

          if (!order) {
               return NextResponse.json({
                    error: 'Order not found'
               }, { status: 404 });
          }

          // Check permissions for vendor
          if (user.role === 'vendor') {
               const { default: Vendor } = await import('@/models/Vendor');
               const vendorProfile = await Vendor.findOne({ userId: user._id });
               if (!order.vendor || order.vendor.toString() !== vendorProfile?._id.toString()) {
                    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
               }
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
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}

// Admin: Delete order (soft delete by marking as cancelled)
export async function DELETE(req) {
     const user = await getAuthenticatedUser();
     if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

     await dbConnect();
     const session = await mongoose.startSession();
     session.startTransaction();

     try {
          const { searchParams } = new URL(req.url);
          const orderId = searchParams.get('orderId');
          const { default: Batch } = await import('@/models/Batch');

          if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
               return NextResponse.json({
                    error: 'Valid Order ID is required'
               }, { status: 400 });
          }

          const order = await Order.findById(orderId).session(session);

          if (!order) {
               return NextResponse.json({ error: 'Order not found' }, { status: 404 });
          }

          // Check permissions for vendor
          if (user.role === 'vendor') {
               const { default: Vendor } = await import('@/models/Vendor');
               const vendorProfile = await Vendor.findOne({ userId: user._id });
               if (!order.vendor || order.vendor.toString() !== vendorProfile?._id.toString()) {
                    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
               }
          }


          // Restore stock if order was not already cancelled
          if (order.status !== 'Cancelled') {
               const { default: VendorStock } = await import('@/models/VendorStock');

               for (const item of order.items) {
                    if (item.batches && item.batches.length > 0) {
                         for (const batchRecord of item.batches) {
                              if (order.vendor) {
                                   // Restore to Vendor Stock
                                   const vStock = await VendorStock.findOne({
                                        vendor: order.vendor,
                                        batch: batchRecord.batch
                                   }).session(session);

                                   if (vStock) {
                                        vStock.quantity += batchRecord.quantity;
                                        await vStock.save({ session });
                                   } else {
                                        // Fallback to Warehouse if VM entry missing
                                        await Batch.findByIdAndUpdate(batchRecord.batch, {
                                             $inc: { quantity: batchRecord.quantity }
                                        }, { session });
                                   }
                              } else {
                                   // Warehouse Restore
                                   await Batch.findByIdAndUpdate(batchRecord.batch, {
                                        $inc: { quantity: batchRecord.quantity }
                                   }, { session });
                              }
                         }
                    } else if (item.variant) {
                         // Fallback logic
                         if (order.vendor) {
                              const latestVStock = await VendorStock.findOne({
                                   vendor: order.vendor,
                                   variant: item.variant
                              }).sort({ receivedAt: -1 }).session(session);

                              if (latestVStock) {
                                   latestVStock.quantity += item.quantity;
                                   await latestVStock.save({ session });
                              } // If no vstock, ignore or fallback? Safe to ignore for untracked legacy.
                         } else {
                              const latestBatch = await Batch.findOne({
                                   variant: item.variant,
                                   status: 'active'
                              }).sort({ expiryDate: -1 }).session(session);

                              if (latestBatch) {
                                   latestBatch.quantity += item.quantity;
                                   await latestBatch.save({ session });
                              }
                         }
                    }
               }
          }

          order.status = 'Cancelled';
          await order.save({ session });

          await session.commitTransaction();
          session.endSession();

          return NextResponse.json({
               success: true,
               message: 'Order cancelled successfully'
          });
     } catch (error) {
          await session.abortTransaction();
          session.endSession();
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
