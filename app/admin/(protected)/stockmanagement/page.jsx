"use client";

import { useState, useEffect } from "react";
import { MdInventory, MdAdd, MdWarning, MdDateRange, MdDelete } from "react-icons/md";
import { adminFetch } from "@/lib/adminFetch";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import AdminSearch from "@/components/admin/common/AdminSearch";
import AdminTable from "@/components/admin/common/AdminTable";
import AdminStatusBadge from "@/components/admin/common/AdminStatusBadge";
import StatsCard from "@/components/admin/StatsCard";
import BatchModal from "@/components/admin/stockmanagement/BatchModal";
import toast from "react-hot-toast";

import AddStockModal from "@/components/admin/stockmanagement/AddStockModal";

export default function StockManagementPage() {
     const [batches, setBatches] = useState([]);
     const [loading, setLoading] = useState(true);
     const [search, setSearch] = useState("");
     const [isModalOpen, setIsModalOpen] = useState(false);

     // New State
     const [activeTab, setActiveTab] = useState("all");
     const [addStockBatch, setAddStockBatch] = useState(null);

     const fetchBatches = async () => {
          try {
               const data = await adminFetch(`/api/admin/stockmanagement?search=${search}`);
               if (data.success) {
                    setBatches(data.data);
               }
          } catch (error) {
               console.error(error);
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          fetchBatches();
     }, [search]);

     // Stats Calculation
     const totalStock = batches.filter(b => b.status === 'active').reduce((acc, b) => acc + (b.quantity || 0), 0);
     const expiredStock = batches.filter(b => b.status === 'expired').reduce((acc, b) => acc + (b.quantity || 0), 0);
     const expiredBatchesCount = batches.filter(b => b.status === "expired").length;
     const lowStockBatches = batches.filter(b => b.quantity < 10 && b.status === "active").length;

     // Filter Logic
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
                         title="Total Stock (Active)"
                         value={totalStock.toLocaleString()}
                         icon={MdInventory}
                         variant="blue" // changed from color prop to variant prop for consistency
                    />
                    <StatsCard
                         title="Low Stock"
                         value={lowStockBatches}
                         icon={MdWarning}
                         variant="orange"
                    />
                    <StatsCard
                         title="Expired Stock"
                         value={expiredStock.toLocaleString()}
                         icon={MdDateRange}
                         variant="rose"
                    />
                    <StatsCard
                         title="Expired Batches"
                         value={expiredBatchesCount}
                         icon={MdWarning}
                         variant="rose"
                    />
               </div>

               <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-6 items-center justify-between">
                    <AdminSearch
                         value={search}
                         onChange={setSearch}
                         placeholder="Search stock..."
                         className="w-full lg:w-96"
                    />
                    <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                         {tabs.map(tab => (
                              <button
                                   key={tab.id}
                                   onClick={() => setActiveTab(tab.id)}
                                   className={`px-5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${activeTab === tab.id
                                        ? "bg-primary border-primary text-white shadow-md shadow-gray-200"
                                        : "bg-white border-gray-100 text-gray-500 hover:bg-bg-color hover:text-primary"
                                        }`}
                              >
                                   {tab.label}
                              </button>
                         ))}
                    </div>
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

                                   {/* Reserved Asset (Placeholder) */}
                                   <td className="px-8 py-5">
                                        <span className="text-sm font-medium text-gray-500">0</span>
                                   </td>

                                   {/* Net Stock */}
                                   <td className="px-8 py-5">
                                        <span className="text-sm font-bold text-gray-700">{batch.quantity}</span>
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
