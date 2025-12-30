import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Vendor from '@/models/Vendor';
import { getAuthenticatedUser } from '@/lib/api-auth';

export async function GET(req, { params }) {
     const user = await getAuthenticatedUser();
     if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

     const { id } = await params;
     await dbConnect();

     try {
          const vendor = await Vendor.findById(id);
          if (!vendor) {
               return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });
          }
          return NextResponse.json({ success: true, data: vendor });
     } catch (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
     }
}

export async function PATCH(req, { params }) {
     const user = await getAuthenticatedUser();
     const allowedRoles = ['system_admin', 'owner'];
     if (!user || !allowedRoles.includes(user.role)) {
          return NextResponse.json({ success: false, error: 'Unauthorized: Owner/System Admin access required' }, { status: 401 });
     }

     const { id } = await params;
     await dbConnect();

     try {
          const body = await req.json();

          // If email is changing, check uniqueness
          if (body.email) {
               const existing = await Vendor.findOne({ email: body.email.toLowerCase(), _id: { $ne: id } });
               if (existing) {
                    return NextResponse.json({ success: false, error: 'Email already in use by another vendor' }, { status: 400 });
               }
               body.email = body.email.toLowerCase();
          }

          const vendor = await Vendor.findByIdAndUpdate(id, body, { new: true, runValidators: true });

          if (!vendor) {
               return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });
          }

          return NextResponse.json({ success: true, data: vendor });
     } catch (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 400 });
     }
}

export async function DELETE(req, { params }) {
     const user = await getAuthenticatedUser();
     const allowedRoles = ['system_admin', 'owner'];
     if (!user || !allowedRoles.includes(user.role)) {
          return NextResponse.json({ success: false, error: 'Unauthorized: Owner/System Admin access required' }, { status: 401 });
     }

     const { id } = await params;
     await dbConnect();

     try {
          const vendor = await Vendor.findByIdAndDelete(id);
          if (!vendor) {
               return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });
          }
          return NextResponse.json({ success: true, message: 'Vendor deleted successfully' });
     } catch (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
     }
}
