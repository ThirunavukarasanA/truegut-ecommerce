import { NextResponse } from 'next/server';
import dbConnect from '@/lib/admin/db';
import DeliveryPartner from '@/models/DeliveryPartner';
import { getAuthenticatedUser } from '@/lib/admin/api-auth';

export async function PUT(req, { params }) {
     try {
          await dbConnect();
          const user = await getAuthenticatedUser();
          const allowedRoles = ['admin', 'system_admin', 'owner'];

          if (!user || !allowedRoles.includes(user.role)) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const { id } = await params;
          const body = await req.json();

          const updatedPartner = await DeliveryPartner.findByIdAndUpdate(
               id,
               { ...body },
               { new: true, runValidators: true }
          );

          if (!updatedPartner) {
               return NextResponse.json({ error: 'Delivery Partner not found' }, { status: 404 });
          }

          return NextResponse.json({ success: true, partner: updatedPartner });
     } catch (error) {
          console.error("Update Partner Error:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}

export async function DELETE(req, { params }) {
     try {
          await dbConnect();
          const user = await getAuthenticatedUser();
          const allowedRoles = ['admin', 'system_admin', 'owner'];

          if (!user || !allowedRoles.includes(user.role)) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const { id } = await params;
          const deletedPartner = await DeliveryPartner.findByIdAndDelete(id);

          if (!deletedPartner) {
               return NextResponse.json({ error: 'Delivery Partner not found' }, { status: 404 });
          }

          return NextResponse.json({ success: true, message: 'Partner deleted successfully' });
     } catch (error) {
          console.error("Delete Partner Error:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
