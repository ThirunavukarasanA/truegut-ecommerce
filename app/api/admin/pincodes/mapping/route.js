import { NextResponse } from 'next/server';
import dbConnect from '@/lib/admin/db';
import Pincode from '@/models/Pincode';
import Vendor from '@/models/Vendor';
import { getAuthenticatedUser } from '@/lib/admin/api-auth';

export async function GET(req) {
     // Fetch Pincodes with Vendor Info
     try {
          await dbConnect();
          const user = await getAuthenticatedUser();
          const allowedRoles = ['admin', 'system_admin', 'owner'];

          if (!user || !allowedRoles.includes(user.role)) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const { searchParams } = new URL(req.url);
          const state = searchParams.get('state'); // Deprecated, but keeping for fallback
          const stateCode = searchParams.get('stateCode');
          const status = searchParams.get('status'); // 'assigned', 'unassigned'
          const search = searchParams.get('search');

          let query = { isServiceable: true };
          if (stateCode) query.stateCode = stateCode;
          else if (state) query.state = state;

          if (status === 'unassigned') {
               query.assignedToVendor = { $exists: false };
          } else if (status === 'assigned') {
               query.assignedToVendor = { $exists: true };
          }

          if (search) {
               query.$or = [
                    { pincode: { $regex: search, $options: 'i' } },
                    { district: { $regex: search, $options: 'i' } }
               ];
          }

          // Limit logic: Higher limit if filtered by state for bulk selection
          const limit = (stateCode || state) ? 15000 : 100;

          const pincodes = await Pincode.find(query)
               .populate('assignedToVendor', 'name')
               .sort({ pincode: 1 })
               .limit(limit);

          return NextResponse.json({ success: true, count: pincodes.length, pincodes });
     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}

export async function POST(req) {
     // Bulk Assign Pincodes
     try {
          await dbConnect();
          const user = await getAuthenticatedUser();
          const allowedRoles = ['admin', 'system_admin', 'owner'];

          if (!user || !allowedRoles.includes(user.role)) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const { vendorId, pincodeIds, unassign } = await req.json();

          if (unassign) {
               // Unassign logic
               if (!pincodeIds || pincodeIds.length === 0) return NextResponse.json({ error: 'No pincodes selected' }, { status: 400 });

               // Get pincode strings to remove from Vendor
               const pincodeDocs = await Pincode.find({ _id: { $in: pincodeIds } });
               const codes = pincodeDocs.map(p => p.pincode);

               // Remove from Pincode Model
               await Pincode.updateMany(
                    { _id: { $in: pincodeIds } },
                    { $unset: { assignedToVendor: "" } }
               );

               // Remove from Vendor Model (if specific vendor involved or clean up all references?)
               // If unassigning, we might not know which vendor easily without looking up.
               // But usually we unassign FROM a vendor.
               // Let's assume pincodes are unique to one vendor.
               // Efficient way: Pull these codes from ALL vendors (safety) or just the assigned one.

               await Vendor.updateMany(
                    {}, // Update all vendors to be safe, or fetch assignedToVendor from docs
                    { $pull: { serviceablePincodes: { $in: codes } } }
               );

               return NextResponse.json({ success: true, message: 'Pincodes unassigned' });
          }

          // Assign Logic
          if (!vendorId || !pincodeIds || pincodeIds.length === 0) {
               return NextResponse.json({ error: 'Missing vendor or pincodes' }, { status: 400 });
          }

          const vendor = await Vendor.findById(vendorId);
          if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });

          // check if already assigned? (Frontend should handle, or we overwrite)
          // Overwrite is fine for "Mapping".

          // 1. Update Pincode Docs
          await Pincode.updateMany(
               { _id: { $in: pincodeIds } },
               { assignedToVendor: vendorId }
          );

          // 2. Sync to Vendor Array
          // Get the actual pincode strings
          const pincodeDocs = await Pincode.find({ _id: { $in: pincodeIds } });
          const newCodes = pincodeDocs.map(p => p.pincode);

          // Add to vendor, ensuring uniqueness
          // We can use $addToSet
          await Vendor.findByIdAndUpdate(vendorId, {
               $addToSet: { serviceablePincodes: { $each: newCodes } }
          });

          // IMPORTANT: If these pincodes were assigned to OTHER vendors, remove them there.
          // Enforce 1-to-1 mapping.
          await Vendor.updateMany(
               { _id: { $ne: vendorId } },
               { $pull: { serviceablePincodes: { $in: newCodes } } }
          );

          return NextResponse.json({ success: true, message: 'Pincodes assigned successfully' });

     } catch (error) {
          console.error("Pincode Mapping Error:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
