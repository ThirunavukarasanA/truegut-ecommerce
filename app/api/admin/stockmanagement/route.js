import { NextResponse } from "next/server";
import dbConnect from "@/lib/admin/db";
import Batch from "@/models/Batch";
import VendorStock from "@/models/VendorStock";
import Product from "@/models/Product"; // For population
import Variant from "@/models/Variant"; // For population
import { getAuthenticatedUser } from "@/lib/admin/api-auth";

export async function GET(req) {
     try {
          // Auth check
          const user = await getAuthenticatedUser();
          if (!user) {
               return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
          }

          await dbConnect();

          const { searchParams } = new URL(req.url);
          const search = searchParams.get("search");
          const page = parseInt(searchParams.get('page')) || 1;
          const limit = parseInt(searchParams.get('limit')) || 20;
          const skip = (page - 1) * limit;

          let query = {};
          if (search) {
               query = {
                    $or: [
                         { batchNo: { $regex: search, $options: "i" } },
                         { status: { $regex: search, $options: "i" } }
                    ]
               };
          }

          // Auto-expire batches
          const now = new Date();
          await Batch.updateMany(
               {
                    expiryDate: { $lt: now },
                    status: 'active'
               },
               { $set: { status: 'expired' } }
          );

          // Calculate Stats (Aggregation)
          const statsAggregation = await Batch.aggregate([
               {
                    $lookup: {
                         from: 'vendorstocks',
                         localField: '_id',
                         foreignField: 'batch',
                         as: 'allocatedStock'
                    }
               },
               {
                    $addFields: {
                         allocatedQuantity: { $sum: "$allocatedStock.quantity" }
                    }
               },
               {
                    $group: {
                         _id: null,
                         totalPhysical: {
                              $sum: { $cond: [{ $eq: ["$status", "active"] }, "$quantity", 0] }
                         },
                         totalAllocated: {
                              $sum: { $cond: [{ $eq: ["$status", "active"] }, "$allocatedQuantity", 0] }
                         },
                         expiredStock: {
                              $sum: { $cond: [{ $eq: ["$status", "expired"] }, "$quantity", 0] }
                         },
                         expiredBatchesCount: {
                              $sum: { $cond: [{ $eq: ["$status", "expired"] }, 1, 0] }
                         },
                         lowStockBatches: {
                              $sum: {
                                   $cond: [
                                        { $and: [{ $eq: ["$status", "active"] }, { $lt: ["$quantity", 10] }] },
                                        1,
                                        0
                                   ]
                              }
                         }
                    }
               }
          ]);

          const statsRaw = statsAggregation[0] || {
               totalPhysical: 0,
               totalAllocated: 0,
               expiredStock: 0,
               expiredBatchesCount: 0,
               lowStockBatches: 0
          };

          const stats = {
               ...statsRaw,
               totalStock: statsRaw.totalPhysical + statsRaw.totalAllocated
          };

          // Main data aggregation with join
          const aggregateQuery = [
               { $match: query },
               {
                    $lookup: {
                         from: 'vendorstocks',
                         localField: '_id',
                         foreignField: 'batch',
                         as: 'vendorAssignments'
                    }
               },
               {
                    $addFields: {
                         allocatedQuantity: { $sum: "$vendorAssignments.quantity" }
                    }
               },
               { $sort: { createdAt: -1 } },
               { $skip: skip },
               { $limit: limit }
          ];

          const [batchesRaw, total] = await Promise.all([
               Batch.aggregate(aggregateQuery),
               Batch.countDocuments(query)
          ]);

          // Manually populate results from aggregate
          const batches = await Batch.populate(batchesRaw, [
               { path: 'product', select: 'name' },
               { path: 'variant', select: 'name' }
          ]);

          return NextResponse.json({
               success: true,
               data: batches,
               pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total,
                    limit
               },
               stats
          });
     } catch (error) {
          console.error("Stock API Error:", error);
          return NextResponse.json({ error: "Failed to fetch stock" }, { status: 500 });
     }
}

export async function POST(req) {
     try {
          const user = await getAuthenticatedUser();
          if (!user) {
               return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
          }

          await dbConnect();
          const body = await req.json();

          const { product, variant, batchNo, expiryDate, quantity, productionDate } = body;

          // Validation
          if (!product || !variant || !batchNo || !expiryDate || !quantity) {
               return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
          }

          // Check for duplicate batch No
          const existingBatch = await Batch.findOne({ batchNo });
          if (existingBatch) {
               return NextResponse.json({ error: "Batch number already exists" }, { status: 400 });
          }

          const batch = await Batch.create({
               product,
               variant,
               batchNo,
               productionDate,
               expiryDate,
               quantity: parseInt(quantity),
               status: 'active'
          });

          return NextResponse.json({ success: true, data: batch });
     } catch (error) {
          console.error("Batch Creation Error:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}

export async function PUT(req) {
     try {
          const user = await getAuthenticatedUser();
          if (!user) {
               return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
          }

          await dbConnect();
          const body = await req.json();
          const { batchId, quantity } = body;

          if (!batchId || !quantity) {
               return NextResponse.json({ error: "Batch ID and Quantity are required" }, { status: 400 });
          }

          const batchToCheck = await Batch.findById(batchId);
          if (!batchToCheck) {
               return NextResponse.json({ error: "Batch not found" }, { status: 404 });
          }

          if (batchToCheck.status === 'expired') {
               return NextResponse.json({ error: "Cannot add stock to expired batch" }, { status: 400 });
          }

          // Atomic update using $inc
          const updatedBatch = await Batch.findByIdAndUpdate(
               batchId,
               { $inc: { quantity: parseInt(quantity) } },
               { new: true }
          ).populate('product', 'name').populate('variant', 'name');

          return NextResponse.json({ success: true, data: updatedBatch });
     } catch (error) {
          console.error("Stock Update Error:", error);
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
     }
}
