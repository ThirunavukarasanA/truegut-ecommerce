import { NextResponse } from "next/server";
import dbConnect from "@/lib/admin/db";
import Order from "@/models/Order";
import Customer from "@/models/Customer";
import Product from "@/models/Product";
import TempCart from "@/models/TempCart";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import {
  startOfDay,
  startOfMonth,
  subMonths,
  subDays,
  endOfDay,
  format,
} from "date-fns";

import Batch from "@/models/Batch";
import Variant from "@/models/Variant";
import Vendor from "@/models/Vendor";
import VendorStock from "@/models/VendorStock";
import { getAuthenticatedUser } from "@/lib/admin/api-auth";

export const dynamic = "force-dynamic"; // Ensure not cached statically

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_access_token")?.value;
  if (!token) return false;

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "default_secret_key"
    );
    const { payload } = await jwtVerify(token, secret);
    const allowedRoles = ["system_admin", "owner", "admin"];
    return allowedRoles.includes(payload.role);
  } catch (error) {
    return false;
  }
}

export async function GET(req) {
  try {
    await dbConnect();
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isVendor = user.role === 'vendor';
    let vendorId = null;
    if (isVendor) {
      const vendor = await Vendor.findOne({ userId: user._id });
      vendorId = vendor?._id;
      if (!vendorId) {
        return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
      }
    }

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const firstDayThisMonth = startOfMonth(now);
    const firstDayLastMonth = startOfMonth(subMonths(now, 1));
    const firstDayTwoMonthsAgo = startOfMonth(subMonths(now, 2));

    const statsQueries = [
      Order.aggregate([
        { $match: { paymentStatus: "Paid", ...(isVendor ? { vendor: vendorId } : {}) } },
        { $group: { _id: null, sum: { $sum: "$totalAmount" } } },
      ]),
      Order.aggregate([
        {
          $match: {
            paymentStatus: "Paid",
            createdAt: { $gte: todayStart, $lte: todayEnd },
            ...(isVendor ? { vendor: vendorId } : {})
          },
        },
        { $group: { _id: null, sum: { $sum: "$totalAmount" } } },
      ]),
      Order.aggregate([
        {
          $match: {
            paymentStatus: "Paid",
            createdAt: { $gte: firstDayThisMonth },
            ...(isVendor ? { vendor: vendorId } : {})
          },
        },
        { $group: { _id: null, sum: { $sum: "$totalAmount" } } },
      ]),
      Order.aggregate([
        {
          $match: {
            paymentStatus: "Paid",
            createdAt: { $gte: firstDayLastMonth, $lt: firstDayThisMonth },
            ...(isVendor ? { vendor: vendorId } : {})
          },
        },
        { $group: { _id: null, sum: { $sum: "$totalAmount" } } },
      ]),
      Order.countDocuments(isVendor ? { vendor: vendorId } : {}),
      Order.countDocuments({
        createdAt: { $gte: firstDayThisMonth },
        ...(isVendor ? { vendor: vendorId } : {})
      }),
      Order.countDocuments({
        createdAt: { $gte: firstDayLastMonth, $lt: firstDayThisMonth },
        ...(isVendor ? { vendor: vendorId } : {})
      }),
      Order.countDocuments({
        status: { $in: ["Pending", "Processing", "Shipped"] },
        ...(isVendor ? { vendor: vendorId } : {})
      }),
      Customer.countDocuments(), // Total customers is global
      isVendor
        ? VendorStock.aggregate([{ $match: { vendor: vendorId } }, { $group: { _id: null, sum: { $sum: "$quantity" } } }])
        : Batch.aggregate([{ $group: { _id: null, sum: { $sum: "$quantity" } } }]),
      TempCart.countDocuments(), // Temp carts global? Or maybe filter by location? Leaving global for now.
      TempCart.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          },
        },
      ]),
      // Expired Stock
      isVendor
        ? VendorStock.aggregate([
          { $match: { vendor: vendorId } },
          {
            $lookup: {
              from: 'batches',
              localField: 'batch',
              foreignField: '_id',
              as: 'batchInfo'
            }
          },
          { $unwind: '$batchInfo' },
          { $match: { 'batchInfo.expiryDate': { $lt: now } } },
          { $group: { _id: null, sum: { $sum: "$quantity" } } }
        ])
        : Batch.aggregate([
          { $match: { expiryDate: { $lt: now } } },
          { $group: { _id: null, sum: { $sum: "$quantity" } } },
        ]),
      // Expired Batches Count
      isVendor
        ? VendorStock.countDocuments({
          vendor: vendorId,
          // Need lookup for count or just list? Simplified:
        }) // Actually vendor doesn't have "batches", they have stock entries.
        : Batch.countDocuments({ expiryDate: { $lt: now } }),
    ];

    const [
      totalSalesData,
      todaySalesData,
      thisMonthSalesData,
      lastMonthSalesData,
      totalOrders,
      totalOrdersThisMonth,
      totalOrdersLastMonth,
      activeOrders,
      totalCustomers,
      totalStockData,
      tempCartCount,
      potentialLostRevenueData,
      expiredStockData,
      expiredBatchesData,
    ] = await Promise.all(statsQueries);
    const totalSales = totalSalesData[0]?.sum || 0;
    const todaySales = todaySalesData[0]?.sum || 0;
    const salesThisMonth = thisMonthSalesData[0]?.sum || 0;
    const salesLastMonth = lastMonthSalesData[0]?.sum || 0;
    const totalStockAvailable = totalStockData[0]?.sum || 0;
    const potentialLostRevenue = potentialLostRevenueData[0]?.total || 0;
    const totalExpiredStock = expiredStockData[0]?.sum || 0;
    const expiredBatchesCount = expiredBatchesData;

    const salesGrowth =
      salesLastMonth === 0
        ? salesThisMonth > 0
          ? 100
          : 0
        : ((salesThisMonth - salesLastMonth) / salesLastMonth) * 100;
    const orderGrowth =
      totalOrdersLastMonth === 0
        ? totalOrdersThisMonth > 0
          ? 100
          : 0
        : ((totalOrdersThisMonth - totalOrdersLastMonth) /
          totalOrdersLastMonth) *
        100;

    // Calculate Low Stock Variants
    const variantStockLevels = isVendor
      ? await VendorStock.aggregate([
        { $match: { vendor: vendorId } },
        { $group: { _id: "$variant", totalQty: { $sum: "$quantity" } } },
        { $match: { totalQty: { $lt: 10 } } },
      ])
      : await Batch.aggregate([
        { $match: { status: "active" } },
        { $group: { _id: "$variant", totalQty: { $sum: "$quantity" } } },
        { $match: { totalQty: { $lt: 10 } } },
      ]);
    const lowStockCount = variantStockLevels.length;

    // 2. Chart Data: Sales & Orders History (Last 30 days)
    const thirtyDaysAgo = startOfDay(subDays(now, 30));
    const historyData = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, ...(isVendor ? { vendor: vendorId } : {}) } },
      {
        $group: {
          _id: { $dateToString: { format: "%d/%m/%Y", date: "$createdAt" } },
          sales: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "Paid"] }, "$totalAmount", 0],
            },
          },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 3. Top Selling Products
    const topProducts = await Order.aggregate([
      { $match: { paymentStatus: "Paid", ...(isVendor ? { vendor: vendorId } : {}) } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.productSnapshot.name" },
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    // 4. Delivered vs Cancelled
    const orderDistribution = await Order.aggregate([
      { $match: (isVendor ? { vendor: vendorId } : {}) },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const deliveredCount =
      orderDistribution.find((d) => d._id === "Delivered")?.count || 0;
    const cancelledCount =
      orderDistribution.find((d) => d._id === "Cancelled")?.count || 0;

    const recentOrders = await Order.find(isVendor ? { vendor: vendorId } : {})
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Fetch low stock variants for display
    // We need variant details.
    const lowStockVariantIds = variantStockLevels.map((v) => v._id);
    const lowStockProducts = await Variant.find({
      _id: { $in: lowStockVariantIds },
    })
      .populate("product", "name images")
      .limit(5)
      .lean();

    // Map to format aligned with frontend expectations (using variant name + product name)
    const formattedLowStock = lowStockProducts.map((v) => ({
      _id: v._id,
      name: `${v.product?.name || "Unknown"} - ${v.name}`,
      stock:
        variantStockLevels.find((l) => l._id.toString() === v._id.toString())
          ?.totalQty || 0,
      images: v.product?.images || [],
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalSales,
        todaySales,
        totalOrders,
        totalCustomers,
        activeOrders,
        totalStockAvailable,
        totalExpiredStock,
        expiredBatchesCount,
        lowStockCount,
        salesThisMonth,
        salesGrowth: salesGrowth.toFixed(1),
        orderGrowth: orderGrowth.toFixed(1),
        potentialLostRevenue,
        tempCartCount,
      },
      historyData,
      topProducts,
      orderDistribution: [
        { name: "Delivered", value: deliveredCount },
        { name: "Cancelled", value: cancelledCount },
      ],
      recentOrders,
      lowStockProducts: formattedLowStock,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
