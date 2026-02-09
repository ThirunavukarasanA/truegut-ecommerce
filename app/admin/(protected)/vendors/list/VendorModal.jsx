"use client";

import { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import toast from "react-hot-toast";
import { adminFetchWithToast } from "@/lib/admin/adminFetch";
import AdminInput from "@/components/admin/common/AdminInput";

export default function VendorModal({ isOpen, onClose, onSave, initialData }) {
     const [formData, setFormData] = useState({
          name: "",
          companyName: "",
          email: "",
          phone: "",
          address: "",
          pincode: "",
          pincodes: "",
          // stock: 0 
     });
     const [submitting, setSubmitting] = useState(false);

     // Reset/Populate form when modal opens
     useEffect(() => {
          if (isOpen) {
               if (initialData) {
                    setFormData({
                         name: initialData.name || "",
                         companyName: initialData.companyName || "",
                         email: initialData.email || "",
                         phone: initialData.phone || "",
                         address: initialData.address || "",
                         pincode: initialData.pincode || "",
                         pincodes: initialData.serviceablePincodes ? initialData.serviceablePincodes.join(", ") : "",
                         // stock: initialData.stock || 0 // Deprecated in favor of Batch Stock
                    });
               } else {
                    setFormData({
                         name: "",
                         companyName: "",
                         email: "",
                         phone: "",
                         address: "",
                         pincode: "",
                         pincodes: "",
                         // stock: 0 
                    });
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

          try {
               const payload = {
                    ...formData,
                    serviceablePincodes: typeof formData.pincodes === 'string'
                         ? formData.pincodes.split(',').map(p => p.trim()).filter(Boolean)
                         : []
               };

               const url = initialData ? `/api/admin/vendors/${initialData._id}` : "/api/admin/vendors";
               const method = initialData ? "PATCH" : "POST";

               const data = await adminFetchWithToast(
                    url,
                    {
                         method,
                         body: JSON.stringify(payload),
                    },
                    {
                         loading: initialData ? "Updating vendor..." : "Registering vendor...",
                         success: initialData ? "Vendor updated" : "Vendor registered successfully",
                         error: "Operation failed"
                    },
                    toast
               );

               if (data.success) {
                    onSave();
                    onClose();
               }
          } catch (e) {
               // Error handled by adminFetchWithToast
               console.error(e);
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
                                             label="Company Name"
                                             required
                                             value={formData.companyName}
                                             onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                             placeholder="e.g. Fresh Ferment Co."
                                        />
                                   </div>
                                   <div className="col-span-2">
                                        <AdminInput
                                             label="Contact Person"
                                             required
                                             value={formData.name}
                                             onChange={e => setFormData({ ...formData, name: e.target.value })}
                                             placeholder="e.g. True Ferment"
                                        />
                                   </div>
                                   <div>
                                        <AdminInput
                                             label="Business Email"
                                             required
                                             value={formData.email}
                                             onChange={e => setFormData({ ...formData, email: e.target.value })}
                                             type="email"
                                             placeholder="e.g. partners@trueferment.com"
                                        />
                                   </div>
                                   <div>
                                        <AdminInput
                                             label="Verified Phone"
                                             required
                                             value={formData.phone}
                                             onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                             placeholder="+91 9876543210"
                                        />
                                   </div>
                                   <div>
                                        <AdminInput
                                             label="Warehouse Pincode"
                                             required
                                             value={formData.pincode}
                                             onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                                             placeholder="Your Pincode"
                                        />
                                   </div>
                                   <div className="col-span-2">
                                        <AdminInput
                                             label="Full Address"
                                             value={formData.address}
                                             onChange={e => setFormData({ ...formData, address: e.target.value })}
                                             placeholder="Street, City, State..."
                                        />
                                   </div>
                                   {/* Removed Serviceable Pincodes from here as it is managed via Mapping Page now */}
                                   <div className="col-span-2 hidden">
                                        <AdminInput
                                             label="Logistics Hubs (Comma separated)"
                                             value={formData.pincodes}
                                             onChange={e => setFormData({ ...formData, pincodes: e.target.value })}
                                             placeholder="110001, 110002..."
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
                              Cancel
                         </button>
                         <button
                              form="vendor-form"
                              type="submit"
                              disabled={submitting}
                              className="flex-1 px-8 py-5 bg-primary text-white font-black rounded-[1.25rem] hover:bg-secondary transition-all shadow-xl shadow-gray-200 disabled:opacity-50 uppercase text-[11px] tracking-[0.2em]"
                         >
                              {submitting ? "Processing..." : (initialData ? "Update Vendor" : "Register Vendor")}
                         </button>
                    </div>
               </div>
          </div>
     );
}
