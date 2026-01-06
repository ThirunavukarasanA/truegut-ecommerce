import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Batch from "@/models/Batch";
import Product from "@/models/Product"; // For population
import Variant from "@/models/Variant"; // For population
import { getAuthenticatedUser } from "@/lib/api-auth";

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

          const batches = await Batch.find(query)
               .populate('product', 'name')
               .populate('variant', 'name')
               .sort({ createdAt: -1 });

          return NextResponse.json({ success: true, data: batches });
     } catch (error) {
          console.error("Stock API Error:", error);
          return NextResponse.json({ success: false, error: "Failed to fetch stock" }, { status: 500 });
     }
}

export async function POST(req) {
     try {
          const user = await getAuthenticatedUser();
          if (!user) {
               return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
          }

          await dbConnect();
          const body = await req.json();

          const { product, variant, batchNo, expiryDate, quantity, productionDate } = body;

          // Validation
          if (!product || !variant || !batchNo || !expiryDate || !quantity) {
               return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
          }

          // Check for duplicate batch No
          const existingBatch = await Batch.findOne({ batchNo });
          if (existingBatch) {
               return NextResponse.json({ success: false, error: "Batch number already exists" }, { status: 400 });
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
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
     }
}

export async function PUT(req) {
     try {
          const user = await getAuthenticatedUser();
          if (!user) {
               return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
          }

          await dbConnect();
          const body = await req.json();
          const { batchId, quantity } = body;

          if (!batchId || !quantity) {
               return NextResponse.json({ success: false, error: "Batch ID and Quantity are required" }, { status: 400 });
          }

          const batch = await Batch.findById(batchId);
          if (!batch) {
               return NextResponse.json({ success: false, error: "Batch not found" }, { status: 404 });
          }

          if (batch.status === 'expired') {
               return NextResponse.json({ success: false, error: "Cannot add stock to expired batch" }, { status: 400 });
          }

          batch.quantity += parseInt(quantity);
          await batch.save();

          return NextResponse.json({ success: true, data: batch });
     } catch (error) {
          console.error("Stock Update Error:", error);
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
     }
}
