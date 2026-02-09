import { NextResponse } from 'next/server';
import dbConnect from '@/lib/admin/db';
import Batch from '@/models/Batch';
import VendorStock from '@/models/VendorStock';
import { getAuthenticatedUser } from '@/lib/admin/api-auth';

export async function GET(req) {
     const user = await getAuthenticatedUser();
     if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

     await dbConnect();
     try {
          const stocks = await VendorStock.find()
               .populate('vendor', 'name companyName email')
               .populate('batch', 'batchNo')
               .populate('product', 'name')
               .populate('variant', 'name sku') // Populate variant SKU/Name
               .sort('-createdAt');

          return NextResponse.json({ success: true, data: stocks });
     } catch (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
     }
}

export async function POST(req) {
     try {
          await dbConnect();
          const user = await getAuthenticatedUser();
          const allowedRoles = ['admin', 'system_admin', 'owner'];

          if (!user || !allowedRoles.includes(user.role)) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const { vendorId, batchId, quantity } = await req.json();

          if (!vendorId || !batchId || !quantity || quantity <= 0) {
               return NextResponse.json({ error: 'Invalid allocation data' }, { status: 400 });
          }

          // Fetch Batch
          const batch = await Batch.findById(batchId);
          if (!batch) {
               return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
          }

          if (batch.quantity < quantity) {
               return NextResponse.json({ error: `Insufficient batch quantity. Available: ${batch.quantity}` }, { status: 400 });
          }

          if (batch.status === 'expired' || batch.status === 'recalled') {
               return NextResponse.json({ error: 'Cannot allocate from expired or recalled batch' }, { status: 400 });
          }

          // Decrement Batch Stock
          batch.quantity -= quantity;
          await batch.save();

          // ALWAYS Create New Vendor Stock Record (No Upsert)
          await VendorStock.create({
               vendor: vendorId,
               batch: batchId,
               product: batch.product,
               variant: batch.variant,
               quantity: parseInt(quantity)
          });

          return NextResponse.json({ success: true, message: 'Stock allocated successfully' });

     } catch (error) {
          console.error("Stock Allocation Error:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
