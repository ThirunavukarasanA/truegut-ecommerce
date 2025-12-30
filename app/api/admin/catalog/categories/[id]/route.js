import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import { getAuthenticatedUser } from '@/lib/api-auth';

export async function PATCH(req, { params }) {
     const user = await getAuthenticatedUser();
     const allowedRoles = ['admin', 'system_admin', 'owner'];
     if (!user || !allowedRoles.includes(user.role)) {
          return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required' }, { status: 401 });
     }

     const { id } = await params;
     await dbConnect();

     try {
          const body = await req.json();

          if (body.name) {
               body.name = body.name.trim();
               // Check for duplicate name excluding current category
               const exists = await Category.findOne({
                    name: { $regex: new RegExp(`^${body.name}$`, 'i') },
                    _id: { $ne: id }
               });
               if (exists) {
                    return NextResponse.json({ success: false, error: 'A category with this name already exists' }, { status: 400 });
               }
          }

          const category = await Category.findByIdAndUpdate(id, body, { new: true, runValidators: true });

          if (!category) {
               return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
          }

          return NextResponse.json({ success: true, data: category });
     } catch (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 400 });
     }
}

export async function DELETE(req, { params }) {
     const user = await getAuthenticatedUser();
     const allowedRoles = ['admin', 'system_admin', 'owner'];
     if (!user || !allowedRoles.includes(user.role)) {
          return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required' }, { status: 401 });
     }

     const { id } = await params;
     await dbConnect();

     try {
          const category = await Category.findByIdAndDelete(id);
          if (!category) {
               return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
          }
          return NextResponse.json({ success: true, message: 'Category deleted successfully' });
     } catch (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
     }
}
