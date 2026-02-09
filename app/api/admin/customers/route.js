import { NextResponse } from 'next/server';
import dbConnect from '@/lib/admin/db';
import Customer from '@/models/Customer';
import Order from '@/models/Order';

export async function GET(req) {
     try {
          await dbConnect();

          // Fetch all customers
          const customers = await Customer.find({}).sort({ createdAt: -1 });

          // Enhance with order stats
          const enhancedCustomers = await Promise.all(customers.map(async (c) => {
               const orderCount = await Order.countDocuments({ "customer.email": c.email });
               const totalSpend = await Order.aggregate([
                    { $match: { "customer.email": c.email, status: { $ne: 'Cancelled' } } },
                    { $group: { _id: null, total: { $sum: "$totalAmount" } } }
               ]);

               return {
                    ...c.toObject(),
                    orderCount,
                    totalSpent: totalSpend[0]?.total || 0
               };
          }));

          return NextResponse.json({ success: true, data: enhancedCustomers });
     } catch (error) {
          console.error("Customer List API Error:", error);
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
     }
}
