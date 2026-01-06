"use client";

import { useState, useEffect } from "react";
import { adminFetch } from "@/lib/adminFetch";
import {
     MdTrendingUp,
     MdPeople,
     MdShoppingCart,
     MdInventory,
     MdWarning,
     MdTimer,
     MdArrowForward,
     MdPayments,
     MdShoppingBag,
     MdAddCircle,
     MdLocalShipping,
     MdAttachMoney
} from "react-icons/md";
import toast from "react-hot-toast";
import { useSettings } from "@/context/SettingsContext";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import AdminCard from "@/components/admin/common/AdminCard";
import AdminTable from "@/components/admin/common/AdminTable";
import AdminStatusBadge from "@/components/admin/common/AdminStatusBadge";
import Link from "next/link";
import StatsCard from "@/components/admin/StatsCard";
import DashboardCharts from "@/components/admin/dashboard/DashboardCharts";

export default function DashboardPage() {
     const { settings } = useSettings();
     const [data, setData] = useState(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          fetchDashboardData();
     }, []);

     const fetchDashboardData = async () => {
          try {
               const result = await adminFetch("/api/admin/dashboard");
               if (result.success) {
                    setData(result);
               } else {
                    toast.error(result.error || "Failed to load dashboard data");
               }
          } catch (error) {
               if (error.message !== 'Unauthorized - Redirecting to login') {
                    toast.error(error.message || "An error occurred while fetching dashboard data");
               }
          } finally {
               setLoading(false);
          }
     };

     if (loading) {
          return (
               <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
               </div>
          );
     }

     return (
          <div className="space-y-10 animate-in fade-in duration-500 pb-12 max-w-[1600px] mx-auto">
               {/* <AdminPageHeader
                    title="Dashboard"
                    description="Overview of your store's performance and activity."
               /> */}

               {/* Section 1: Financial & Sales KPIs */}
               <section className="space-y-4">
                    {/* <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest pl-1">Performance</h3> */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                         <StatsCard
                              title="Total Revenue"
                              value={`${settings.currency.symbol}${(data?.stats?.totalSales || 0).toLocaleString()}`}
                              change={data?.stats?.salesGrowth}
                              icon={MdPayments}
                              variant="emerald"
                              trend={parseFloat(data?.stats?.salesGrowth || 0) >= 0 ? "up" : "down"}
                         />
                         <StatsCard
                              title="Today's Sales"
                              value={`${settings.currency.symbol}${(data?.stats?.todaySales || 0).toLocaleString()}`}
                              change="Live"
                              icon={MdAttachMoney}
                              variant="cyan"
                              trend="up"
                         />
                         <StatsCard
                              title="Total Orders"
                              value={(data?.stats?.totalOrders || 0).toLocaleString()}
                              change={data?.stats?.orderGrowth}
                              icon={MdShoppingCart}
                              variant="blue"
                              trend={parseFloat(data?.stats?.orderGrowth || 0) >= 0 ? "up" : "down"}
                         />
                         <StatsCard
                              title="Active Orders"
                              value={(data?.stats?.activeOrders || 0).toLocaleString()}
                              change="Processing"
                              icon={MdLocalShipping}
                              variant="indigo"
                              trend="up"
                         />
                    </div>
               </section>

               {/* Section 3: Analytics & Actions */}
               <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Left: Charts */}
                    <div className="xl:col-span-2 space-y-4">
                         <div className="flex items-center justify-between">
                              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest pl-1">Sales Analytics</h3>
                         </div>
                         <DashboardCharts
                              historyData={data?.historyData}
                              topProducts={data?.topProducts}
                              orderDistribution={data?.orderDistribution}
                         />
                    </div>

                    {/* Right: Carts & Quick Actions */}
                    <div className="space-y-8">
                         {/* Guest Carts / Abandoned */}
                         <div className="space-y-4">
                              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest pl-1">Cart Activity</h3>
                              <AdminCard className="bg-gradient-to-br from-white to-gray-50 border-gray-100 shadow-sm relative overflow-hidden group">
                                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full z-0"></div>
                                   <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                             <div className="p-3 bg-white rounded-xl shadow-sm text-primary">
                                                  <MdTimer size={24} />
                                             </div>
                                             <span className="text-xs font-semibold text-primary bg-primary/5 px-2 py-1 rounded-lg">
                                                  {data?.stats.tempCartCount} Active Carts
                                             </span>
                                        </div>
                                        <h4 className="text-lg font-medium text-gray-800 mb-1">Potential Revenue</h4>
                                        <p className="text-3xl font-bold text-primary mb-4">
                                             {settings.currency.symbol}{(data?.stats.potentialLostRevenue || 0).toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                                             Revenue sitting in abandoned or active guest carts.
                                        </p>
                                        <Link href="/admin/temp-carts" className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-50 hover:text-primary transition-colors shadow-sm">
                                             Recover Carts <MdArrowForward />
                                        </Link>
                                   </div>
                              </AdminCard>
                         </div>

                         {/* Quick Actions */}
                         <div className="space-y-4">
                              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest pl-1">Quick Actions</h3>
                              <div className="grid grid-cols-2 gap-4">
                                   <Link href="/admin/catalog/products/create" className="p-4 bg-white border border-gray-100 rounded-2xl hover:border-primary/30 hover:shadow-md hover:-translate-y-1 transition-all group flex flex-col items-center justify-center gap-3 text-center aspect-square">
                                        <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                             <MdAddCircle size={24} />
                                        </div>
                                        <span className="text-xs font-bold text-gray-600 group-hover:text-primary">Add Product</span>
                                   </Link>
                                   <Link href="/admin/orders/all" className="p-4 bg-white border border-gray-100 rounded-2xl hover:border-primary/30 hover:shadow-md hover:-translate-y-1 transition-all group flex flex-col items-center justify-center gap-3 text-center aspect-square">
                                        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                             <MdLocalShipping size={24} />
                                        </div>
                                        <span className="text-xs font-bold text-gray-600 group-hover:text-indigo-600">Ship Orders</span>
                                   </Link>
                              </div>
                         </div>
                    </div>
               </section>

               {/* Section 4: Data Lists */}
               <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Orders List */}
                    <div className="space-y-4">
                         <div className="flex items-center justify-between">
                              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest pl-1">Recent Activity</h3>
                              <Link href="/admin/orders/all" className="text-xs font-medium text-primary hover:underline">View All</Link>
                         </div>
                         <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm h-full">
                              <div className="divide-y divide-gray-50">
                                   {data?.recentOrders.map((order) => (
                                        <div key={order._id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => window.location.href = `/admin/orders/${order._id}`}>
                                             <div className="flex items-center gap-4">
                                                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                                                       <MdShoppingBag />
                                                  </div>
                                                  <div>
                                                       <p className="text-xs font-bold text-gray-900 leading-tight mb-1">{order.customer?.name || "Guest Check-out"}</p>
                                                       <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
                                                                 order.status === 'Cancelled' ? 'bg-red-50 text-red-600' :
                                                                      'bg-blue-50 text-blue-600'
                                                            }`}>
                                                            {order.status}
                                                       </span>
                                                  </div>
                                             </div>
                                             <div className="text-right">
                                                  <p className="text-xs font-bold text-gray-900">{settings.currency.symbol}{order.totalAmount.toLocaleString()}</p>
                                                  <p className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                                             </div>
                                        </div>
                                   ))}
                              </div>
                         </div>
                    </div>

                    {/* Stock Alerts List */}
                    <div className="space-y-4">
                         <div className="flex items-center justify-between">
                              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest pl-1">Stock Alerts</h3>
                              <Link href="/admin/stockmanagement" className="text-xs font-medium text-primary hover:underline">Manage Stock</Link>
                         </div>
                         <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm h-full">
                              {data?.lowStockProducts.length > 0 ? (
                                   <div className="divide-y divide-gray-50">
                                        {data?.lowStockProducts.slice(0, 5).map((product) => (
                                             <div key={product._id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                                  <div className="flex items-center gap-4">
                                                       <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500 overflow-hidden">
                                                            {product.images?.[0] ? (
                                                                 <img src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url} className="w-full h-full object-cover" />
                                                            ) : (
                                                                 <MdWarning />
                                                            )}
                                                       </div>
                                                       <div>
                                                            <p className="text-xs font-medium text-gray-900 leading-tight line-clamp-1">{product.name}</p>
                                                            <p className="text-[10px] text-red-500 font-bold">{product.stock} items left</p>
                                                       </div>
                                                  </div>
                                                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                       <div className="h-full bg-red-400 rounded-full" style={{ width: '20%' }}></div>
                                                  </div>
                                             </div>
                                        ))}
                                   </div>
                              ) : (
                                   <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                        <MdInventory size={32} className="mb-2 opacity-20" />
                                        <p className="text-xs">No stock alerts</p>
                                   </div>
                              )}
                         </div>
                    </div>

                    {/* Top Products List */}
                    <div className="space-y-4">
                         <div className="flex items-center justify-between">
                              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest pl-1">Top Performers</h3>
                         </div>
                         <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm h-full">
                              <div className="divide-y divide-gray-50">
                                   {data?.topProducts.slice(0, 5).map((product, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                             <div className="flex items-center gap-4">
                                                  <span className="text-xs font-bold text-gray-300 w-4">#{i + 1}</span>
                                                  <div>
                                                       <p className="text-xs font-medium text-gray-900 leading-tight">{product.name}</p>
                                                       <p className="text-[10px] text-gray-400">{product.totalSold} sold this month</p>
                                                  </div>
                                             </div>
                                             <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                                                  {settings.currency.symbol}{product.totalRevenue.toLocaleString()}
                                             </span>
                                        </div>
                                   ))}
                              </div>
                         </div>
                    </div>
               </section>
          </div>
     );
}