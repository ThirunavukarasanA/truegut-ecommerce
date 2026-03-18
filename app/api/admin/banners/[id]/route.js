import { NextResponse } from 'next/server';
import dbConnect from '@/lib/admin/db';
import Banner from '@/models/Banner';
import { getAuthenticatedUser } from '@/lib/admin/api-auth';

// Get a single banner
export async function GET(req, { params }) {
     const user = await getAuthenticatedUser();
     const allowedRoles = ['admin', 'system_admin', 'owner'];
     if (!user || !allowedRoles.includes(user.role)) {
          return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
     }

     await dbConnect();
     try {
          const { id } = await params;
          const banner = await Banner.findById(id);

          if (!banner) {
               return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
          }

          return NextResponse.json({ success: true, data: banner });
     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}

// Update a banner
export async function PUT(req, { params }) {
     const user = await getAuthenticatedUser();
     const allowedRoles = ['admin', 'system_admin', 'owner'];
     if (!user || !allowedRoles.includes(user.role)) {
          return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
     }

     await dbConnect();
     try {
          const { id } = await params;
          const body = await req.json();

          const banner = await Banner.findByIdAndUpdate(
               id,
               { $set: body },
               { new: true, runValidators: true }
          );

          if (!banner) {
               return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
          }

          return NextResponse.json({ success: true, data: banner });
     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
     }
}

// Delete a banner
export async function DELETE(req, { params }) {
     const user = await getAuthenticatedUser();
     const allowedRoles = ['admin', 'system_admin', 'owner'];
     if (!user || !allowedRoles.includes(user.role)) {
          return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
     }

     await dbConnect();
     try {
          const { id } = await params;
          const banner = await Banner.findByIdAndDelete(id);

          if (!banner) {
               return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
          }

          return NextResponse.json({ success: true, data: {} });
     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
