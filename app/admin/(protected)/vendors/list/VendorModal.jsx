"use client";

import { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import toast from "react-hot-toast";
import AdminInput from "@/components/admin/common/AdminInput";

export default function VendorModal({ isOpen, onClose, onSave, initialData }) {
     const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "", pincodes: "", stock: 0 });
     const [submitting, setSubmitting] = useState(false);

     // Reset/Populate form when modal opens
     useEffect(() => {
          if (isOpen) {
               if (initialData) {
                    setFormData({
                         name: initialData.name || "",
                         email: initialData.email || "",
                         phone: initialData.phone || "",
                         address: initialData.address || "",
                         pincodes: initialData.serviceablePincodes ? initialData.serviceablePincodes.join(", ") : "",
                         stock: initialData.stock || 0
                    });
               } else {
                    setFormData({ name: "", email: "", phone: "", address: "", pincodes: "", stock: 0 });
               }
          }
     }, [isOpen, initialData]);

     // Lock body scroll when modal is open
     useEffect(() => {
          if (isOpen) {
               document.body.style.overflow = 'hidden';
          } else {
               document.body.style.overflow = 'unset';
          }
          return () => { document.body.style.overflow = 'unset'; };
     }, [isOpen]);

     const handleSubmit = async (e) => {
          e.preventDefault();
          setSubmitting(true);
          const toastId = toast.loading(initialData ? "Updating vendor..." : "Registering vendor...");

          try {
               const payload = {
                    ...formData,
                    serviceablePincodes: typeof formData.pincodes === 'string'
                         ? formData.pincodes.split(',').map(p => p.trim()).filter(Boolean)
                         : []
               };

               const url = initialData ? `/api/admin/vendors/${initialData._id}` : "/api/admin/vendors";
               const method = initialData ? "PATCH" : "POST";

               const res = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
               });
               const data = await res.json();
               if (data.success) {
                    toast.success(initialData ? "Vendor updated" : "Vendor registered successfully", { id: toastId });
                    onSave();
                    onClose();
               } else {
                    toast.error(data.error || "Operation failed", { id: toastId });
               }
          } catch (e) {
               toast.error("An error occurred", { id: toastId });
          } finally {
               setSubmitting(false);
          }
     };

     if (!isOpen) return null;

     return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
               <div className="bg-white rounded-[2.5rem] w-full max-w-xl max-h-[90vh] shadow-2xl animate-in custom-zoom-in duration-300 overflow-hidden border border-gray-100 flex flex-col">
                    {/* Modal Header */}
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
                         <div>
                              <h3 className="text-2xl font-black text-gray-900 tracking-tight">{initialData ? "Update Partner" : "Partner Registration"}</h3>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">{initialData ? "Modify partner details" : "Initialize new supply chain partnership"}</p>
                         </div>
                         <button onClick={onClose} className="p-3 bg-white text-gray-400 hover:text-gray-900 rounded-full shadow-sm hover:shadow-md transition-all">
                              <MdClose size={24} />
                         </button>
                    </div>

                    {/* Modal Body - Scrollable */}
                    <div className="flex-grow overflow-y-auto p-8 lg:p-10 scrollbar-thin scrollbar-thumb-gray-100 scrollbar-track-transparent">
                         <form id="vendor-form" onSubmit={handleSubmit} className="space-y-6">
                              <div className="grid grid-cols-2 gap-6">
                                   <div className="col-span-2">
                                        <AdminInput
                                             label="Corporate Identity"
                                             required
                                             value={formData.name}
                                             onChange={e => setFormData({ ...formData, name: e.target.value })}
                                             placeholder="e.g. Fresh Ferment Co."
                                        />
                                   </div>
                                   <div>
                                        <AdminInput
                                             label="Business Email"
                                             required
                                             value={formData.email}
                                             onChange={e => setFormData({ ...formData, email: e.target.value })}
                                             type="email"
                                             placeholder="partners@freshferment.com"
                                        />
                                   </div>
                                   <div>
                                        <AdminInput
                                             label="Verified Phone"
                                             required
                                             value={formData.phone}
                                             onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                             placeholder="+1 (555) 000-0000"
                                        />
                                   </div>
                                   <div className="col-span-2">
                                        <AdminInput
                                             label="Logistics Hubs (Comma separated)"
                                             value={formData.pincodes}
                                             onChange={e => setFormData({ ...formData, pincodes: e.target.value })}
                                             placeholder="110001, 110002..."
                                        />
                                   </div>
                                   <div className="col-span-2">
                                        <AdminInput
                                             label="Initial Stock Inventory"
                                             type="number"
                                             value={formData.stock}
                                             onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                                             placeholder="0"
                                             min="0"
                                        />
                                   </div>
                              </div>
                         </form>
                    </div>

                    {/* Modal Footer */}
                    <div className="p-8 border-t border-gray-50 bg-gray-50/30 flex gap-4 flex-shrink-0">
                         <button
                              type="button"
                              onClick={onClose}
                              className="flex-1 px-8 py-5 bg-gray-100 text-gray-500 font-black rounded-[1.25rem] hover:bg-gray-200 hover:text-gray-600 transition-all uppercase text-[11px] tracking-[0.2em]"
                         >
                              Abort
                         </button>
                         <button
                              form="vendor-form"
                              type="submit"
                              disabled={submitting}
                              className="flex-1 px-8 py-5 bg-primary text-white font-black rounded-[1.25rem] hover:bg-secondary transition-all shadow-xl shadow-gray-200 disabled:opacity-50 uppercase text-[11px] tracking-[0.2em]"
                         >
                              {submitting ? "Processing..." : (initialData ? "Update Partner" : "Authorize Partner")}
                         </button>
                    </div>
               </div>
          </div>
     );
}
