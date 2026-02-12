import { NextResponse } from 'next/server';
import dbConnect from '@/lib/admin/db';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { getAuthenticatedUser } from '@/lib/admin/api-auth';
import { generateSlug } from '@/lib/admin/model-helpers';

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
               body.slug = generateSlug(body.name);
               // Check for duplicate name excluding current category
               const exists = await Category.findOne({
                    name: { $regex: new RegExp(`^${body.name}$`, 'i') },
                    _id: { $ne: id }
               });
               if (exists) {
                    return NextResponse.json({ error: 'A category with this name already exists' }, { status: 400 });
               }
          }

          const category = await Category.findByIdAndUpdate(id, body, { new: true, runValidators: true });

          if (!category) {
               return NextResponse.json({ error: 'Category not found' }, { status: 404 });
          }

          return NextResponse.json({ success: true, data: category });
     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
     }
}

export async function DELETE(req, { params }) {
     const user = await getAuthenticatedUser();
     const allowedRoles = ['admin', 'system_admin', 'owner'];
     if (!user || !allowedRoles.includes(user.role)) {
          return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
     }

     const { id } = await params;
     await dbConnect();

     try {
          // Remove category reference from products
          await Product.updateMany({ category: id }, { $unset: { category: "" } });

          const category = await Category.findByIdAndDelete(id);
          if (!category) {
               return NextResponse.json({ error: 'Category not found' }, { status: 404 });
          }
          return NextResponse.json({ success: true, message: 'Category deleted successfully' });
     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
