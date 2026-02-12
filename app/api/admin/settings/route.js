import { NextResponse } from 'next/server';
import dbConnect from '@/lib/admin/db';
import StoreSettings from '@/models/StoreSettings';
import { getAuthenticatedUser } from '@/lib/admin/api-auth';

export async function GET() {
     const user = await getAuthenticatedUser();
     if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

     await dbConnect();
     try {
          let settings = await StoreSettings.findOne({});
          if (!settings) {
               settings = await StoreSettings.create({});
          }
          return NextResponse.json({ success: true, data: settings });
     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}

export async function POST(req) {
     const user = await getAuthenticatedUser();
     const allowedRoles = ['admin', 'system_admin', 'owner'];
     if (!user || !allowedRoles.includes(user.role)) {
          return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
     }

     await dbConnect();
     try {
          const body = await req.json();
          let settings = await StoreSettings.findOne({});

          if (!settings) {
               settings = await StoreSettings.create(body);
          } else {
               settings = await StoreSettings.findOneAndUpdate({}, body, { new: true });
          }

          return NextResponse.json({ success: true, data: settings });
     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
     }
}
