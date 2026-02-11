import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/admin/db';
import Order from '@/models/Order';
import Vendor from '@/models/Vendor';
import { getAuthenticatedUser } from '@/lib/admin/api-auth'; // reusing this helper i wrote for /me

export async function GET(req) {
     try {
          await dbConnect();
          // Force disable strictPopulate to handle any stale model caching in dev server
          mongoose.set('strictPopulate', false);

          const user = await getAuthenticatedUser();

          if (!user) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const { searchParams } = new URL(req.url);
          const filterVendorId = searchParams.get('vendorId');

          let query = {};

          if (user.role === 'vendor') {
               const vendor = await Vendor.findOne({ connectedUser: user.id });
               if (!vendor) {
                    return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
               }
               query = { vendor: vendor._id };
          } else if (['admin', 'system_admin', 'owner'].includes(user.role)) {
               // Admin can see all orders that have a vendor assigned
               // If filterVendorId is provided, filter by it. Otherwise show all assigned.
               if (filterVendorId) {
                    query = { vendor: filterVendorId };
               } else {
                    query = { vendor: { $exists: true, $ne: null } };
               }
          } else {
               return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
          }

          const orders = await Order.find(query)
               .populate('customer', 'name email phone')
               .populate('items.product', 'name images')
               .populate('items.variant', 'name')
               .populate('vendor', 'name companyName')
               .sort({ createdAt: -1 });

          return NextResponse.json({ success: true, orders });

     } catch (error) {
          console.error("Error fetching vendor orders:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}

export async function PATCH(req) {
     try {
          await dbConnect();
          // Force disable strictPopulate to handle any stale model caching in dev server
          mongoose.set('strictPopulate', false);

          const user = await getAuthenticatedUser();

          if (!user) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const body = await req.json();
          const { orderId, courierName, trackingId, trackingUrl, driverName, driverPhone, transportMode } = body;

          const order = await Order.findById(orderId);
          if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

          // Authorization Check
          if (user.role === 'vendor') {
               const vendor = await Vendor.findOne({ connectedUser: user.id });
               if (!vendor || order.vendor?.toString() !== vendor._id.toString()) {
                    return NextResponse.json({ error: 'Unauthorized to manage this order' }, { status: 403 });
               }
          }

          // Update Delivery Details
          // We assume 'shippedAt' is set when tracking is added if not already set?
          // Or we just update details.

          const updateData = {
               'deliveryDetails.courierName': courierName,
               'deliveryDetails.trackingId': trackingId,
               'deliveryDetails.trackingUrl': trackingUrl,
               'deliveryDetails.driverName': driverName,
               'deliveryDetails.driverPhone': driverPhone,
               'deliveryDetails.transportMode': transportMode
          };

          const updatedOrder = await Order.findByIdAndUpdate(
               orderId,
               { $set: updateData },
               { new: true }
          );

          return NextResponse.json({ success: true, order: updatedOrder });

     } catch (error) {
          console.error("Error updating delivery details:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
