import React from "react";

export default function OrderItem({ order, index }) {
     const statusColors = {
          Delivered: "bg-emerald-100 text-emerald-700",
          Cancelled: "bg-rose-100 text-rose-700",
          Processing: "bg-sky-100 text-sky-700",
          Shipped: "bg-blue-100 text-blue-700",
          Pending: "bg-amber-100 text-amber-700",
     };

     return (
          <div className="border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow relative overflow-hidden group bg-white">
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
                         <p className="text-gray-800 font-semibold text-sm">
                              {new Date(order.createdAt).toLocaleDateString(undefined, {
                                   day: "numeric",
                                   month: "short",
                                   year: "numeric",
                              })}
                         </p>
                    </div>
                    <div className="min-w-[120px]">
                         <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Payment Method</p>
                         <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter border ${order.paymentDetails?.method === "COD"
                                        ? "bg-amber-50 text-amber-700 border-amber-100"
                                        : "bg-blue-50 text-blue-700 border-blue-100"
                                   }`}
                         >
                              {order.paymentDetails?.method === "COD" ? "Cash on Delivery" : "Online (Razorpay)"}
                         </span>
                    </div>
                    <div className="min-w-[80px]">
                         <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Total Amount</p>
                         <p className="text-primary font-black text-base">₹{order.totalAmount}</p>
                    </div>
                    <div>
                         <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Status</p>
                         <span
                              className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[order.status] || "bg-gray-100 text-gray-700"
                                   }`}
                         >
                              {order.status}
                         </span>
                    </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {order.items.map((item, idx) => (
                         <div
                              key={idx}
                              className="flex gap-4 items-center bg-gray-50/50 p-3 rounded-xl border border-transparent hover:border-gray-100 hover:bg-white transition-all"
                         >
                              <div className="h-14 w-14 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-50 overflow-hidden shrink-0">
                                   {item.product?.images?.[0]?.url ? (
                                        <img
                                             src={item.product.images[0].url}
                                             alt={item.productSnapshot?.name}
                                             className="h-full w-full object-cover"
                                        />
                                   ) : (
                                        <div className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">FE</div>
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
     );
}
