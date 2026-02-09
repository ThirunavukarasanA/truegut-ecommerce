"use client";

import { useState, useEffect } from "react";
import { MdClose, MdLabel, MdQrCode, MdAttachMoney, MdScale } from "react-icons/md";
import toast from "react-hot-toast";
import AdminInput from "@/components/admin/common/AdminInput";
import { useSettings } from "@/context/SettingsContext";
import { adminFetchWithToast } from "@/lib/admin/adminFetch";

export default function VariantModal({ isOpen, onClose, editMode, variant, productId, onSave }) {
     const { settings } = useSettings();
     const [formData, setFormData] = useState({
          name: "",
          sku: "", // Kept in state for edit mode display, but not input for create
          price: "",
          costPrice: "",
          weightGrams: "",
          isActive: true
     });
     const [submitting, setSubmitting] = useState(false);

     useEffect(() => {
          if (variant) {
               setFormData({
                    name: variant.name || "",
                    sku: variant.sku || "",
                    price: variant.price || "",
                    costPrice: variant.costPrice || "",
                    weightGrams: variant.weightGrams || "",
                    isActive: variant.isActive !== undefined ? variant.isActive : true
               });
          } else {
               setFormData({
                    name: "",
                    sku: "",
                    price: "",
                    costPrice: "",
                    weightGrams: "",
                    isActive: true
               });
          }
     }, [variant]);

     // Lock body scroll
     useEffect(() => {
          if (isOpen) document.body.style.overflow = 'hidden';
          else document.body.style.overflow = 'unset';
          return () => { document.body.style.overflow = 'unset'; };
     }, [isOpen]);

     const handleSubmit = async (e) => {
          e.preventDefault();
          if (!formData.name || !formData.price) {
               toast.error("Name and Price are required");
               return;
          }

          setSubmitting(true);

          try {
               const url = editMode
                    ? `/api/admin/catalog/variants/${variant._id}`
                    : "/api/admin/catalog/variants";

               const method = editMode ? "PATCH" : "POST";

               const payload = {
                    ...formData,
                    product: productId,
                    price: parseFloat(formData.price),
                    costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
                    weightGrams: formData.weightGrams ? parseInt(formData.weightGrams) : undefined
               };

               // Remove SKU from payload if creating (let backend generate)
               if (!editMode) delete payload.sku;

               const data = await adminFetchWithToast(
                    url,
                    {
                         method,
                         body: JSON.stringify(payload),
                    },
                    {
                         loading: editMode ? "Updating variant..." : "Creating variant...",
                         success: `Variant ${editMode ? "updated" : "added"} successfully`,
                         error: "Operation failed"
                    },
                    toast
               );

               if (data.success) {
                    onSave(data.data);
                    onClose();
               }
          } catch (error) {
               console.error(error);
          } finally {
               setFormData({
                    name: "",
                    sku: "",
                    price: "",
                    costPrice: "",
                    weightGrams: "",
                    isActive: true
               });
               setSubmitting(false);
          }
     };

     // Custom Icon for Currency
     const CurrencyIcon = () => <span className="text-sm font-bold text-gray-500">{settings?.currency?.symbol || "$"}</span>;

     if (!isOpen) return null;

     return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
               <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in custom-zoom-in duration-300 overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
                         <div>
                              <h3 className="text-2xl font-light text-gray-800 tracking-tight">{editMode ? 'Edit' : 'Add'} Variant</h3>
                              <p className="text-[10px] text-gray-400 font-light uppercase tracking-widest mt-2">{editMode ? 'Update variant details' : 'Define new product variation'}</p>
                         </div>
                         <button onClick={onClose} className="p-3 bg-white text-gray-400 hover:text-gray-900 rounded-full shadow-sm hover:shadow-md transition-all">
                              <MdClose size={24} />
                         </button>
                    </div>

                    {/* Body */}
                    <div className="flex-grow overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-gray-100 scrollbar-track-transparent">
                         <form id="variant-form" onSubmit={handleSubmit} className="space-y-6">
                              <AdminInput
                                   label="Variant Name"
                                   required
                                   value={formData.name}
                                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                   placeholder="e.g. 500ml Bottle"
                                   icon={MdLabel}
                                   helperText="Visible to customers (e.g. Size, Color)"
                              />

                              {/* Display SKU only if Editing, otherwise logic says it is auto-generated */}
                              {editMode && (
                                   <AdminInput
                                        label="SKU (Read Only)"
                                        value={formData.sku}
                                        readOnly
                                        disabled
                                        icon={MdQrCode}
                                        className="opacity-60"
                                   />
                              )}

                              <div className="grid grid-cols-2 gap-4">
                                   <AdminInput
                                        label="Price"
                                        required
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        icon={CurrencyIcon}
                                        placeholder="0.00"
                                   />
                                   <AdminInput
                                        label="Cost Price"
                                        type="number"
                                        value={formData.costPrice}
                                        onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                                        icon={CurrencyIcon}
                                        placeholder="0.00"
                                        helperText="Internal use only"
                                   />
                              </div>
                              <AdminInput
                                   label="Weight (g)"
                                   type="number"
                                   value={formData.weightGrams}
                                   onChange={(e) => setFormData({ ...formData, weightGrams: e.target.value })}
                                   icon={MdScale}
                                   placeholder="e.g. 500"
                                   helperText="For shipping calculations"
                              />

                              <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[1.5rem] border border-gray-100">
                                   <div>
                                        <span className="block text-sm font-medium text-gray-800">Active Status</span>
                                        <span className="text-[10px] text-gray-400 font-light uppercase tracking-[0.1em]">Available for purchase</span>
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

                    <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center px-8 shrink-0">
                         <button
                              type="button"
                              onClick={onClose}
                              className="px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-red-500 bg-red-50 rounded-xl transition-all flex items-center gap-2 group"
                         >
                              <MdClose
                                   size={18}
                                   className="group-hover:rotate-90 transition-transform"
                              />{" "}
                              Close
                         </button>

                         <button
                              type="submit"
                              form="variant-form"
                              disabled={submitting}
                              className="px-10 py-4 bg-gray-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-secondary cursor-pointer active:scale-95 transition-all shadow-xl shadow-gray-200 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                              {submitting ? (editMode ? "Updating..." : "Creating...") : (editMode ? "Update Variant" : "Add Variant")}
                         </button>
                    </div>
               </div>
          </div>
     );
}
