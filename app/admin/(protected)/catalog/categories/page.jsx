"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin/adminFetch";
import { MdAdd, MdDelete, MdEdit, MdInfoOutline } from "react-icons/md";
import toast from "react-hot-toast";
import CategoryModal from "./CategoryModal";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import AdminSearch from "@/components/admin/common/AdminSearch";
import AdminTable from "@/components/admin/common/AdminTable";
import AdminStatusBadge from "@/components/admin/common/AdminStatusBadge";

import AdminConfirmModal from "@/components/admin/common/AdminConfirmModal";

export default function CategoriesPage() {
     const [categories, setCategories] = useState([]);
     const [loading, setLoading] = useState(true);
     const [isModalOpen, setIsModalOpen] = useState(false);
     const [editMode, setEditMode] = useState(false);
     const [selectedCategory, setSelectedCategory] = useState(null);
     const [searchQuery, setSearchQuery] = useState("");

     // Confirmation States
     const [isConfirmOpen, setIsConfirmOpen] = useState(false);
     const [categoryToDelete, setCategoryToDelete] = useState(null);

     useEffect(() => {
          fetchCategories();
     }, []);

     const fetchCategories = async () => {
          try {
               const data = await adminFetch("/api/admin/catalog/categories");
               if (data.success) {
                    setCategories(data.data);
               }
          } catch (error) {
               if (error.message !== 'Unauthorized - Redirecting to login') {
                    toast.error(error.message || "Failed to load categories");
               }
          } finally {
               setLoading(false);
          }
     };

     const openCreateModal = () => {
          setEditMode(false);
          setSelectedCategory(null);
          setIsModalOpen(true);
     };

     const openEditModal = (category) => {
          setEditMode(true);
          setSelectedCategory(category);
          setIsModalOpen(true);
     };

     const handleSave = (savedCategory, isEdit) => {
          if (isEdit) {
               setCategories(prev => prev.map(c => c._id === savedCategory._id ? savedCategory : c));
          } else {
               setCategories(prev => [savedCategory, ...prev]);
          }
     };

     const handleDelete = (id) => {
          setCategoryToDelete(id);
          setIsConfirmOpen(true);
     };

     const confirmDelete = async () => {
          if (!categoryToDelete) return;
          const toastId = toast.loading("Deleting category...");
          try {
               const data = await adminFetch(`/api/admin/catalog/categories/${categoryToDelete}`, {
                    method: "DELETE",
               });
               if (data.success) {
                    setCategories(categories.filter(c => c._id !== categoryToDelete));
                    toast.success("Category deleted", { id: toastId });
               } else {
                    toast.error(data.error || "Delete failed", { id: toastId });
               }
          } catch (error) {
               if (error.message !== 'Unauthorized - Redirecting to login') {
                    toast.error(error.message || "Failed to delete category", { id: toastId });
               }
          } finally {
               setCategoryToDelete(null);
               setIsConfirmOpen(false); // Close the modal after action
          }
     };

     const filteredCategories = categories.filter(cat =>
          cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.slug?.toLowerCase().includes(searchQuery.toLowerCase())
     );

     const tableHeaders = [
          { label: "Category Name" },
          { label: "Slug" },
          { label: "Active" },
          { label: "Action", align: "right" }
     ];

     return (
          <div className="space-y-6 animate-in fade-in duration-500">
               <AdminPageHeader
                    title="Categories"
                    description="Manage product categories and hierarchy"
                    primaryAction={{
                         label: "ADD CATEGORY",
                         onClick: openCreateModal,
                         icon: MdAdd
                    }}
               />

               {/* Stats / Tools */}
               <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <AdminSearch
                         value={searchQuery}
                         onChange={setSearchQuery}
                         placeholder="Search by name or slug..."
                         className="w-full md:w-96"
                    />
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white px-5 py-2.5 rounded-xl border border-gray-100 shadow-sm shadow-gray-50/50">
                         <MdInfoOutline className="text-primary" size={16} />
                         Showing <span className="text-primary">{filteredCategories.length}</span> categories
                    </div>
               </div>

               {/* Categories Table */}
               <AdminTable
                    headers={tableHeaders}
                    loading={loading}
                    loadingMessage="Fetching categories..."
                    emptyMessage="No categories found matching your criteria."
                    colCount={4}
               >
                    {filteredCategories.map((cat) => (
                         <tr key={cat._id} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-8 py-6">
                                   <div>
                                        <div className="text-[14px] font-light text-gray-800 group-hover:text-primary transition-colors">{cat.name}</div>
                                        <div className="text-[11px] font-light text-gray-400 line-clamp-1 mt-1">{cat.description || "No description provided"}</div>
                                   </div>
                              </td>
                              <td className="px-8 py-6 w-1/4">
                                   <span className="text-[10px] font-mono bg-bg-color text-primary px-3 py-1.5 rounded-lg border border-gray-100 uppercase tracking-wider">
                                        {cat.slug}
                                   </span>
                              </td>
                              <td className="px-8 py-6">
                                   <AdminStatusBadge status={cat.isActive ? 'Active' : 'Inactive'} />
                              </td>
                              <td className="px-8 py-6 text-right">
                                   <div className="flex justify-end gap-2 pr-2">
                                        <button
                                             onClick={() => openEditModal(cat)}
                                             className="p-2.5 text-gray-400 hover:text-primary hover:bg-bg-color rounded-xl transition-all border border-transparent hover:border-gray-100"
                                             title="Edit"
                                        >
                                             <MdEdit size={18} />
                                        </button>
                                        <button
                                             onClick={() => handleDelete(cat._id)}
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

               {/* Category Modal Component */}
               <CategoryModal
                    isOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    editMode={editMode}
                    category={selectedCategory}
                    onSave={handleSave}
               />

               {/* Confirmation Modal */}
               <AdminConfirmModal
                    isOpen={isConfirmOpen}
                    onClose={() => setIsConfirmOpen(false)}
                    onConfirm={confirmDelete}
                    title="RemoveCategory"
                    message="Are you sure you want to delete this category? All products within this category will become uncategorized."
                    type="danger"
                    action="delete"
                    confirmLabel="Remove"
               />
          </div>
     );
}
