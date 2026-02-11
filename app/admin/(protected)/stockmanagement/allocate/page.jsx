"use client";

import { useState, useEffect } from "react";
import { MdAdd, MdHistory, MdInventory } from "react-icons/md";
import { adminFetch } from "@/lib/admin/adminFetch";
import toast from "react-hot-toast";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import AdminTable from "@/components/admin/common/AdminTable";
import AdminSearch from "@/components/admin/common/AdminSearch";
import AllocateStockModal from "@/components/admin/stockmanagement/AllocateStockModal";

function formatDate(dateString) {
     return new Date(dateString).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
     });
}

export default function AllocateStockPage() {
     const [allocations, setAllocations] = useState([]);
     const [loading, setLoading] = useState(true);
     const [search, setSearch] = useState("");
     const [isModalOpen, setIsModalOpen] = useState(false);

     useEffect(() => {
          fetchAllocations();
     }, []);

     const fetchAllocations = async () => {
          try {
               const data = await adminFetch("/api/admin/stock/allocate");
               if (data.success) {
                    setAllocations(data.data);
               }
          } catch (e) {
               console.error(e);
               toast.error("Failed to load history");
          } finally {
               setLoading(false);
          }
     };

     // Filter Logic
     const filteredAllocations = allocations.filter(a => {
          const searchLower = search.toLowerCase();
          return (
               a.vendor?.name?.toLowerCase().includes(searchLower) ||
               a.product?.name?.toLowerCase().includes(searchLower) ||
               a.batch?.batchNo?.toLowerCase().includes(searchLower)
          );
     });

     return (
          <div className="space-y-8 animate-in fade-in duration-500">
               <AdminPageHeader
                    title="Stock Allocations"
                    description="Manage inventory distribution to vendors"
                    primaryAction={{
                         label: "Allocate Stock",
                         icon: MdAdd,
                         onClick: () => setIsModalOpen(true)
                    }}
               />

               {/* Stats or Filters could go here */}
               <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                    <AdminSearch
                         value={search}
                         onChange={setSearch}
                         placeholder="Search allocations by vendor, product, or batch..."
                         className="w-full lg:w-96"
                    />
               </div>

               <AdminTable
                    headers={[
                         { label: "Vendor" },
                         { label: "Product Info" },
                         { label: "Source Batch" },
                         { label: "Allocated Qty" },
                         { label: "Date" }
                    ]}
                    loading={loading}
                    loadingMessage="Loading allocations..."
                    emptyMessage="No stock allocations found."
                    colCount={5}
               >
                    {filteredAllocations.map((alloc) => (
                         <tr key={alloc._id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-8 py-5">
                                   <div>
                                        <p className="font-bold text-gray-900">{alloc.vendor?.name || 'Unknown Vendor'}</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">
                                             {alloc.vendor?.companyName || 'N/A'}
                                        </p>
                                   </div>
                              </td>
                              <td className="px-8 py-5">
                                   <div>
                                        <p className="font-medium text-gray-800">{alloc.product?.name || 'Unknown Product'}</p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                             <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                                                  {alloc.variant?.name || 'Var'}
                                             </span>
                                             <span className="font-mono text-[10px] text-gray-400">{alloc.variant?.sku}</span>
                                        </p>
                                   </div>
                              </td>
                              <td className="px-8 py-5">
                                   <span className="font-mono text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg border border-indigo-100">
                                        {alloc.batch?.batchNo || 'N/A'}
                                   </span>
                              </td>
                              <td className="px-8 py-5">
                                   <div className="flex items-center gap-2">
                                        <span className="font-bold text-lg text-gray-900">{alloc.quantity}</span>
                                        <MdInventory size={14} className="text-gray-300" />
                                   </div>
                              </td>
                              <td className="px-8 py-5">
                                   <p className="text-xs text-gray-500 font-medium">{formatDate(alloc.createdAt)}</p>
                              </td>
                         </tr>
                    ))}
               </AdminTable>

               <AllocateStockModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={() => {
                         setLoading(true);
                         fetchAllocations();
                    }}
               />
          </div>
     );
}
