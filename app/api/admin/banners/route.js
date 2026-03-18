import { NextResponse } from 'next/server';
import dbConnect from '@/lib/admin/db';
import Banner from '@/models/Banner';
import { getAuthenticatedUser } from '@/lib/admin/api-auth';

// Get all banners for admin
export async function GET() {
     const user = await getAuthenticatedUser();
     if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

     await dbConnect();
     try {
          const banners = await Banner.find({}).sort({ order: 1, createdAt: -1 });
          return NextResponse.json({ success: true, data: banners });
     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}

// Create a new banner
export async function POST(req) {
     const user = await getAuthenticatedUser();
     const allowedRoles = ['admin', 'system_admin', 'owner'];
     if (!user || !allowedRoles.includes(user.role)) {
          return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
     }

     await dbConnect();
     try {
          const body = await req.json();

          if (!body.title || !body.title.trim()) {
               return NextResponse.json({ error: 'Banner title is required' }, { status: 400 });
          }
          if (!body.image || !body.image.url) {
               return NextResponse.json({ error: 'Banner image URL is required' }, { status: 400 });
          }

          const banner = await Banner.create({
               title: body.title.trim(),
               image: body.image,
               altText: body.altText || 'Banner image',
               link: body.link || '',
               isActive: body.isActive !== undefined ? body.isActive : true,
               order: body.order || 0
          });

          return NextResponse.json({ success: true, data: banner });
     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
     }
}
