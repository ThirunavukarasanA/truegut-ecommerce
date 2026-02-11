"use client";

import { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import AdminInput from "@/components/admin/common/AdminInput";
import { adminFetchWithToast } from "@/lib/admin/adminFetch";
import toast from "react-hot-toast";

export default function DeliveryPartnerModal({ isOpen, onClose, onSave, initialData }) {
     const [formData, setFormData] = useState({
          name: "",
          type: "Courier"
     });

     useEffect(() => {
          if (initialData) {
               setFormData({
                    name: initialData.name || "",
                    type: initialData.type || "Courier"
               });
          } else {
               setFormData({
                    name: "",
                    type: "Courier"
               });
          }
     }, [initialData, isOpen]);

     const handleChange = (e) => {
          const { name, value, type, checked } = e.target;
          setFormData(prev => ({
               ...prev,
               [name]: type === 'checkbox' ? checked : value
          }));
     };

     const handleSubmit = async (e) => {
          e.preventDefault();
          const baseUrl = "/api/admin/delivery-partners";

          try {
               const isEdit = !!initialData;
               const url = isEdit ? `/api/admin/delivery-partners/${initialData._id}` : baseUrl;
               const method = isEdit ? "PUT" : "POST";

               await adminFetchWithToast(
                    url,
                    {
                         method: method,
                         body: JSON.stringify({ ...formData, _id: initialData?._id })
                    },
                    {
                         loading: "Saving partner...",
                         success: "Partner saved successfully",
                         error: "Failed to save partner"
                    },
                    toast
               );
               onSave();
               onClose();
          } catch (error) {
               console.error(error);
          }
     };

     if (!isOpen) return null;

     return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
               <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-8 animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-8">
                         <div>
                              <h2 className="text-2xl font-bold text-gray-900">
                                   {initialData ? "Edit Partner" : "New Delivery Partner"}
                              </h2>
                              <p className="text-sm text-gray-500 mt-1">Configure logistics provider details</p>
                         </div>
                         <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                              <MdClose size={24} />
                         </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                         <AdminInput
                              label="Partner Name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              placeholder="e.g. Delhivery, Dunzo"
                              required
                         />

                         <div className="grid grid-cols-1 gap-4">
                              <div>
                                   <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Type</label>
                                   <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-bg-color border border-transparent focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/10 rounded-xl outline-none transition-all text-gray-700 placeholder-gray-400"
                                   >
                                        <option value="Courier">Courier</option>
                                        <option value="Local">Local</option>
                                   </select>
                              </div>
                         </div>

                         <div className="flex justify-end gap-3 pt-4">
                              <button
                                   type="button"
                                   onClick={onClose}
                                   className="px-6 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                              >
                                   Cancel
                              </button>
                              <button
                                   type="submit"
                                   className="px-6 py-3 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5"
                              >
                                   {initialData ? "Update Partner" : "Add Partner"}
                              </button>
                         </div>
                    </form>
               </div>
          </div>
     );
}
