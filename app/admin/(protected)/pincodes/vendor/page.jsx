"use client";

import { useState, useEffect } from "react";
import { adminFetch } from "@/lib/admin/adminFetch";
import {
     MdMap,
     MdLocationOn,
     MdRefresh,
     MdCheckCircle,
     MdPublic,
     MdDomain
} from "react-icons/md";
import toast from "react-hot-toast";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import AdminCard from "@/components/admin/common/AdminCard";
import AdminTable from "@/components/admin/common/AdminTable";
import AdminSearch from "@/components/admin/common/AdminSearch";
import AdminStatusBadge from "@/components/admin/common/AdminStatusBadge";

export default function VendorPincodesPage() {
     const [pincodes, setPincodes] = useState([]);
     const [loading, setLoading] = useState(true);
     const [searchTerm, setSearchTerm] = useState("");
     const [stats, setStats] = useState({
          total: 0,
          serviceable: 0,
          states: 0,
          districts: 0
     });

     useEffect(() => {
          fetchPincodes();
     }, []);

     const fetchPincodes = async () => {
          setLoading(true);
          try {
               // 1. Get current user
               const userRes = await adminFetch("/api/auth/me");
               if (!userRes?.user?.vendorId) {
                    toast.error("Vendor profile not found");
                    setLoading(false);
                    return;
               }

               // 2. Fetch rich pincode data
               const query = new URLSearchParams({
                    vendorId: userRes.user.vendorId
               });
               if (searchTerm) query.append('search', searchTerm);

               const res = await adminFetch(`/api/admin/pincodes/mapping?${query.toString()}`);
               if (res.success) {
                    setPincodes(res.pincodes);

                    // Calculate Stats
                    const uniqueStates = new Set(res.pincodes.map(p => p.stateCode)).size;
                    const uniqueDistricts = new Set(res.pincodes.map(p => p.district)).size;
                    const serviceableCount = res.pincodes.filter(p => p.isServiceable).length;

                    setStats({
                         total: res.pincodes.length,
                         serviceable: serviceableCount,
                         states: uniqueStates,
                         districts: uniqueDistricts
                    });
               }
          } catch (error) {
               toast.error("Failed to load pincodes");
          } finally {
               setLoading(false);
          }
     };

     return (
          <div className="space-y-8 animate-in fade-in duration-500 pb-12">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                         <h1 className="text-2xl font-bold text-gray-900">My Serviceable Pincodes</h1>
                         <p className="text-sm text-gray-500">List of pincodes where you provide delivery services.</p>
                    </div>
                    <button
                         onClick={fetchPincodes}
                         className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                    >
                         <MdRefresh size={18} className={loading ? 'animate-spin' : ''} />
                         Refresh
                    </button>
               </div>

               {/* Stats Overview */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-full group hover:border-primary/30 transition-all">
                         <div className="flex items-center gap-4 mb-4">
                              <div className="p-3 bg-primary/5 text-primary rounded-2xl group-hover:scale-110 transition-transform">
                                   <MdLocationOn size={24} />
                              </div>
                              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Pincodes</span>
                         </div>
                         <div>
                              <div className="text-3xl font-black text-gray-800">{stats.total.toLocaleString()}</div>
                              <div className="text-xs text-gray-400 mt-1">Unique pincodes</div>
                         </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-full group hover:border-emerald-500/30 transition-all">
                         <div className="flex items-center gap-4 mb-4">
                              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                                   <MdCheckCircle size={24} />
                              </div>
                              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Serviceable</span>
                         </div>
                         <div>
                              <div className="text-3xl font-black text-emerald-600">{stats.serviceable.toLocaleString()}</div>
                              <div className="text-xs text-gray-400 mt-1">Delivery active</div>
                         </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-full group hover:border-indigo-500/30 transition-all">
                         <div className="flex items-center gap-4 mb-4">
                              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                                   <MdPublic size={24} />
                              </div>
                              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">States</span>
                         </div>
                         <div>
                              <div className="text-3xl font-black text-indigo-600">{stats.states}</div>
                              <div className="text-xs text-gray-400 mt-1">Regional reaches</div>
                         </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-full group hover:border-amber-500/30 transition-all">
                         <div className="flex items-center gap-4 mb-4">
                              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform">
                                   <MdDomain size={24} />
                              </div>
                              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Districts</span>
                         </div>
                         <div>
                              <div className="text-3xl font-black text-amber-600">{stats.districts}</div>
                              <div className="text-xs text-gray-400 mt-1">Local distribution nodes</div>
                         </div>
                    </div>
               </div>

               {/* Filter Bar */}
               <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="relative max-w-md">
                         <AdminSearch
                              placeholder="Search by Pincode or District..."
                              value={searchTerm}
                              onChange={setSearchTerm}
                         />
                    </div>
               </div>

               {/* Data Table */}
               <AdminCard className="p-0 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                         <h3 className="font-bold text-gray-800">Coverage Details</h3>
                         <span className="text-xs font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                              {pincodes.length} Records Found
                         </span>
                    </div>
                    <AdminTable
                         headers={[
                              { label: "Pincode" },
                              { label: "State" },
                              { label: "District" },
                              { label: "Status" },
                              { label: "Last Updated" }
                         ]}
                         loading={loading}
                         emptyMessage={searchTerm ? "No pincodes found matching your search." : "No assigned pincodes found. Please contact administrator."}
                         colCount={5}
                    >
                         {pincodes.map((pin) => (
                              <tr key={pin._id} className="hover:bg-gray-50/50 transition-colors group">
                                   <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                  <MdLocationOn size={16} />
                                             </div>
                                             <span className="font-black text-lg text-gray-800 tracking-tight font-mono">{pin.pincode}</span>
                                        </div>
                                   </td>
                                   <td className="px-8 py-5">
                                        <div className="text-sm font-bold text-gray-700">{pin.state}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{pin.stateCode}</div>
                                   </td>
                                   <td className="px-8 py-5">
                                        <span className="text-sm text-gray-600 font-medium">{pin.district}</span>
                                   </td>
                                   <td className="px-8 py-5">
                                        <AdminStatusBadge
                                             status={pin.isServiceable ? 'Active' : 'Blocked'}
                                             variant={pin.isServiceable ? 'success' : 'danger'}
                                        />
                                   </td>
                                   <td className="px-8 py-5 text-sm text-gray-400 font-medium">
                                        {new Date(pin.updatedAt).toLocaleDateString()}
                                   </td>
                              </tr>
                         ))}
                    </AdminTable>
               </AdminCard>
          </div>
     );
}
