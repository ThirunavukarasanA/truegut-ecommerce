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

export async function DELETE(req, { params }) {
     try {
          await dbConnect();
          if (!(await isAdmin())) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const { id } = await params;
          const deletedCart = await TempCart.findByIdAndDelete(id);

          if (!deletedCart) {
               return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
          }

          return NextResponse.json({ success: true, message: 'Temp cart deleted' });
     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
