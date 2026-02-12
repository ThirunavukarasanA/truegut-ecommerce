"use client";

import { useState, useEffect, Suspense } from "react";
import { adminFetch } from "@/lib/admin/adminFetch";
import {
     MdMap,
     MdLocationOn,
     MdRefresh,
     MdPerson,
     MdCheckCircle,
     MdPublic,
     MdDomain
} from "react-icons/md";
import toast from "react-hot-toast";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import AdminCard from "@/components/admin/common/AdminCard";
import AdminTable from "@/components/admin/common/AdminTable";
import AdminSelect from "@/components/admin/common/AdminSelect";
import AdminSearch from "@/components/admin/common/AdminSearch";
import AdminStatusBadge from "@/components/admin/common/AdminStatusBadge";
import { useSearchParams, useRouter } from "next/navigation";

function VendorCoverageContent() {
     const searchParams = useSearchParams();
     const router = useRouter();
     const preSelectedVendorId = searchParams.get('vendorId') || "";

     const [vendors, setVendors] = useState([]);
     const [selectedVendor, setSelectedVendor] = useState(preSelectedVendorId);
     const [pincodes, setPincodes] = useState([]);
     const [loading, setLoading] = useState(true);
     const [searchQuery, setSearchQuery] = useState("");

     useEffect(() => {
          fetchVendors();
     }, []);

     useEffect(() => {
          // Sync state with URL if changed externally
          const vid = searchParams.get('vendorId') || "";
          if (vid !== selectedVendor) {
               setSelectedVendor(vid);
          }
     }, [searchParams]);

     useEffect(() => {
          const timer = setTimeout(() => {
               fetchPincodes();
          }, 300);
          return () => clearTimeout(timer);
     }, [selectedVendor, searchQuery]);

     const fetchVendors = async () => {
          try {
               const res = await adminFetch("/api/admin/vendors");
               if (res.success) {
                    setVendors(res.data);
               }
          } catch (error) {
               console.error("Failed to load vendors", error);
          }
     };

     const fetchPincodes = async () => {
          if (!selectedVendor) {
               setPincodes([]);
               setLoading(false);
               return;
          }

          setLoading(true);
          try {
               const query = new URLSearchParams();
               query.append('vendorId', selectedVendor);
               if (searchQuery) query.append('search', searchQuery);

               // Always filter by assigned in this view
               query.append('status', 'assigned');

               const res = await adminFetch(`/api/admin/pincodes/mapping?${query.toString()}`);
               if (res.success) {
                    setPincodes(res.pincodes);
               }
          } catch (error) {
               toast.error("Failed to load pincodes");
          } finally {
               setLoading(false);
          }
     };

     const handleVendorChange = (e) => {
          const vendorId = e.target.value;
          setSelectedVendor(vendorId);

          // Update URL
          const params = new URLSearchParams(searchParams);
          if (vendorId) params.set('vendorId', vendorId);
          else params.delete('vendorId');
          router.push(`?${params.toString()}`);
     };

     return (
          <div className="space-y-8 animate-in fade-in duration-500 pb-20">
               <AdminPageHeader
                    title="Vendor Pincode List"
                    description="View and manage territorial assignments for partners"
               />

               {/* Primary Controls */}
               <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                         <div className="flex-1 max-w-xl">
                              <AdminSelect
                                   label="Choose Vendor"
                                   value={selectedVendor}
                                   onChange={handleVendorChange}
                                   options={vendors.map(v => ({
                                        label: v.name,
                                        value: v._id
                                   }))}
                                   placeholder="-- Select Vendor to View Coverage --"
                                   className="ring-2 ring-primary/5 focus-within:ring-primary/20 transition-all"
                              />
                         </div>

                         <div className="flex-1 max-w-md">
                              <AdminSearch
                                   placeholder="Quick search by Pincode or District..."
                                   value={searchQuery}
                                   onChange={setSearchQuery}
                                   className="shadow-none border-gray-200"
                              />
                         </div>
                    </div>
               </div>

               {/* Table */}
               <AdminCard className="p-0 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                         <h3 className="font-bold text-gray-800">Coverage Details</h3>
                         <div className="flex items-center gap-3">
                              <span className="text-xs font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                                   {pincodes.length} Records Found
                              </span>
                              <button
                                   onClick={fetchPincodes}
                                   className="p-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                              >
                                   <MdRefresh size={18} className={loading ? 'animate-spin' : ''} />
                              </button>
                         </div>
                    </div>
                    <AdminTable
                         headers={[
                              { label: "Pincode" },
                              { label: "State" },
                              { label: "District" },
                              { label: "Status" },
                              { label: "Assigned To" },
                              { label: "Last Sync" }
                         ]}
                         loading={loading}
                         emptyMessage={!selectedVendor ? "Please choose a vendor to view their pincode coverage." : "No assigned pincodes found for this vendor."}
                         colCount={6}
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
                                   <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                             <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                                                  <MdPerson size={14} />
                                             </div>
                                             <span className="text-sm font-bold text-indigo-600">{pin.assignedToVendor?.name || 'N/A'}</span>
                                        </div>
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

export default function AdminVendorPincodesPage() {
     return (
          <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading coverage data...</div>}>
               <VendorCoverageContent />
          </Suspense>
     );
}
