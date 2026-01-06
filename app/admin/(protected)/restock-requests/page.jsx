"use client";
import React, { useState, useEffect } from "react";
import AdminPageHeader from "@/components/Admin/common/AdminPageHeader";
import AdminTable from "@/components/Admin/common/AdminTable";
import { toast } from "react-hot-toast";
import { MdEmail, MdPhone, MdCalendarToday, MdInventory } from "react-icons/md";
import { adminFetchWithToast } from "@/lib/adminFetch";

export default function RestockRequestsPage() {
     const [requests, setRequests] = useState([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          fetchRequests();
     }, []);

     const fetchRequests = async () => {
          try {
               const data = await adminFetchWithToast("/api/admin/restock-requests");
               if (data.success) {
                    setRequests(data.requests);
               }
          } catch (error) {
               console.error("Error fetching requests:", error);
               toast.error("Failed to load requests");
          } finally {
               setLoading(false);
          }
     };

     const headers = [
          { label: "Product / Variant" },
          { label: "Customer Info" },
          { label: "Date Requested" },
          { label: "Status" }
     ];

     return (
          <div className="space-y-6">
               <AdminPageHeader
                    title="Restock Requests"
                    description="View customers waiting for out-of-stock items"
                    icon={MdInventory}
               />

               <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <AdminTable
                         headers={headers}
                         loading={loading}
                         emptyMessage="No restock requests found."
                         colCount={4}
                    >
                         {requests.map((item) => (
                              <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                                   <td className="px-8 py-4">
                                        <div className="flex flex-col">
                                             <span className="font-medium text-gray-800">{item.product?.name || "Unknown Product"}</span>
                                             <span className="text-xs text-gray-500 bg-gray-100 w-fit px-2 py-0.5 rounded mt-1">
                                                  Variant: {item.variant?.name || "Unknown"}
                                             </span>
                                        </div>
                                   </td>
                                   <td className="px-8 py-4">
                                        <div className="flex flex-col gap-1">
                                             <span className="font-semibold text-gray-700">{item.name}</span>
                                             <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                  <MdEmail size={12} /> {item.email}
                                             </div>
                                             {item.phone && (
                                                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                       <MdPhone size={12} /> {item.phone}
                                                  </div>
                                             )}
                                        </div>
                                   </td>
                                   <td className="px-8 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                             <MdCalendarToday size={14} className="text-gray-400" />
                                             {new Date(item.createdAt).toLocaleDateString("en-IN", {
                                                  day: "numeric",
                                                  month: "short",
                                                  year: "numeric",
                                             })}
                                        </div>
                                   </td>
                                   <td className="px-8 py-4">
                                        <span
                                             className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === "pending"
                                                  ? "bg-amber-100 text-amber-700"
                                                  : item.status === "notified"
                                                       ? "bg-green-100 text-green-700"
                                                       : "bg-gray-100 text-gray-600"
                                                  }`}
                                        >
                                             {item.status.toUpperCase()}
                                        </span>
                                   </td>
                              </tr>
                         ))}
                    </AdminTable>
               </div>
          </div>
     );
}
