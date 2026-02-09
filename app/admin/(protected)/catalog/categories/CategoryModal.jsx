"use client";

import { useState, useEffect } from "react";
import { MdClose, MdCategory, MdDescription } from "react-icons/md";
// toast is passed to adminFetchWithToast
import toast from "react-hot-toast";
import { adminFetchWithToast } from "@/lib/admin/adminFetch";
import AdminInput from "@/components/admin/common/AdminInput";

import AdminConfirmModal from "@/components/admin/common/AdminConfirmModal";

export default function CategoryModal({ isOpen, onClose, editMode, category, onSave, maxWidth = "max-w-md", setIsModalOpen }) {
     const [formData, setFormData] = useState({ name: "", description: "", isActive: true });
     const [submitting, setSubmitting] = useState(false);
     const [isConfirmOpen, setIsConfirmOpen] = useState(false);

     useEffect(() => {
          if (category) {
               setFormData({
                    ...category,
                    name: category.name || "",
                    description: category.description || "",
                    isActive: category.isActive !== undefined ? category.isActive : true
               });
          } else {
               setFormData({ name: "", description: "", isActive: true });
          }
     }, [category]);


     const handleSubmit = (e) => {
          e.preventDefault();
          if (!formData.name.trim()) {
               return toast.error("Category name is required");
          }
          setIsModalOpen(false)
          setIsConfirmOpen(true);
     };

     const confirmSubmit = async () => {
          setSubmitting(true);

          try {
               const url = editMode
                    ? `/api/admin/catalog/categories/${category._id}`
                    : "/api/admin/catalog/categories";
               const method = editMode ? "PATCH" : "POST";

               const data = await adminFetchWithToast(
                    url,
                    {
                         method: method,
                         body: JSON.stringify(formData),
                    },
                    {
                         loading: editMode ? "Updating category..." : "Creating category...",
                         success: `Category ${editMode ? "updated" : "created"} successfully`,
                         error: "Operation failed"
                    },
                    toast
               );

               if (data.success) {
                    onSave(data.data, editMode);
                    onClose();
               }
          } catch (error) {
               // adminFetchWithToast handles the error toast
               console.error(error);
          } finally {
               setSubmitting(false);
               setIsConfirmOpen(false);
               setFormData({ name: "", description: "", isActive: true });
          }
     };

     if (!isOpen && !isConfirmOpen) return null;

     return (
          <>
               {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
                         <div className={`bg-white rounded-[2.5rem] w-full ${maxWidth} shadow-2xl animate-in custom-zoom-in duration-300 overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]`}>
                              {/* Modal Header */}
                              <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
                                   <div>
                                        <h3 className="text-2xl font-light text-gray-800 tracking-tight">{editMode ? 'Update' : 'New'} Category</h3>
                                        <p className="text-[10px] text-gray-400 font-light uppercase tracking-widest mt-2">Define category properties and visibility</p>
                                   </div>
                                   <button
                                        onClick={onClose}
                                        className="p-3 bg-white text-gray-400 hover:text-gray-900 rounded-full shadow-sm hover:shadow-md transition-all"
                                   >
                                        <MdClose size={24} />
                                   </button>
                              </div>

                              {/* Scrollable Form Body */}
                              <div className="flex-grow overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-gray-100 scrollbar-track-transparent">
                                   <form id="category-form" onSubmit={handleSubmit} className="space-y-8">
                                        <AdminInput
                                             label="Category Name"
                                             required
                                             value={formData.name}
                                             onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                             placeholder="e.g. Organic Beverages"
                                             icon={MdCategory}
                                        />

                                        <AdminInput
                                             label="Category Description"
                                             value={formData.description}
                                             onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                             placeholder="Briefly describe what's inside..."
                                             isTextArea
                                             rows={4}
                                             icon={MdDescription}
                                        />

                                        <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[1.5rem] border border-gray-100">
                                             <div>
                                                  <span className="block text-sm font-medium text-gray-800">Active Status</span>
                                                  <span className="text-[10px] text-gray-400 font-light uppercase tracking-[0.1em]">Visible to customers if active</span>
                                             </div>
                                             <label className="relative inline-flex items-center cursor-pointer">
                                                  <input
                                                       type="checkbox"
                                                       checked={formData.isActive}
                                                       onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                       className="sr-only peer"
                                                  />
                                                  <div className="w-14 h-7 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-gray-100 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:start-[4px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900 shadow-inner"></div>
                                             </label>
                                        </div>
                                   </form>
                              </div>

                              {/* Fixed Footer */}
                              <div className="px-8 py-6 border-t border-gray-50 bg-gray-50/30 flex gap-4 flex-shrink-0">
                                   <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-8 py-5 bg-white border border-gray-200 text-gray-400 font-light rounded-[1.25rem] hover:bg-gray-50 hover:text-gray-900 transition-all uppercase text-[11px] tracking-[0.2em]"
                                   >
                                        Cancel
                                   </button>
                                   <button
                                        type="submit"
                                        form="category-form"
                                        disabled={submitting}
                                        className="flex-1 px-8 py-5 bg-gray-900 text-white font-bold rounded-[1.25rem] hover:bg-black transition-all shadow-xl shadow-gray-200 disabled:opacity-50 uppercase text-[11px] tracking-[0.2em]"
                                   >
                                        {submitting ? "Processing..." : editMode ? "Update Category" : "Create Category"}
                                   </button>
                              </div>
                         </div>
                    </div>
               )}

               <AdminConfirmModal
                    isOpen={isConfirmOpen}
                    onClose={() => setIsConfirmOpen(false)}
                    onConfirm={confirmSubmit}
                    title={editMode ? "ConfirmUpdate" : "ConfirmCreation"}
                    message={editMode
                         ? "Are you sure you want to update this category's details? This will affect all associated products."
                         : "Are you ready to create this new category?"
                    }
                    type={editMode ? "info" : "success"}
                    action={editMode ? "update" : "create"}
                    confirmLabel={editMode ? "Update" : "Create"}
               />
          </>
     );
}
