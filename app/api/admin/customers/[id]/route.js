
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/admin/db';
import Customer from '@/models/Customer';
import Order from '@/models/Order';

export async function GET(req, { params }) {
     try {
          // Fix: Await params before accessing properties (Next.js 15+ requirement)
          const { id } = await params;

          await dbConnect();
          const customer = await Customer.findById(id);
          if (!customer) {
               return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
          }

          // Fetch order history with product details populated
          const orders = await Order.find({ "customer.email": customer.email })
               .populate('items.product', 'name images sku category')
               .sort({ createdAt: -1 });

          // Calculate comprehensive stats (with safe navigation)
          const stats = {
               totalOrders: orders.length,
               successfulOrders: orders.filter(o => o.status === 'Delivered').length,
               pendingOrders: orders.filter(o => ['Pending', 'Processing', 'Shipped'].includes(o.status)).length,
               cancelledOrders: orders.filter(o => o.status === 'Cancelled').length,
               returnedOrders: orders.filter(o => o.status === 'Returns').length,
               totalSpent: orders.reduce((acc, curr) => curr.status !== 'Cancelled' ? acc + (curr.totalAmount || 0) : acc, 0),
               averageOrderValue: 0,
               lastOrderDate: orders[0]?.createdAt || null,
               firstOrderDate: orders[orders.length - 1]?.createdAt || null,
          };

          if (orders.length > 0) {
               const validOrdersCount = orders.filter(o => o.status !== 'Cancelled').length;
               if (validOrdersCount > 0) {
                    stats.averageOrderValue = stats.totalSpent / validOrdersCount;
               }
          }

          // Payment analytics
          const paymentAnalytics = {
               totalPaid: orders.filter(o => o.paymentStatus === 'Paid').reduce((acc, curr) => acc + (curr.totalAmount || 0), 0),
               totalPending: orders.filter(o => o.paymentStatus === 'Pending').reduce((acc, curr) => acc + (curr.totalAmount || 0), 0),
               totalRefunded: orders.filter(o => o.paymentStatus === 'Refunded').reduce((acc, curr) => acc + (curr.paymentDetails?.refundAmount || 0), 0),
               paymentMethods: orders.reduce((acc, order) => {
                    if (order.paymentDetails?.method) {
                         acc[order.paymentDetails.method] = (acc[order.paymentDetails.method] || 0) + 1;
                    }
                    return acc;
               }, {}),
          };

          return NextResponse.json({
               success: true,
               data: {
                    profile: customer,
                    orders,
                    stats,
                    paymentAnalytics
               }
          });
     } catch (error) {
          console.error("Customer Detail API Error:", error);
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
     }
}
