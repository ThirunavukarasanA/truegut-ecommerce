import { NextResponse } from 'next/server';
import dbConnect from '@/lib/admin/db';
import Banner from '@/models/Banner';

// Public endpoint to get active banners for the homepage
export async function GET() {
     await dbConnect();
     try {
          const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
          return NextResponse.json({ success: true, banners });
     } catch (error) {
          return NextResponse.json({ success: false, error: 'Failed to fetch banners' }, { status: 500 });
     }
}
