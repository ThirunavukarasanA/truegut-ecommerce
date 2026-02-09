
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/admin/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Customer from '@/models/Customer';
import TempCustomer from '@/models/TempCustomer';
import { StockManager } from '@/lib/inventory/stock-manager';
import { encrypt, decrypt } from '@/lib/encryption';
import bcrypt from 'bcryptjs';

// Helper to generate random password
const generatePassword = () => {
     return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
};

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

          const data = orderId ? orders[0] : orders;

          return NextResponse.json({ success: true, data });
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
          const { default: Batch } = await import('@/models/Batch');
          const { default: Variant } = await import('@/models/Variant');
          const { default: Pincode } = await import('@/models/Pincode');
          const { default: VendorStock } = await import('@/models/VendorStock');

          // Read and Decrypt Request
          const rawBody = await req.json();
          // Decryption disabled temporarily
          const body = rawBody;

          // Validate required fields
          if (!body.customer?.email || !body.customer?.name) {
               return NextResponse.json({
                    success: false,
                    error: 'Customer information is required'
               }, { status: 400 });
          }

          // Address Validation
          const { address } = body.customer;
          if (!address || !address.street || !address.city || !address.pincode || !body.customer.phone) {
               return NextResponse.json({
                    success: false,
                    error: 'Complete shipping address and phone number are required'
               }, { status: 400 });
          }

          if (!body.items || body.items.length === 0) {
               return NextResponse.json({
                    success: false,
                    error: 'Order must contain at least one item'
               }, { status: 400 });
          }

          // --- CUSTOMER CREATION LOGIC ---
          let customerId = null;
          let newPassword = null;

          // Check if customer exists
          let customer = await Customer.findOne({ email: body.customer.email });

          if (!customer) {
               // Create new Customer
               newPassword = generatePassword();
               const hashedPassword = await bcrypt.hash(newPassword, 10);

               customer = await Customer.create({
                    name: body.customer.name,
                    email: body.customer.email,
                    password: hashedPassword,
                    phone: body.customer.phone,
                    address: JSON.stringify(body.customer.address)
               });

               // TODO: Send Welcome Email
          }
          customerId = customer._id;

          // Check Vendor Assignment
          let assignedVendorId = null;
          const pincodeDoc = await Pincode.findOne({ pincode: address.pincode, isServiceable: true });
          if (pincodeDoc) {
               if (pincodeDoc.assignedToVendor) {
                    assignedVendorId = pincodeDoc.assignedToVendor;
               }
          } else {
               // STRICT LOGIC: If pincode not in DB, it's NOT serviceable for orders
               return NextResponse.json({
                    success: false,
                    error: `Sorry, we do not currently service the pincode ${address.pincode}. Please request a restock.`
               }, { status: 400 });
          }

          // Validate and prepare items
          let calculatedTotal = 0;
          const processedItems = [];

          // Helper: Stock Manager
          const stockManager = new StockManager();

          try {
               for (const item of body.items) {
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

                    if (product.status === 'archived' || !variant.isActive) {
                         return NextResponse.json({
                              success: false,
                              error: `Product ${product.name} (${variant.name}) is not available`
                         }, { status: 400 });
                    }

                    // Strict Price Check
                    if (item.price && item.price !== variant.price) {
                         return NextResponse.json({
                              success: false,
                              error: `Price mismatch for ${product.name} - ${variant.name}. Please refresh your cart.`
                         }, { status: 400 });
                    }

                    // Deduct Stock
                    const deductionResult = await stockManager.deductStockForItems([
                         { variant: variant, quantity: item.quantity }
                    ], assignedVendorId);

                    const usedBatches = deductionResult[0].batches;

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
                         price: variant.price,
                         batches: usedBatches
                    };

                    calculatedTotal += variant.price * item.quantity;
                    processedItems.push(processedItem);
               }

          } catch (processError) {
               await stockManager.rollback();
               return NextResponse.json({ success: false, error: processError.message }, { status: 400 });
          }

          // Payment Status Logic
          let paymentStatus = 'Pending';
          if (body.paymentDetails?.method === 'Online' || body.paymentDetails?.transactionId) {
               paymentStatus = body.paymentDetails.transactionId ? 'Paid' : 'Pending';
          }

          // Create order
          const orderData = {
               customer: body.customer,
               items: processedItems,
               totalAmount: calculatedTotal,
               status: 'Pending',
               paymentStatus,
               paymentDetails: body.paymentDetails || {},
               notes: body.notes || '',
               vendor: assignedVendorId
          };

          const order = await Order.create(orderData);
          await order.populate([
               { path: 'items.product', select: 'name images' },
               { path: 'items.variant', select: 'name sku' }
          ]);

          // Clean Temp Data
          try {
               const { cookies } = await import("next/headers");
               const { default: TempCart } = await import('@/models/TempCart');
               const cookieStore = await cookies();
               const sessionId = cookieStore.get("cart_session_id")?.value;
               if (sessionId) {
                    await TempCart.deleteOne({ sessionId });
                    await TempCustomer.deleteOne({ sessionId });
               }
          } catch (cartError) {
               console.error("Failed to clear temp data:", cartError);
          }

          // Send Email (Async)
          try {
               const { sendEmail } = await import('@/lib/admin/email');
               const { orderConfirmationTemplate } = await import('@/lib/admin/email-templates');

               const emailOrderData = {
                    customerName: order.customer.name,
                    orderId: order._id.toString(),
                    items: order.items.map(item => ({
                         productName: item.productSnapshot?.name || 'Product',
                         variantName: item.productSnapshot?.variantName || '',
                         quantity: item.quantity,
                         price: item.price
                    })),
                    totalAmount: order.totalAmount
               };

               await sendEmail({
                    to: order.customer.email,
                    subject: `Order Confirmation #${order._id.toString().slice(-6).toUpperCase()}`,
                    html: orderConfirmationTemplate(emailOrderData)
               });
          } catch (emailError) {
               console.error("Order Email Failed:", emailError);
          }

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

          // Restore stock logic... (Truncated for brevity, assuming existing logic persists if I don't change it. 
          // Wait, write_to_file OVERWRITES. I need to include the logic.)

          const { default: Batch } = await import('@/models/Batch');
          const { default: VendorStock } = await import('@/models/VendorStock');

          for (const item of order.items) {
               if (item.batches && item.batches.length > 0) {
                    for (const batchRecord of item.batches) {
                         if (order.vendor) {
                              const vStock = await VendorStock.findOne({
                                   vendor: order.vendor,
                                   batch: batchRecord.batch
                              });

                              if (vStock) {
                                   vStock.quantity += batchRecord.quantity;
                                   await vStock.save();
                              } else {
                                   await Batch.findByIdAndUpdate(batchRecord.batch, {
                                        $inc: { quantity: batchRecord.quantity }
                                   });
                              }
                         } else {
                              await Batch.findByIdAndUpdate(batchRecord.batch, {
                                   $inc: { quantity: batchRecord.quantity }
                              });
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
