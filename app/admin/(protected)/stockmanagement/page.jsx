"use client";

import { useState, useEffect } from "react";
import { MdInventory, MdAdd, MdWarning, MdDateRange, MdDelete } from "react-icons/md";
import { adminFetch } from "@/lib/admin/adminFetch";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import AdminSearch from "@/components/admin/common/AdminSearch";
import AdminTable from "@/components/admin/common/AdminTable";
import AdminStatusBadge from "@/components/admin/common/AdminStatusBadge";
import AdminTabs from "@/components/admin/common/AdminTabs";
import StatsCard from "@/components/admin/StatsCard";
import BatchModal from "@/components/admin/stockmanagement/BatchModal";
import toast from "react-hot-toast";

import AddStockModal from "@/components/admin/stockmanagement/AddStockModal";

export default function StockManagementPage() {
     const [batches, setBatches] = useState([]);
     const [loading, setLoading] = useState(true);
     const [search, setSearch] = useState("");
     const [isModalOpen, setIsModalOpen] = useState(false);
     const [page, setPage] = useState(1);
     const [totalPages, setTotalPages] = useState(1);
     const [totalBatches, setTotalBatches] = useState(0);
     const [stats, setStats] = useState({
          totalPhysical: 0,
          totalAllocated: 0,
          totalStock: 0,
          expiredStock: 0,
          expiredBatchesCount: 0,
          lowStockBatches: 0
     });

     // New State
     const [activeTab, setActiveTab] = useState("all");
     const [addStockBatch, setAddStockBatch] = useState(null);

     // Handlers to prevent double-fetch
     const handleSearchChange = (val) => {
          setSearch(val);
          setPage(1);
     };

     const fetchBatches = async () => {
          setLoading(true);
          try {
               const data = await adminFetch(`/api/admin/stockmanagement?search=${search}&page=${page}&limit=20`);
               if (data.success) {
                    setBatches(data.data);
                    if (data.pagination) {
                         setTotalPages(data.pagination.pages);
                         setTotalBatches(data.pagination.total);
                    }
                    if (data.stats) {
                         setStats(data.stats);
                    }
               }
          } catch (error) {
               console.error(error);
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          fetchBatches();
     }, [search, page]);

     // Filter Logic (Client-side filtering of CURRENT PAGE)
     const getFilteredBatches = () => {
          switch (activeTab) {
               case "expire-soon":
                    const threeDaysFromNow = new Date();
                    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
                    return batches.filter(b =>
                         b.status === 'active' &&
                         new Date(b.expiryDate) <= threeDaysFromNow &&
                         new Date(b.expiryDate) > new Date()
                    );
               case "low-stock":
                    return batches.filter(b => b.status === 'active' && b.quantity < 10);
               case "expired": // "No Reserved Stock" / Expired
                    return batches.filter(b => b.status === 'expired');
               default:
                    return batches;
          }
     };

     const filteredBatches = getFilteredBatches();

     const tabs = [
          { id: "all", label: "All Stock" },
          { id: "expire-soon", label: "Expire Soon" },
          { id: "low-stock", label: "Low Stock" },
          { id: "expired", label: "No Reserved Stock" }
     ];

     return (
          <div className="space-y-6 animate-in fade-in duration-500">
               <AdminPageHeader
                    title="Stock Management"
                    description="Monitor inventory batches, expiry dates, and warehouse levels"
                    primaryAction={{
                         label: "Add Batch",
                         icon: MdAdd,
                         onClick: () => setIsModalOpen(true)
                    }}
               />

               {/* Stats Cards */}
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                         title="Warehouse Stock"
                         value={(stats.totalPhysical || 0).toLocaleString()}
                         icon={MdInventory}
                         variant="blue"
                    />
                    <StatsCard
                         title="Allocated Stock"
                         value={(stats.totalAllocated || 0).toLocaleString()}
                         icon={MdAdd}
                         variant="orange"
                    />
                    <StatsCard
                         title="Net Stock (Total)"
                         value={(stats.totalStock || 0).toLocaleString()}
                         icon={MdInventory}
                         variant="rose"
                    />
                    <StatsCard
                         title="Expired Stock"
                         value={(stats.expiredStock || 0).toLocaleString()}
                         icon={MdDateRange}
                         variant="rose"
                    />
               </div>

               <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-6 items-center justify-between">
                    <AdminSearch
                         value={search}
                         onChange={handleSearchChange}
                         placeholder="Search stock..."
                         className="w-full lg:w-96"
                    />
                    <AdminTabs
                         tabs={tabs}
                         activeTab={activeTab}
                         onChange={setActiveTab}
                    />
               </div>

               <AdminTable
                    headers={[
                         { label: "ProductDetails" },
                         { label: "Physical Stock" },
                         { label: "Reserved Asset" },
                         { label: "Net stock" },
                         { label: "Batch Info" },
                         { label: "Expiry" },
                         { label: "Status" },
                         { label: "action", align: "right" }
                    ]}
                    loading={loading}
                    colCount={8}
                    emptyMessage="No stock batches found."
               >
                    {filteredBatches.map((batch) => {
                         const isExpired = batch.status === 'expired';
                         const isLowStock = batch.quantity < 10 && !isExpired;

                         return (
                              <tr key={batch._id} className={`transition-colors ${isExpired ? "bg-red-50/50 hover:bg-red-50" : "hover:bg-gray-50/50"}`}>

                                   {/* Product Details */}
                                   <td className="px-8 py-5">
                                        <div>
                                             <p className="font-bold text-gray-800">{batch.product?.name}</p>
                                             <p className="text-xs text-gray-500 font-medium">{batch.variant?.name}</p>
                                        </div>
                                   </td>

                                   {/* Physical Stock */}
                                   <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                             <span className={`text-sm font-bold ${isLowStock ? "text-orange-500" : (isExpired ? "text-red-500" : "text-gray-700")}`}>
                                                  {batch.quantity}
                                             </span>
                                             {isLowStock && (
                                                  <div className="group relative">
                                                       <MdWarning className="text-orange-400 animate-pulse" />
                                                       <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 text-[10px] font-bold text-primary bg-bg-color px-2 py-1 rounded-lg border border-primary/10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                            Low Stock - Reorder
                                                       </span>
                                                  </div>
                                             )}
                                        </div>
                                   </td>

                                   {/* Reserved Asset (Allocated to Vendor) */}
                                   <td className="px-8 py-5">
                                        <span className="text-sm font-medium text-gray-500">{batch.allocatedQuantity || 0}</span>
                                   </td>

                                   {/* Net Stock (Total) */}
                                   <td className="px-8 py-5">
                                        <span className="text-sm font-bold text-gray-700">{(batch.quantity || 0) + (batch.allocatedQuantity || 0)}</span>
                                   </td>

                                   {/* Batch Info */}
                                   <td className="px-8 py-5">
                                        <div className="font-mono text-xs text-primary bg-bg-color px-2 py-1 rounded-md border border-gray-100 inline-block">
                                             {batch.batchNo}
                                        </div>
                                   </td>

                                   {/* Expiry */}
                                   <td className="px-8 py-5">
                                        <div className={`flex items-center gap-2 ${isExpired ? "text-red-600 font-bold" : "text-gray-500"}`}>
                                             <MdDateRange size={14} />
                                             <span className={`text-xs ${isExpired ? "text-red-600" : ""}`}>
                                                  {new Date(batch.expiryDate).toLocaleDateString()}
                                             </span>
                                        </div>
                                   </td>

                                   {/* Status */}
                                   <td className="px-8 py-5">
                                        <AdminStatusBadge status={batch.status} />
                                   </td>

                                   {/* Action */}
                                   <td className="px-8 py-5 text-right flex justify-end">
                                        <button
                                             onClick={() => setAddStockBatch(batch)}
                                             disabled={isExpired}
                                             className={`p-2 rounded-full transition-all ${isExpired
                                                  ? "bg-gray-100 hover:bg-gray-900 hover:text-white text-gray-600 cursor-not-allowed"
                                                  : "bg-primary hover:bg-secondary hover:text-white text-white"
                                                  }`}
                                             title="Add Stock"
                                        >
                                             <MdAdd size={18} />
                                        </button>
                                   </td>
                              </tr>
                         );
                    })}
               </AdminTable>

               {/* Pagination Controls */}
               <div className="px-8 py-6 border-t border-gray-50 flex items-center justify-between text-[10px] font-medium uppercase tracking-widest text-gray-400">
                    <span>Showing {filteredBatches.length} (Page {page}) of {totalBatches} Batches</span>
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

               <BatchModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={fetchBatches}
               />

               <AddStockModal
                    isOpen={!!addStockBatch}
                    onClose={() => setAddStockBatch(null)}
                    batch={addStockBatch}
                    onSave={fetchBatches}
               />
          </div>
     );
}
