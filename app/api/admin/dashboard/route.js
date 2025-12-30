import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Customer from '@/models/Customer';
import Product from '@/models/Product';
import TempCart from '@/models/TempCart';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

async function isAdmin() {
     const cookieStore = await cookies();
     const token = cookieStore.get('admin_token')?.value;
     if (!token) return false;

     try {
          const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret_key');
          const { payload } = await jwtVerify(token, secret);
          const allowedRoles = ['system_admin', 'owner', 'admin'];
          return allowedRoles.includes(payload.role);
     } catch (error) {
          return false;
     }
}

export async function GET(req) {
     try {
          await dbConnect();
          if (!(await isAdmin())) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          // Aggregations
          const now = new Date();
          const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

          // Sales Aggregation (Total and Trend)
          const salesStats = await Order.aggregate([
               { $match: { paymentStatus: 'Paid' } },
               {
                    $facet: {
                         total: [{ $group: { _id: null, sum: { $sum: '$totalAmount' } } }],
                         thisMonth: [
                              { $match: { createdAt: { $gte: firstDayThisMonth } } },
                              { $group: { _id: null, sum: { $sum: '$totalAmount' } } }
                         ],
                         lastMonth: [
                              { $match: { createdAt: { $gte: firstDayLastMonth, $lt: firstDayThisMonth } } },
                              { $group: { _id: null, sum: { $sum: '$totalAmount' } } }
                         ]
                    }
               }
          ]);

          const totalSales = salesStats[0].total[0]?.sum || 0;
          const salesThisMonth = salesStats[0].thisMonth[0]?.sum || 0;
          const salesLastMonth = salesStats[0].lastMonth[0]?.sum || 0;
          const salesTrend = salesLastMonth === 0 ? 100 : ((salesThisMonth - salesLastMonth) / salesLastMonth) * 100;

          // Orders stats
          const totalOrders = await Order.countDocuments();
          const ordersThisMonth = await Order.countDocuments({ createdAt: { $gte: firstDayThisMonth } });
          const ordersLastMonth = await Order.countDocuments({ createdAt: { $gte: firstDayLastMonth, $lt: firstDayThisMonth } });
          const ordersTrend = ordersLastMonth === 0 ? 100 : ((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100;

          // Customers stats
          const totalCustomers = await Customer.countDocuments();
          const customersThisMonth = await Customer.countDocuments({ createdAt: { $gte: firstDayThisMonth } });
          const customersLastMonth = await Customer.countDocuments({ createdAt: { $gte: firstDayLastMonth, $lt: firstDayThisMonth } });
          const customersTrend = customersLastMonth === 0 ? 100 : ((customersThisMonth - customersLastMonth) / customersLastMonth) * 100;

          const totalProducts = await Product.countDocuments();

          const recentOrders = await Order.find()
               .sort({ createdAt: -1 })
               .limit(5)
               .lean();

          const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
               .limit(5)
               .lean();

          const tempCartCount = await TempCart.countDocuments();

          // simple daily sales for a chart (last 7 days)
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

          const salesByDay = await Order.aggregate([
               { $match: { createdAt: { $gte: sevenDaysAgo }, paymentStatus: 'Paid' } },
               {
                    $group: {
                         _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                         total: { $sum: "$totalAmount" }
                    }
               },
               { $sort: { _id: 1 } }
          ]);

          return NextResponse.json({
               success: true,
               stats: {
                    totalSales,
                    totalOrders,
                    totalCustomers,
                    totalProducts,
                    tempCartCount,
                    trends: {
                         sales: salesTrend.toFixed(1),
                         orders: ordersTrend.toFixed(1),
                         customers: customersTrend.toFixed(1)
                    }
               },
               recentOrders,
               lowStockProducts,
               salesByDay
          });
     } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
