"use client";

import { useState, useEffect } from "react";
import { MdAdd, MdEdit, MdDelete, MdInventory2 } from "react-icons/md";
import toast from "react-hot-toast";
import VariantModal from "./VariantModal";
import AdminConfirmModal from "../common/AdminConfirmModal";

export default function VariantManager({ productId }) {
     const [variants, setVariants] = useState([]);
     const [loading, setLoading] = useState(true);
     const [isModalOpen, setIsModalOpen] = useState(false);
     const [editingVariant, setEditingVariant] = useState(null);

     // Delete Confirmation
     const [isDeleteOpen, setIsDeleteOpen] = useState(false);
     const [variantToDelete, setVariantToDelete] = useState(null);

     const fetchVariants = async () => {
          try {
               const res = await fetch(`/api/admin/catalog/variants?product=${productId}`);
               const data = await res.json();
               if (data.success) {
                    setVariants(data.data);
               }
          } catch (error) {
               console.error("Failed to fetch variants", error);
               toast.error("Could not load variants");
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          if (productId) fetchVariants();
     }, [productId]);

     const handleSave = (savedVariant) => {
          fetchVariants(); // Refetch to look fresh, or could optimistically update
     };

     const handleEdit = (variant) => {
          setEditingVariant(variant);
          setIsModalOpen(true);
     };

     const handleAdd = () => {
          setEditingVariant(null);
          setIsModalOpen(true);
     };

     const confirmDelete = (variant) => {
          setVariantToDelete(variant);
          setIsDeleteOpen(true);
     };

     const handleDelete = async () => {
          if (!variantToDelete) return;
          const toastId = toast.loading("Deleting variant...");
          try {
               const res = await fetch(`/api/admin/catalog/variants/${variantToDelete._id}`, {
                    method: 'DELETE'
               });
               const data = await res.json();
               if (data.success) {
                    toast.success("Variant deleted", { id: toastId });
                    fetchVariants();
               } else {
                    toast.error(data.error || "Failed to delete", { id: toastId });
               }
          } catch (error) {
               toast.error("An error occurred", { id: toastId });
          } finally {
               setIsDeleteOpen(false);
               setVariantToDelete(null);
          }
     };

     if (loading) return <div className="text-center py-8 text-gray-400 text-xs uppercase tracking-widest">Loading Variants...</div>;

     return (
          <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm h-full flex flex-col">
               <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                    <div>
                         <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                              <MdInventory2 className="text-indigo-500" /> Variants
                         </h3>
                         <p className="text-[10px] text-gray-400 font-light uppercase tracking-widest mt-1">Manage sales options (Sizes, Colors)</p>
                    </div>
                    <button
                         onClick={handleAdd}
                         className="flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-xl shadow-lg shadow-gray-200 hover:bg-black transition-all text-[11px] font-bold uppercase tracking-wider"
                    >
                         <MdAdd size={16} /> Add Variant
                    </button>
               </div>

               <div className="p-8 flex-grow overflow-y-auto">
                    {variants.length === 0 ? (
                         <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/30">
                              <MdInventory2 size={48} className="text-gray-200 mb-4" />
                              <p className="text-gray-400 font-medium">No variants added yet</p>
                              <button onClick={handleAdd} className="mt-4 text-indigo-500 hover:text-indigo-600 text-sm font-bold">
                                   + Add your first variant
                              </button>
                         </div>
                    ) : (
                         <div className="grid grid-cols-1 gap-4">
                              {variants.map((v) => (
                                   <div key={v._id} className="group flex items-center justify-between p-6 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-md hover:bg-indigo-50/10 transition-all bg-white">
                                        <div className="flex items-center gap-6">
                                             {/* <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-lg">
                                                  {v.name.charAt(0)}
                                             </div> */}
                                             <div>
                                                  <h4 className="font-bold text-gray-800 text-lg">{v.name}</h4>
                                                  <div className="flex items-center gap-3 mt-1">
                                                       <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">{v.sku}</span>
                                                       <span className="text-xs text-gray-400 font-light">Price: <span className="text-gray-900 font-medium">${v.price}</span></span>
                                                       {!v.isActive && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Inactive</span>}
                                                  </div>
                                             </div>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                             <button
                                                  onClick={() => handleEdit(v)}
                                                  className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                  title="Edit Variant"
                                             >
                                                  <MdEdit size={20} />
                                             </button>
                                             <button
                                                  onClick={() => confirmDelete(v)}
                                                  className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                  title="Delete Variant"
                                             >
                                                  <MdDelete size={20} />
                                             </button>
                                        </div>
                                   </div>
                              ))}
                         </div>
                    )}
               </div>

               <VariantModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    editMode={!!editingVariant}
                    variant={editingVariant}
                    productId={productId}
                    onSave={handleSave}
               />

               <AdminConfirmModal
                    isOpen={isDeleteOpen}
                    onClose={() => setIsDeleteOpen(false)}
                    onConfirm={handleDelete}
                    title="Delete Variant"
                    message={`Are you sure you want to delete "${variantToDelete?.name}"? This action cannot be undone.`}
                    action="delete"
                    type="danger"
               />
          </div>
     );
}
