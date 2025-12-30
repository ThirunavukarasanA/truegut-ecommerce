"use client";

import { useState, useEffect } from "react";
import { MdSearch, MdVisibility, MdPrint, MdLocalShipping, MdCheckCircle, MdCancel, MdContentCopy } from "react-icons/md";
import toast from "react-hot-toast";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import AdminTabs from "@/components/admin/common/AdminTabs";
import AdminSearch from "@/components/admin/common/AdminSearch";
import AdminTable from "@/components/admin/common/AdminTable";
import AdminStatusBadge from "@/components/admin/common/AdminStatusBadge";

const tabs = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Returns"];

export default function OrdersPage() {
     const [activeTab, setActiveTab] = useState("All");
     const [orders, setOrders] = useState([]);
     const [loading, setLoading] = useState(true);
     const [search, setSearch] = useState("");

     useEffect(() => {
          fetchOrders();
     }, [activeTab, search]);

     const fetchOrders = async () => {
          setLoading(true);
          try {
               let url = `/api/admin/orders?status=${activeTab}`;
               if (search) url += `&search=${search}`;
               const res = await fetch(url);
               const data = await res.json();
               if (data.success) {
                    setOrders(data.data || []);
               }
          } catch (e) {
               toast.error("Failed to load orders");
          } finally {
               setLoading(false);
          }
     };

     const copyOrderId = (id) => {
          navigator.clipboard.writeText(id);
          toast.success("Order ID copied to clipboard", {
               icon: '📋',
               style: { borderRadius: '12px', fontSize: '12px', fontWeight: '600' }
          });
     };

     const tableHeaders = [
          { label: "Ref" },
          { label: "Reference" },
          { label: "Customer Profile" },
          { label: "Timestamp" },
          { label: "Gross Valuation" },
          { label: "Flow State" },
          { label: "Actions", align: "right" }
     ];

     return (
          <div className="space-y-10 animate-in fade-in duration-500">
               {/* Header */}
               <AdminPageHeader
                    title="Orders Hub"
                    description="Fulfillment tracking and transaction management."
                    secondaryAction={{
                         label: "Batch Export",
                         onClick: () => toast.info("Exporting..."),
                         icon: MdPrint
                    }}
               />

               {/* Modern Tabs */}
               <AdminTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onChange={setActiveTab}
               />

               {/* Search & Intelligence */}
               <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <AdminSearch
                         value={search}
                         onChange={setSearch}
                         placeholder="Search by ID, patron or email..."
                         className="w-full lg:w-96"
                    />
               </div>

               {/* Orders Matrix */}
               <AdminTable
                    headers={tableHeaders}
                    loading={loading}
                    loadingMessage="Querying Orders..."
                    emptyMessage="No order entries matching criteria."
                    colCount={7}
               >
                    {orders.map((order) => (
                         <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-8 py-6 w-12">
                                   <input type="checkbox" className="rounded-md border-gray-200 text-purple-600 focus:ring-purple-100" />
                              </td>
                              <td className="px-8 py-6">
                                   <div className="flex items-center gap-2">
                                        <span className="font-light text-gray-800 text-sm tracking-tight">{order._id.slice(-8).toUpperCase()}</span>
                                        <button onClick={() => copyOrderId(order._id)} className="p-1.5 text-gray-200 hover:text-purple-400 transition-colors">
                                             <MdContentCopy size={14} />
                                        </button>
                                   </div>
                              </td>
                              <td className="px-8 py-6">
                                   <div>
                                        <p className="font-light text-gray-700 text-sm group-hover:text-purple-600 transition-colors tracking-tight">{order.customer?.name || "N/A"}</p>
                                        <p className="text-[10px] text-gray-400 font-light uppercase tracking-widest leading-none mt-1.5">{order.customer?.email || "N/A"}</p>
                                   </div>
                              </td>
                              <td className="px-8 py-6 text-xs font-light text-gray-400 uppercase tracking-widest">
                                   {new Date(order.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-8 py-6 font-light text-gray-800 text-base">
                                   ₹{order.totalAmount?.toFixed(2)}
                              </td>
                              <td className="px-8 py-6">
                                   <AdminStatusBadge status={order.status} />
                              </td>
                              <td className="px-8 py-6 text-right">
                                   <button className="p-3 bg-white text-gray-400 hover:text-purple-600 rounded-xl shadow-sm border border-gray-50 transition-all hover:shadow-md" title="Intelligence Review">
                                        <MdVisibility size={20} />
                                   </button>
                              </td>
                         </tr>
                    ))}
               </AdminTable>

               {orders.length > 0 && (
                    <div className="px-8 py-6 border-t border-gray-50 flex items-center justify-between text-[10px] font-medium uppercase tracking-widest text-gray-400">
                         <span>Batch {orders.length} Records</span>
                         <div className="flex gap-2">
                              <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-purple-200 hover:text-purple-600 transition-all">Prev</button>
                              <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-purple-200 hover:text-purple-600 transition-all">Next</button>
                         </div>
                    </div>
               )}
          </div>
     );
}
