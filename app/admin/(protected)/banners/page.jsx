"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin/adminFetch";
import { MdAdd, MdDelete, MdEdit, MdInfoOutline } from "react-icons/md";
import toast from "react-hot-toast";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import AdminTable from "@/components/admin/common/AdminTable";
import AdminStatusBadge from "@/components/admin/common/AdminStatusBadge";
import AdminConfirmModal from "@/components/admin/common/AdminConfirmModal";

export default function BannersPage() {
     const router = useRouter();
     const [banners, setBanners] = useState([]);
     const [loading, setLoading] = useState(true);

     // Confirmation States
     const [isConfirmOpen, setIsConfirmOpen] = useState(false);
     const [bannerToDelete, setBannerToDelete] = useState(null);

     useEffect(() => {
          fetchBanners();
     }, []);

     const fetchBanners = async () => {
          try {
               const data = await adminFetch("/api/admin/banners");
               if (data.success) {
                    setBanners(data.data);
               }
          } catch (error) {
               if (error.message !== 'Unauthorized - Redirecting to login') {
                    toast.error(error.message || "Failed to load banners");
               }
          } finally {
               setLoading(false);
          }
     };

     const openCreateScreen = () => {
          router.push("/admin/banners/add");
     };

     const openEditScreen = (id) => {
          router.push(`/admin/banners/edit/${id}`);
     };

     const handleDelete = (id) => {
          setBannerToDelete(id);
          setIsConfirmOpen(true);
     };

     const confirmDelete = async () => {
          if (!bannerToDelete) return;
          const toastId = toast.loading("Deleting banner...");
          try {
               const data = await adminFetch(`/api/admin/banners/${bannerToDelete}`, {
                    method: "DELETE",
               });
               if (data.success) {
                    setBanners(banners.filter(b => b._id !== bannerToDelete));
                    toast.success("Banner deleted", { id: toastId });
               } else {
                    toast.error(data.error || "Delete failed", { id: toastId });
               }
          } catch (error) {
               if (error.message !== 'Unauthorized - Redirecting to login') {
                    toast.error(error.message || "Failed to delete banner", { id: toastId });
               }
          } finally {
               setBannerToDelete(null);
               setIsConfirmOpen(false);
          }
     };

     const toggleStatus = async (banner) => {
          const toastId = toast.loading("Updating status...");
          try {
               const newStatus = !banner.isActive;
               const data = await adminFetch(`/api/admin/banners/${banner._id}`, {
                    method: "PUT",
                    body: JSON.stringify({ isActive: newStatus })
               });
               if (data.success) {
                    setBanners(banners.map(b => b._id === banner._id ? { ...b, isActive: newStatus } : b));
                    toast.success("Status updated", { id: toastId });
               } else {
                    toast.error(data.error || "Update failed", { id: toastId });
               }
          } catch (error) {
               if (error.message !== 'Unauthorized - Redirecting to login') {
                    toast.error(error.message || "Failed to update status", { id: toastId });
               }
          }
     };

     const tableHeaders = [
          { label: "Image" },
          { label: "Title" },
          { label: "Link" },
          { label: "Status" },
          { label: "Action", align: "right" }
     ];

     return (
          <div className="space-y-6 animate-in fade-in duration-500">
               <AdminPageHeader
                    title="Banners"
                    description="Manage front page banners"
                    primaryAction={{
                         label: "ADD NEW BANNER",
                         onClick: openCreateScreen,
                         icon: MdAdd
                    }}
               />

               <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex gap-4 items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white px-5 py-2.5 rounded-xl border border-gray-100 shadow-sm shadow-gray-50/50">
                         <MdInfoOutline className="text-primary" size={16} />
                         Showing <span className="text-primary">{banners.length}</span> banners
                    </div>
               </div>

               <AdminTable
                    headers={tableHeaders}
                    loading={loading}
                    loadingMessage="Fetching banners..."
                    emptyMessage="No banners found. Start by adding a new one."
                    colCount={5}
               >
                    {banners.map((banner) => (
                         <tr key={banner._id} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-8 py-4">
                                   <div className="w-32 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                        <img 
                                             src={banner.image?.url} 
                                             alt={banner.altText || "banner"} 
                                             className="w-full h-full object-cover" 
                                        />
                                   </div>
                              </td>
                              <td className="px-8 py-4">
                                   <div className="text-[14px] font-medium text-gray-800 group-hover:text-primary transition-colors">{banner.title}</div>
                              </td>
                              <td className="px-8 py-4 w-1/4">
                                   <span className="text-[11px] font-light text-gray-500 break-all">
                                        {banner.link || "No link"}
                                   </span>
                              </td>
                              <td className="px-8 py-4">
                                   <button onClick={() => toggleStatus(banner)} className="cursor-pointer">
                                        <AdminStatusBadge status={banner.isActive ? 'Active' : 'Inactive'} />
                                   </button>
                              </td>
                              <td className="px-8 py-4 text-right">
                                   <div className="flex justify-end gap-2 pr-2">
                                        <button
                                             onClick={() => openEditScreen(banner._id)}
                                             className="p-2.5 text-gray-400 hover:text-primary hover:bg-bg-color rounded-xl transition-all border border-transparent hover:border-gray-100"
                                             title="Edit"
                                        >
                                             <MdEdit size={18} />
                                        </button>
                                        <button
                                             onClick={() => handleDelete(banner._id)}
                                             className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100/50"
                                             title="Delete"
                                        >
                                             <MdDelete size={18} />
                                        </button>
                                   </div>
                              </td>
                         </tr>
                    ))}
               </AdminTable>

               <AdminConfirmModal
                    isOpen={isConfirmOpen}
                    onClose={() => setIsConfirmOpen(false)}
                    onConfirm={confirmDelete}
                    title="Remove Banner"
                    message="Are you sure you want to delete this banner?"
                    type="danger"
                    action="delete"
                    confirmLabel="Remove"
               />
          </div>
     );
}
