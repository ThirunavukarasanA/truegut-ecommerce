"use client";

import { useState, useEffect } from "react";
import {
  MdTrendingUp,
  MdPeople,
  MdShoppingCart,
  MdInventory,
  MdWarning,
  MdTimer,
  MdArrowForward,
} from "react-icons/md";
import toast from "react-hot-toast";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import AdminCard from "@/components/admin/common/AdminCard";
import AdminTable from "@/components/admin/common/AdminTable";
import AdminStatusBadge from "@/components/admin/common/AdminStatusBadge";
import Link from "next/link";
import StatsCard from "@/components/admin/StatsCard";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/admin/dashboard");
      const result = await res.json();
      if (result.success) {
        setData(result);
      } else {
        toast.error(result.error || "Failed to load dashboard data");
      }
    } catch (error) {
      toast.error("An error occurred while fetching dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <AdminPageHeader
        title="Dashboard Overview"
        description="Welcome back! Here's what's happening with your store today."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={`₹${data?.stats.totalSales.toLocaleString()}`}
          change={data?.stats.trends.sales}
          icon={MdTrendingUp}
          trend={data?.stats.trends.sales >= 0 ? "up" : "down"}
        />
        <StatsCard
          title="Total Orders"
          value={data?.stats.totalOrders.toLocaleString()}
          change={data?.stats.trends.orders}
          icon={MdShoppingCart}
          trend={data?.stats.trends.orders >= 0 ? "up" : "down"}
        />
        <StatsCard
          title="Customers"
          value={data?.stats.totalCustomers.toLocaleString()}
          change={data?.stats.trends.customers}
          icon={MdPeople}
          trend={data?.stats.trends.customers >= 0 ? "up" : "down"}
        />
        <StatsCard
          title="Guest Carts"
          value={data?.stats.tempCartCount.toLocaleString()}
          change="Live"
          icon={MdTimer}
          trend="up"
          className="bg-secondary/30 border-secondary/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <AdminCard noPadding>
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[11px] font-light text-gray-400 uppercase tracking-[0.2em]">
                Recent Orders
              </h3>
              <Link
                href="/admin/orders/all"
                className="flex items-center gap-2 text-secondary text-[10px] font-light uppercase tracking-widest hover:bg-secondary/10 px-4 py-2 rounded-xl border border-transparent hover:border-secondary/10 transition-all group"
              >
                View All{" "}
                <MdArrowForward className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <AdminTable
              headers={[
                { label: "Order ID" },
                { label: "Customer" },
                { label: "Amount" },
                { label: "Status" },
              ]}
              loading={false}
              emptyMessage="No recent orders found."
              colCount={4}
            >
              {data?.recentOrders.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-8 py-4 font-mono text-xs text-gray-500 capitalize">
                    #{order._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-8 py-4">
                    <p className="text-sm font-light text-gray-800">
                      {order.customer?.name || "Guest"}
                    </p>
                    <p className="text-xs text-gray-400 font-light">
                      {order.customer?.email}
                    </p>
                  </td>
                  <td className="px-8 py-4 font-light text-gray-700">
                    ₹{order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-8 py-4">
                    <AdminStatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </AdminTable>
          </AdminCard>
        </div>

        {/* Low Stock Alerts */}
        <div className="space-y-6">
          <AdminCard noPadding>
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                  <MdWarning size={20} />
                </div>
                <h3 className="text-[11px] font-light text-gray-400 uppercase tracking-[0.2em]">
                  Low Stock Alerts
                </h3>
              </div>
              <Link
                href="/admin/catalog/products"
                className="text-secondary text-[10px] font-light uppercase tracking-widest hover:bg-secondary/10 px-4 py-2 rounded-xl border border-transparent hover:border-secondary/10 transition-all"
              >
                Fix
              </Link>
            </div>
            <div className="p-2">
              {data?.lowStockProducts.length > 0 ? (
                <div className="space-y-1">
                  {data.lowStockProducts.map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center justify-between p-4 hover:bg-gray-50/50 rounded-2xl transition-all group border border-transparent hover:border-gray-100/30"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/10">
                          <MdInventory size={20} />
                        </div>
                        <div>
                          <p className="text-[13px] font-normal text-gray-800 group-hover:text-secondary transition-colors">
                            {product.name}
                          </p>
                          <p className="text-[9px] text-gray-400 font-light uppercase tracking-widest mt-0.5">
                            SKU-{product._id.slice(-6).toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-light text-red-500">
                          {product.stock} left
                        </p>
                        <div className="w-12 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-red-500"
                            style={{ width: `${(product.stock / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400 text-sm font-light">
                  Inventory levels are healthy!
                </div>
              )}
            </div>
          </AdminCard>

          <AdminCard className="bg-white border-secondary/50 shadow-[0_8px_30px_rgb(99,102,241,0.04)] hover:shadow-[0_8px_30px_rgb(99,102,241,0.1)] transition-all duration-500 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary blur-[60px] opacity-10 rounded-full group-hover:opacity-20 transition-opacity"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-4 bg-secondary/10 text-secondary rounded-2xl">
                <MdTimer size={24} className="animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] font-light text-gray-400 uppercase tracking-[0.2em] mb-1">
                  Guest Activity
                </p>
                <h4 className="text-xl font-light text-gray-900">
                  {data?.stats.tempCartCount} active carts
                </h4>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 mt-6 leading-relaxed bg-secondary/10 p-4 rounded-2xl border border-secondary/20 italic font-light relative z-10">
              "Potential revenue of{" "}
              <span className="text-secondary font-normal">
                ₹{data?.stats.tempCartCount * 45}
              </span>{" "}
              in guest carts. Consider sending recovery emails."
            </p>
            <Link
              href="/admin/temp-carts"
              className="mt-8 flex items-center justify-center gap-2 bg-secondary text-white px-5 py-3.5 rounded-2xl text-[11px] font-light uppercase tracking-widest hover:bg-secondary/80 shadow-lg shadow-secondary/20 transition-all relative z-10"
            >
              Track Activity <MdArrowForward />
            </Link>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
