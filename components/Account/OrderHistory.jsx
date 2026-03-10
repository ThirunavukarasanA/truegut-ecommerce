import React from "react";
import OrderItem from "./OrderItem";

export default function OrderHistory({ orders, loading }) {
     if (loading) {
          return (
               <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm min-h-[400px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                         <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
                         <p className="text-gray-400 text-sm font-medium animate-pulse">Fetching your orders...</p>
                    </div>
               </div>
          );
     }

     return (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
               <div className="flex justify-between items-center mb-8">
                    <div>
                         <h2 className="text-xl font-bold text-font-title">Order History</h2>
                         <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-medium">Track your recent purchases</p>
                    </div>
                    <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-4 py-1.5 rounded-full uppercase tracking-widest border border-gray-100">
                         Total {orders.length} Orders
                    </span>
               </div>

               {orders.length > 0 ? (
                    <div className="space-y-6">
                         {orders.map((order, index) => (
                              <OrderItem key={order._id} order={order} index={index} />
                         ))}
                    </div>
               ) : (
                    <div className="text-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                         <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                              </svg>
                         </div>
                         <h3 className="text-gray-800 font-bold mb-1">No orders yet</h3>
                         <p className="text-gray-400 text-sm max-w-[240px] mx-auto">Looks like you haven't placed any orders with us yet.</p>
                         <button
                              onClick={() => window.location.href = '/collections'}
                              className="mt-6 text-primary font-bold text-sm hover:underline underline-offset-4"
                         >
                              Start Shopping →
                         </button>
                    </div>
               )}
          </div>
     );
}
