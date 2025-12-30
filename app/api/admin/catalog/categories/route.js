import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import { getAuthenticatedUser } from '@/lib/api-auth';

export async function GET() {
     const user = await getAuthenticatedUser();
     if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

     await dbConnect();
     try {
          const categories = await Category.find({}).sort('-createdAt');
          return NextResponse.json({ success: true, data: categories });
     } catch (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
     }
}

export async function POST(req) {
     const user = await getAuthenticatedUser();
     // Only admin/system_admin/owner can create categories
     const allowedRoles = ['admin', 'system_admin', 'owner'];
     if (!user || !allowedRoles.includes(user.role)) {
          return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required' }, { status: 401 });
     }

     await dbConnect();
     try {
          const body = await req.json();

          if (!body.name || body.name.trim() === '') {
               return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 });
          }

          // Real-time Scenario: Check for duplicate name
          const exists = await Category.findOne({ name: { $regex: new RegExp(`^${body.name.trim()}$`, 'i') } });
          if (exists) {
               return NextResponse.json({ success: false, error: 'A category with this name already exists' }, { status: 400 });
          }

          const category = await Category.create({
               ...body,
               name: body.name.trim()
          });

          return NextResponse.json({ success: true, data: category });
     } catch (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 400 });
     }
}
