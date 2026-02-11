import { NextResponse } from 'next/server';
import dbConnect from '@/lib/admin/db';
import TempCart from '@/models/TempCart';
import { getAuthenticatedUser } from '@/lib/admin/api-auth';

export async function DELETE(req, { params }) {
     try {
          const user = await getAuthenticatedUser();
          if (!user) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          // Strict role check for deletion
          if (!['system_admin', 'owner', 'admin'].includes(user.role)) {
               return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
          }

          await dbConnect();
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
