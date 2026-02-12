"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MdSearch, MdAdd, MdMap, MdEdit, MdStore, MdPhone, MdEmail, MdDelete, MdInventory2 } from "react-icons/md";
import { adminFetch } from "@/lib/admin/adminFetch";
import toast from "react-hot-toast";
import VendorModal from "./VendorModal";
import VendorPincodeModal from "./VendorPincodeModal";
import AdminConfirmModal from "@/components/admin/common/AdminConfirmModal";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import AdminSearch from "@/components/admin/common/AdminSearch";
import AdminTable from "@/components/admin/common/AdminTable";
import AdminStatusBadge from "@/components/admin/common/AdminStatusBadge";

export default function VendorsListPage() {
     const router = useRouter();
     const [vendors, setVendors] = useState([]);
     const [loading, setLoading] = useState(true);
     const [search, setSearch] = useState("");

     // Modal State
     const [isModalOpen, setIsModalOpen] = useState(false);
     const [selectedVendor, setSelectedVendor] = useState(null);


     // Confirm State
     const [isConfirmOpen, setIsConfirmOpen] = useState(false);
     const [vendorToDelete, setVendorToDelete] = useState(null);

     useEffect(() => {
          fetchVendors();
     }, [search]);

     const fetchVendors = async () => {
          try {
               const data = await adminFetch(`/api/admin/vendors?search=${search}`);
               if (data.success) {
                    setVendors(Array.isArray(data.data) ? data.data : []);
               }
          } catch (e) {
               if (e.message !== 'Unauthorized - Redirecting to login') {
                    toast.error("Failed to load vendors");
               }
          } finally {
               setLoading(false);
          }
     };

     const handleCreate = () => {
          setSelectedVendor(null);
          setIsModalOpen(true);
     };

     const handleEdit = (vendor) => {
          setSelectedVendor(vendor);
          setIsModalOpen(true);
     };

     const handleViewPincodes = (vendor) => {
          router.push(`/admin/vendors/pincodes?vendorId=${vendor._id}`);
     };

     const handleDelete = (id) => {
          setVendorToDelete(id);
          setIsConfirmOpen(true);
     };

     const confirmDelete = async () => {
          if (!vendorToDelete) return;
          const toastId = toast.loading("Removing partner...");
          try {
               const data = await adminFetch(`/api/admin/vendors/${vendorToDelete}`, { method: "DELETE" });
               if (data.success) {
                    toast.success("Partner removed", { id: toastId });
                    fetchVendors();
               } else {
                    toast.error(data.error || "Delete failed", { id: toastId });
               }
          } catch (error) {
               if (error.message !== 'Unauthorized - Redirecting to login') {
                    toast.error("Failed to delete", { id: toastId });
               }
          } finally {
               setIsConfirmOpen(false);
               setVendorToDelete(null);
          }
     };

     const handleSave = () => {
          fetchVendors();
     };

     return (
          <div className="space-y-10 animate-in fade-in duration-500">
               {/* Header */}
               {/* Page Header */}
               <AdminPageHeader
                    title="Vendors"
                    description="Manage partner logistics and sourcing network"
                    primaryAction={{
                         label: "Register Partner",
                         onClick: handleCreate,
                         icon: MdAdd
                    }}
               />

               {/* Search & Filters */}
               <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-6 items-center justify-between">
                    <AdminSearch
                         value={search}
                         onChange={setSearch}
                         placeholder="Search partners by name or region..."
                         className="w-full lg:w-96"
                    />
               </div>

               {/* Vendor List Table */}
               <AdminTable
                    headers={[
                         { label: "Partner" },
                         { label: "Contact" },
                         { label: "Email" },
                         { label: "Logistics Hubs" },
                         { label: "Inventory" },
                         { label: "Activity" },
                         { label: "Actions", align: "right" }
                    ]}
                    loading={loading}
                    loadingMessage="Accessing Supply Chain..."
                    emptyMessage="No partners registered in our network."
                    colCount={6}
               >
                    {vendors.map((vendor) => (
                         <tr key={vendor._id} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-8 py-5">
                                   <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-bg-color to-gray-50 border border-gray-100 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                                             {vendor.name ? vendor.name.charAt(0) : 'V'}
                                        </div>
                                        <div>
                                             <p className="font-medium text-gray-900 group-hover:text-primary transition-colors">{vendor.name || "Unnamed Partner"}</p>
                                        </div>
                                   </div>
                              </td>
                              <td className="px-8 py-5">
                                   <div className="space-y-1">
                                        <p className="text-xs text-gray-600 flex items-center gap-2">
                                             <MdPhone size={14} className="text-gray-300" /> {vendor.phone}
                                        </p>
                                   </div>
                              </td>
                              <td className="px-8 py-5">
                                   <div className="space-y-1">
                                        <p className="text-xs text-gray-600 flex items-center gap-2">
                                             <MdEmail size={14} className="text-gray-300" /> {vendor.email}
                                        </p>
                                   </div>
                              </td>
                              <td className="px-8 py-5">
                                   <button
                                        onClick={() => handleViewPincodes(vendor)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-bg-color text-primary rounded-lg text-[10px] font-medium uppercase tracking-wide border border-primary/10 hover:bg-primary hover:text-white transition-colors cursor-pointer"
                                   >
                                        <MdMap size={14} /> {vendor.serviceablePincodes?.length || 0} Points
                                   </button>
                              </td>
                              <td className="px-8 py-5">
                                   <div className="flex flex-col gap-1">
                                        <span className="text-sm font-medium text-gray-900">{vendor.stock || 0}</span>
                                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">in stock</span>
                                   </div>
                              </td>
                              <td className="px-8 py-5">
                                   <AdminStatusBadge status={vendor.isActive ? 'Active' : 'Terminated'} />
                              </td>
                              <td className="px-8 py-5 text-right">
                                   <div className="flex items-center justify-end gap-2 pr-2">
                                        <button
                                             onClick={() => router.push(`/admin/vendors/vendor-stock?vendorId=${vendor._id}`)}
                                             className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100"
                                             title="View Stock Inventory"
                                        >
                                             <MdInventory2 size={18} />
                                        </button>
                                        <button
                                             onClick={() => handleEdit(vendor)}
                                             className="p-2.5 text-gray-400 hover:text-primary hover:bg-bg-color active:bg-primary/10 rounded-xl transition-all border border-transparent hover:border-gray-100"
                                             title="Edit Profile"
                                        >
                                             <MdEdit size={18} />
                                        </button>
                                        <button
                                             onClick={() => handleDelete(vendor._id)}
                                             className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100/50"
                                             title="Terminate Partnership"
                                        >
                                             <MdDelete size={18} />
                                        </button>
                                   </div>
                              </td>
                         </tr>
                    ))}
               </AdminTable>

               {/* Vendor Modal Component */}
               <VendorModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    initialData={selectedVendor}
               />


               <AdminConfirmModal
                    isOpen={isConfirmOpen}
                    onClose={() => setIsConfirmOpen(false)}
                    onConfirm={confirmDelete}
                    title="Terminate Partnership"
                    message="Are you sure you want to remove this vendor from the supply chain network? This action is irreversible."
                    type="danger"
                    action="delete"
                    confirmLabel="Terminate"
               />
          </div>
     );
}
