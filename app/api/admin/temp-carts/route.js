import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TempCart from '@/models/TempCart';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

async function isAdmin() {
     const cookieStore = await cookies();
     const token = cookieStore.get('admin_token')?.value;
     if (!token) return false;

     try {
          const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret_key');
          const { payload } = await jwtVerify(token, secret);
          const allowedRoles = ['system_admin', 'owner', 'admin'];
          return allowedRoles.includes(payload.role);
     } catch (error) {
          return false;
     }
}

export async function GET(req) {
     try {
          await dbConnect();
          if (!(await isAdmin())) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const tempCarts = await TempCart.find()
               .populate('items.productId', 'name image images price productCode')
               .populate('items.variantId', 'name price sku')
               .sort({ updatedAt: -1 });
          return NextResponse.json({ tempCarts });
     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
