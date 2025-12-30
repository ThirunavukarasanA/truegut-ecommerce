import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Vendor from '@/models/Vendor';
import { getAuthenticatedUser } from '@/lib/api-auth';

export async function GET(req) {
     const user = await getAuthenticatedUser();
     if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

     await dbConnect();
     try {
          const { searchParams } = new URL(req.url);
          const search = searchParams.get('search');

          let query = {};
          if (search) {
               query.name = { $regex: search, $options: 'i' };
          }

          const vendors = await Vendor.find(query).sort('-createdAt');
          return NextResponse.json({ success: true, data: vendors });
     } catch (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
     }
}

export async function POST(req) {
     const user = await getAuthenticatedUser();
     // Only owner/system_admin can register vendors
     const allowedRoles = ['system_admin', 'owner'];
     if (!user || !allowedRoles.includes(user.role)) {
          return NextResponse.json({ success: false, error: 'Unauthorized: Owner/System Admin access required' }, { status: 401 });
     }

     await dbConnect();
     try {
          const body = await req.json();

          if (!body.email || !body.name) {
               return NextResponse.json({ success: false, error: 'Name and Email are required' }, { status: 400 });
          }

          // Real-time Scenario: Check for duplicate email
          const exists = await Vendor.findOne({ email: body.email.toLowerCase() });
          if (exists) {
               return NextResponse.json({ success: false, error: 'A vendor with this email already exists' }, { status: 400 });
          }

          // Real-time Scenario: Validate pincodes
          if (body.serviceablePincodes && !Array.isArray(body.serviceablePincodes)) {
               return NextResponse.json({ success: false, error: 'Serviceable Pincodes must be an array' }, { status: 400 });
          }

          const vendor = await Vendor.create({
               ...body,
               email: body.email.toLowerCase()
          });

          return NextResponse.json({ success: true, data: vendor });
     } catch (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 400 });
     }
}
