import { NextResponse } from 'next/server';
import dbConnect from '@/lib/admin/db';
import VendorStock from '@/models/VendorStock';
import Vendor from '@/models/Vendor';
import Order from '@/models/Order'; // Import Order for stats
import { getAuthenticatedUser } from '@/lib/admin/api-auth';

export async function GET(req) {
     try {
          await dbConnect();
          const user = await getAuthenticatedUser();
          const allowedRoles = ['admin', 'system_admin', 'owner', 'vendor'];

          if (!user || !allowedRoles.includes(user.role)) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const { searchParams } = new URL(req.url);
          let vendorId = searchParams.get('vendorId');

          // 1. Determine Target Vendor ID(s)
          let targetVendorIds = [];

          if (user.role === 'vendor') {
               // Vendors can ONLY fetch their own stock
               const myVendor = await Vendor.findOne({ userId: user._id });
               if (!myVendor) {
                    return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
               }
               // Force override any requested vendorId
               vendorId = myVendor._id.toString();
               targetVendorIds = [myVendor._id];
          } else {
               // Admin: Can filter by specific vendorId OR see all
               if (vendorId) {
                    targetVendorIds = [vendorId];
               }
          }


          // 2. Build Queries
          const stockQuery = {};
          const orderQuery = { status: { $nin: ['Cancelled', 'Returns', 'Pending'] } }; // "Total Order" usually implies valid business. 

          const mongoose = require('mongoose');
          const ObjectId = mongoose.Types.ObjectId;
          const Product = require('@/models/Product').default; // Import Product dynamically

          if (vendorId) {
               // Ensure ObjectId casting for Aggregation Pipeline
               const vId = new ObjectId(vendorId);
               stockQuery.vendor = vId;
               orderQuery.vendor = vId;
          }

          const search = searchParams.get('search');
          if (search) {
               // Find products matching the search
               const products = await Product.find({
                    name: { $regex: search, $options: 'i' }
               }).select('_id');

               const productIds = products.map(p => p._id);
               stockQuery.product = { $in: productIds };
          }

          // 3. Fetch Data in Parallel
          const [stocks, statsArray] = await Promise.all([
               VendorStock.find(stockQuery)
                    .populate('vendor', 'name companyName')
                    .populate('product', 'name')
                    .populate('variant', 'name')
                    .populate('batch', 'batchNo productionDate expiryDate') // Populate dates
                    .sort({ receivedAt: -1 }),

               // Aggregate Stats
               (async () => {
                    const now = new Date();

                    // Parallel Aggregation
                    const [stockStats, orderStats, expiredStats] = await Promise.all([
                         // Total Stock
                         VendorStock.aggregate([
                              { $match: stockQuery },
                              { $group: { _id: null, total: { $sum: "$quantity" } } }
                         ]),
                         // Total Orders & Revenue
                         Order.aggregate([
                              { $match: orderQuery },
                              {
                                   $group: {
                                        _id: null,
                                        count: { $sum: 1 },
                                        revenue: { $sum: "$totalAmount" }
                                   }
                              }
                         ]),
                         // Expired Stock
                         // We need to look up the batch to check expiry date
                         VendorStock.aggregate([
                              { $match: stockQuery },
                              {
                                   $lookup: {
                                        from: "batches",
                                        localField: "batch",
                                        foreignField: "_id",
                                        as: "batchInfo"
                                   }
                              },
                              { $unwind: "$batchInfo" }, // Unwind batch array
                              {
                                   $match: {
                                        "batchInfo.expiryDate": { $lt: now } // Check expiry
                                   }
                              },
                              { $group: { _id: null, total: { $sum: "$quantity" } } }
                         ])
                    ]);

                    return {
                         totalStock: stockStats[0]?.total || 0,
                         totalOrders: orderStats[0]?.count || 0,
                         totalRevenue: orderStats[0]?.revenue || 0,
                         expiredStock: expiredStats[0]?.total || 0
                    };
               })()
          ]);

          return NextResponse.json({
               success: true,
               stocks,
               stats: statsArray
          });

     } catch (error) {
          console.error("Vendor Stock API Error:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
