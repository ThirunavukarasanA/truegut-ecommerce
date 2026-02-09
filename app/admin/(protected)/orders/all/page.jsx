"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MdSearch, MdVisibility, MdPrint, MdContentCopy } from "react-icons/md";
import { adminFetch } from "@/lib/admin/adminFetch";
import toast from "react-hot-toast";
import { useSettings } from "@/context/SettingsContext";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import AdminTabs from "@/components/admin/common/AdminTabs";
import AdminSearch from "@/components/admin/common/AdminSearch";
import AdminTable from "@/components/admin/common/AdminTable";
import AdminStatusBadge from "@/components/admin/common/AdminStatusBadge";

const tabs = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Returns"];

export default function OrdersPage() {
     const router = useRouter();
     const { settings } = useSettings();
     const [activeTab, setActiveTab] = useState("All");
     const [orders, setOrders] = useState([]);
     const [loading, setLoading] = useState(true);
     const [search, setSearch] = useState("");
     const [page, setPage] = useState(1);
     const [totalPages, setTotalPages] = useState(1);
     const [totalOrders, setTotalOrders] = useState(0);

     // Confirm State


     // Handlers to prevent double-fetch (reset page + update state in one go)
     const handleTabChange = (tab) => {
          setActiveTab(tab);
          setPage(1);
     };

     const handleSearchChange = (val) => {
          setSearch(val);
          setPage(1);
     };

     useEffect(() => {
          fetchOrders();
     }, [activeTab, search, page]);

     const fetchOrders = async () => {
          setLoading(true);
          try {
               let url = `/api/admin/orders?status=${activeTab}&page=${page}&limit=20`;
               if (search) url += `&search=${search}`;
               const result = await adminFetch(url);
               if (result.success) {
                    setOrders(result.data || []);
                    if (result.pagination) {
                         setTotalPages(result.pagination.pages);
                         setTotalOrders(result.pagination.total);
                    }
               }
          } catch (e) {
               if (e.message !== 'Unauthorized - Redirecting to login') {
                    toast.error("Failed to load orders");
               }
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
                    onChange={handleTabChange}
               />

               {/* Search & Intelligence */}
               <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <AdminSearch
                         value={search}
                         onChange={handleSearchChange}
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
                                   <input type="checkbox" className="rounded-md border-gray-200 text-primary focus:ring-bg-color" />
                              </td>
                              <td className="px-8 py-6">
                                   <div className="flex items-center gap-2">
                                        <span className="font-light text-gray-800 text-sm tracking-tight">{order._id.slice(-8).toUpperCase()}</span>
                                        <button onClick={() => copyOrderId(order._id)} className="p-1.5 text-gray-200 hover:text-primary transition-colors">
                                             <MdContentCopy size={14} />
                                        </button>
                                   </div>


                              </td>
                              <td className="px-8 py-6">
                                   <div>
                                        <p className="font-light text-gray-700 text-sm group-hover:text-primary transition-colors tracking-tight">{order.customer?.name || "N/A"}</p>
                                        <p className="text-[10px] text-gray-400 font-light uppercase tracking-widest leading-none mt-1.5">{order.customer?.email || "N/A"}</p>
                                   </div>
                              </td>
                              <td className="px-8 py-6 text-xs font-light text-gray-400 uppercase tracking-widest">
                                   {new Date(order.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-8 py-6 font-light text-gray-800 text-base">
                                   {settings.currency.symbol}{order.totalAmount?.toFixed(2)}
                              </td>
                              <td className="px-8 py-6">
                                   <AdminStatusBadge status={order.status} />
                              </td>
                              <td className="px-8 py-6 text-right">
                                   <div className="flex items-center justify-end gap-2">
                                        <button
                                             onClick={() => router.push(`/admin/orders/${order._id}`)}
                                             className="p-2 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                                             title="View Details"
                                        >
                                             <MdVisibility size={18} />
                                        </button>
                                   </div>
                              </td>
                         </tr>
                    ))}
               </AdminTable>

               {/* Paginator */}
               <div className="px-8 py-6 border-t border-gray-50 flex items-center justify-between text-[10px] font-medium uppercase tracking-widest text-gray-400">
                    <span>Showing {orders.length} of {totalOrders} Records</span>
                    <div className="flex gap-2">
                         <button
                              disabled={page === 1}
                              onClick={() => setPage(p => Math.max(1, p - 1))}
                              className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                              Prev
                         </button>
                         <span className="flex items-center px-2">Page {page} of {totalPages}</span>
                         <button
                              disabled={page >= totalPages}
                              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                              className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                              Next
                         </button>
                    </div>
               </div>
          </div>
     );
}
