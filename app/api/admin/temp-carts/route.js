import { NextResponse } from 'next/server';
import dbConnect from '@/lib/admin/db';
import TempCart from '@/models/TempCart';
import { getAuthenticatedUser } from '@/lib/admin/api-auth';

export async function GET(req) {
     try {
          const user = await getAuthenticatedUser();
          if (!user) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          if (!['system_admin', 'owner', 'admin'].includes(user.role)) {
               return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
          }

          await dbConnect();

          const tempCarts = await TempCart.find()
               .populate('items.productId', 'name image images price productCode')
               .populate('items.variantId', 'name price sku')
               .sort({ updatedAt: -1 });

          return NextResponse.json({ success: true, tempCarts });
     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
