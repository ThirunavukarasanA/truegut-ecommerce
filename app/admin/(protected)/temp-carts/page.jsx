"use client";

import { useState, useEffect } from "react";
import { MdShoppingCart, MdDevices, MdHistory, MdLocationOn } from "react-icons/md";
import toast from "react-hot-toast";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import AdminTable from "@/components/admin/common/AdminTable";
import AdminStatusBadge from "@/components/admin/common/AdminStatusBadge";

export default function TempCartsPage() {
     const [tempCarts, setTempCarts] = useState([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          fetchTempCarts();
     }, []);

     const fetchTempCarts = async () => {
          try {
               const res = await fetch("/api/admin/temp-carts");
               const data = await res.json();
               if (data.tempCarts) {
                    setTempCarts(data.tempCarts);
               } else {
                    toast.error(data.error || "Failed to load temporary carts");
               }
          } catch (error) {
               toast.error("An error occurred while fetching data");
          } finally {
               setLoading(false);
          }
     };

     const tableHeaders = [
          { label: "Session ID" },
          { label: "Items" },
          { label: "Device Info" },
          { label: "IP Address" },
          { label: "Last Activity" },
          { label: "Status" }
     ];

     return (
          <div className="space-y-6 animate-in fade-in duration-500">
               <AdminPageHeader
                    title="Temporary Carts"
                    description="Monitor active guest shopping sessions and abandoned carts in real-time"
               />

               <AdminTable
                    headers={tableHeaders}
                    loading={loading}
                    loadingMessage="Loading temporary carts..."
                    emptyMessage="No temporary carts found."
                    colCount={6}
               >
                    {tempCarts.map((cart) => (
                         <tr key={cart._id} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-8 py-5">
                                   <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl border border-purple-100/50">
                                             <MdShoppingCart size={18} />
                                        </div>
                                        <div>
                                             <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">
                                                  {cart.sessionId.slice(0, 8)}...{cart.sessionId.slice(-4)}
                                             </p>
                                        </div>
                                   </div>
                              </td>
                              <td className="px-8 py-5">
                                   <span className="text-sm font-light text-gray-800 tracking-tight">
                                        {cart.items.reduce((sum, item) => sum + item.quantity, 0)} items
                                   </span>
                                   <p className="text-[10px] text-gray-400 font-light uppercase tracking-widest mt-0.5">
                                        Total: ₹{cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                                   </p>
                              </td>
                              <td className="px-8 py-5">
                                   <div className="flex items-center gap-3">
                                        <MdDevices className="text-gray-300" size={18} />
                                        <div className="text-xs">
                                             <p className="font-light text-gray-700 uppercase tracking-tight">{cart.metadata?.deviceType || "Unknown"}</p>
                                             <p className="text-[10px] text-gray-400 font-light truncate max-w-[150px] uppercase tracking-widest" title={cart.metadata?.userAgent}>
                                                  {cart.metadata?.userAgent || "No user agent"}
                                             </p>
                                        </div>
                                   </div>
                              </td>
                              <td className="px-8 py-5">
                                   <div className="flex items-center gap-2">
                                        <MdLocationOn className="text-gray-300" size={18} />
                                        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">{cart.metadata?.ipAddress || "Unknown"}</span>
                                   </div>
                              </td>
                              <td className="px-8 py-5">
                                   <div className="flex items-center gap-2 text-[10px] text-gray-400 font-light uppercase tracking-widest">
                                        <MdHistory className="text-gray-300" size={18} />
                                        {new Date(cart.updatedAt).toLocaleString()}
                                   </div>
                              </td>
                              <td className="px-8 py-5">
                                   <AdminStatusBadge
                                        status={new Date() - new Date(cart.updatedAt) < 3600000 ? "Active" : "Idle"}
                                   />
                              </td>
                         </tr>
                    ))}
               </AdminTable>
          </div>
     );
}
