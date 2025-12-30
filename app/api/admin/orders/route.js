import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { getAuthenticatedUser } from '@/lib/api-auth';

export async function GET(req) {
     const user = await getAuthenticatedUser();
     if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

     await dbConnect();
     try {
          const { searchParams } = new URL(req.url);
          const status = searchParams.get('status');
          const search = searchParams.get('search');

          let query = {};

          if (status && status !== 'All') {
               query.status = status;
          }

          if (search) {
               // Simple search by customer name for now
               query['customer.name'] = { $regex: search, $options: 'i' };
          }

          const orders = await Order.find(query).sort('-createdAt');
          return NextResponse.json({ success: true, data: orders });
     } catch (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
     }
}

// Order creation usually happens from Customer App, but Admin might create manual orders
export async function POST(req) {
     const user = await getAuthenticatedUser();
     if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

     await dbConnect();
     try {
          const body = await req.json();
          const order = await Order.create(body);
          return NextResponse.json({ success: true, data: order });
     } catch (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 400 });
     }
}
