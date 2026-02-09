import { NextResponse } from 'next/server';
import dbConnect from '@/lib/admin/db';
import RestockRequest from '@/models/RestockRequest';
import { getAuthenticatedUser } from '@/lib/admin/api-auth';
import '@/models/Product'; // Ensure models are registered
import '@/models/Variant';

export async function GET(req) {
     try {
          const user = await getAuthenticatedUser();
          if (!user) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          if (!['system_admin', 'owner', 'admin', 'editor'].includes(user.role)) {
               return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
          }

          await dbConnect();

          const requests = await RestockRequest.find()
               .populate('product', 'name images')
               .populate('variant', 'name')
               .populate('vendor', 'name')
               .sort({ createdAt: -1 });

          return NextResponse.json({ success: true, requests });
     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
