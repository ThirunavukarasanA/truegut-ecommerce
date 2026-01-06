import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import RestockRequest from '@/models/RestockRequest';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

async function isAdmin() {
     const cookieStore = await cookies();
     const token = cookieStore.get('admin_token')?.value;
     if (!token) return false;

     try {
          const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret_key');
          await jwtVerify(token, secret);
          return true;
     } catch {
          return false;
     }
}

export async function GET(req) {
     try {
          if (!await isAdmin()) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          await dbConnect();

          // Need to ensure models are compiled for population
          await import('@/models/Product');
          await import('@/models/Variant');

          const requests = await RestockRequest.find()
               .populate('product', 'name images')
               .populate('variant', 'name')
               .sort({ createdAt: -1 });

          return NextResponse.json({ success: true, requests });
     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
