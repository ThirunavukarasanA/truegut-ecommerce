"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Home/Navbar";
import Footer from "@/components/Home/Footer";

export default function AccountPage() {
     const { user, logout, loading } = useAuth();
     const router = useRouter();
     const [orders, setOrders] = React.useState([]);
     const [ordersLoading, setOrdersLoading] = React.useState(true);
     useEffect(() => {
          const fetchOrders = async () => {
               if (user?.email) {
                    try {
                         const res = await fetch(`/api/orders?email=${user.email}`);
                         const data = await res.json();
                         if (data.success) {
                              setOrders(data.data);
                         }
                    } catch (error) {
                         console.error("Failed to fetch orders", error);
                    } finally {
                         setOrdersLoading(false);
                    }
               }
          };
          if (user) {
               fetchOrders();
          }
     }, [user]);

     if (loading || !user) {
          return (
               <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
               </div>
          );
     }

     return (
          <div className="min-h-screen flex flex-col font-sans bg-gray-50">
               <Navbar />
               <main className="flex-1 max-w-7xl mx-auto px-4 py-20 w-full">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                         <div className="pt-10">
                              <h1 className="text-3xl font-bold text-font-title">My Account</h1>
                              <p className="text-gray-500">Welcome back, {user.name || user.email}</p>
                         </div>
                         <button
                              onClick={logout}
                              className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:text-red-500 hover:border-red-500 transition-colors"
                         >
                              Log Out
                         </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                         {/* Orders Section */}
                         <div className="lg:col-span-2 space-y-8">
                              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                                   <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold text-font-title">Order History</h2>
                                        <span className="text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-wider">
                                             Total {orders.length} Orders
                                        </span>
                                   </div>

                                   {ordersLoading ? (
                                        <div className="flex justify-center py-12">
                                             <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                                        </div>
                                   ) : orders.length > 0 ? (
                                        <div className="space-y-6">
                                             {orders.map((order, index) => (
                                                  <div key={order._id} className="border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
                                                       {/* Serial Number Badge */}
                                                       <div className="absolute top-0 left-0 bg-gray-50 text-gray-400 text-[10px] px-3 py-1 rounded-br-xl font-bold border-r border-b border-gray-100 group-hover:bg-primary/5 group-hover:text-primary/60 transition-colors">
                                                            S.No. {index + 1}
                                                       </div>

                                                       <div className="flex flex-wrap justify-between items-start gap-y-6 gap-x-4 mb-6 border-b border-gray-50 pb-6 pt-2">
                                                            <div className="min-w-[120px]">
                                                                 <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Order ID</p>
                                                                 <p className="font-mono font-bold text-gray-800 text-sm">#{order._id.slice(-6).toUpperCase()}</p>
                                                            </div>
                                                            <div className="min-w-[100px]">
                                                                 <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Placed On</p>
                                                                 <p className="text-gray-800 font-semibold text-sm">{new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                            </div>
                                                            <div className="min-w-[120px]">
                                                                 <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Payment Method</p>
                                                                 <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter border ${order.paymentDetails?.method === 'COD'
                                                                           ? 'bg-amber-50 text-amber-700 border-amber-100'
                                                                           : 'bg-blue-50 text-blue-700 border-blue-100'
                                                                      }`}>
                                                                      {order.paymentDetails?.method === 'COD' ? 'Cash on Delivery' : 'Online (Razorpay)'}
                                                                 </span>
                                                            </div>
                                                            <div className="min-w-[80px]">
                                                                 <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Total Amount</p>
                                                                 <p className="text-primary font-black text-base">₹{order.totalAmount}</p>
                                                            </div>
                                                            <div>
                                                                 <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Status</p>
                                                                 <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                                                                           order.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                                                                                'bg-sky-100 text-sky-700'
                                                                      }`}>
                                                                      {order.status}
                                                                 </span>
                                                            </div>
                                                       </div>

                                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {order.items.map((item, idx) => (
                                                                 <div key={idx} className="flex gap-4 items-center bg-gray-50/50 p-3 rounded-xl border border-transparent hover:border-gray-100 hover:bg-white transition-all">
                                                                      <div className="h-14 w-14 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-50 overflow-hidden shrink-0">
                                                                           {item.product?.images?.[0]?.url ? (
                                                                                <img src={item.product.images[0].url} alt={item.productSnapshot?.name} className="h-full w-full object-cover" />
                                                                           ) : (
                                                                                <div className="text-[10px] text-gray-300 font-bold">FE</div>
                                                                           )}
                                                                      </div>
                                                                      <div className="flex-1 min-w-0">
                                                                           <p className="text-sm font-bold text-gray-800 truncate">{item.productSnapshot?.name || "Product"}</p>
                                                                           <div className="flex items-center gap-2 mt-0.5">
                                                                                <span className="text-[10px] text-gray-500 font-medium">{item.productSnapshot?.variantName}</span>
                                                                                <span className="text-[10px] text-gray-300">•</span>
                                                                                <span className="text-[10px] font-bold text-primary">Qty: {item.quantity}</span>
                                                                           </div>
                                                                      </div>
                                                                 </div>
                                                            ))}
                                                       </div>
                                                  </div>
                                             ))}
                                        </div>
                                   ) : (
                                        <div className="text-center py-12 text-gray-400">
                                             <p>No orders yet.</p>
                                             <p className="text-sm mt-2">Start shopping to see your orders here.</p>
                                        </div>
                                   )}

                              </div>
                         </div>

                         {/* Address / Profile Section */}
                         <div className="space-y-8">
                              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                                   <h2 className="text-xl font-bold text-font-title mb-6">Account Details</h2>
                                   <div className="space-y-2 text-gray-600">
                                        <p className="font-bold text-gray-800">{user.name}</p>
                                        <p>{user.email}</p>
                                        <p className="text-sm text-gray-400 mt-4">Addresses will appear here once you checkout.</p>
                                   </div>
                              </div>
                         </div>
                    </div>
               </main>
               <Footer />
          </div>
     );
}
