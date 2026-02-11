import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/admin/api-auth';
import dbConnect from '@/lib/admin/db';
import Vendor from '@/models/Vendor';

export async function GET(req) {
     const user = await getAuthenticatedUser();

     if (!user) {
          return NextResponse.json({ user: null });
     }

     // If vendor, fetch vendor details
     let vendorDetails = null;
     if (user.role === 'vendor') {
          await dbConnect();
          vendorDetails = await Vendor.findOne({ connectedUser: user.id });
     }

     return NextResponse.json({
          user: {
               id: user.id,
               email: user.email,
               role: user.role,
               vendorId: vendorDetails?._id || null
          }
     });
}
