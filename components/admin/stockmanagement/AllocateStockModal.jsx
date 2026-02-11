"use client";

import { useState, useEffect } from "react";
import { MdClose, MdArrowForward } from "react-icons/md";
import { adminFetchWithToast, adminFetch } from "@/lib/admin/adminFetch";
import toast from "react-hot-toast";
import AdminInput from "@/components/admin/common/AdminInput";
import AdminSelect from "@/components/admin/common/AdminSelect";

export default function AllocateStockModal({ isOpen, onClose, onSave }) {
     const [vendors, setVendors] = useState([]);
     const [batches, setBatches] = useState([]);
     const [loadingData, setLoadingData] = useState(false);

     const [formData, setFormData] = useState({
          vendorId: "",
          batchId: "",
          quantity: ""
     });

     useEffect(() => {
          if (isOpen) {
               setLoadingData(true);
               Promise.all([
                    fetchVendors(),
                    fetchBatches()
               ]).finally(() => setLoadingData(false));

               // Reset form
               setFormData({
                    vendorId: "",
                    batchId: "",
                    quantity: ""
               });
          }
     }, [isOpen]);

     const fetchVendors = async () => {
          try {
               const data = await adminFetch("/api/admin/vendors");
               if (data.success) setVendors(data.data);
          } catch (e) {
               console.error(e);
               toast.error("Failed to load vendors");
          }
     };

     const fetchBatches = async () => {
          try {
               const data = await adminFetch("/api/admin/stockmanagement");
               if (data.success && Array.isArray(data.data)) {
                    const list = data.data.map(v => ({ ...v, name: v.batchNo }))
                    setBatches(list);
               }
          } catch (e) {
               console.error("Batch fetch error", e);
               toast.error("Failed to load batches");
          }
     };

     const handleSubmit = async (e) => {
          e.preventDefault();
          if (!formData.vendorId || !formData.batchId || !formData.quantity) {
               return toast.error("Please fill all fields");
          }

          // Validation: Check Max Qty
          const selectedBatch = batches.find(b => b._id === formData.batchId);
          if (selectedBatch && parseInt(formData.quantity) > selectedBatch.quantity) {
               return toast.error(`Max allocatable quantity is ${selectedBatch.quantity}`);
          }

          try {
               await adminFetchWithToast(
                    "/api/admin/stock/allocate",
                    {
                         method: "POST",
                         body: JSON.stringify(formData)
                    },
                    {
                         loading: "Allocating stock...",
                         success: "Stock allocated successfully!",
                         error: "Allocation failed"
                    },
                    toast
               );
               onSave();
               onClose();
          } catch (e) {
               console.error(e);
          }
     };

     if (!isOpen) return null;

     return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm animate-in fade-in duration-200">
               <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">

                    {/* Header */}
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                         <div>
                              <h3 className="text-xl font-bold text-gray-900">Allocate Stock</h3>
                              <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wider">Transfer inventory from Warehouse to Vendor</p>
                         </div>
                         <button
                              onClick={onClose}
                              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                         >
                              <MdClose size={24} />
                         </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 overflow-y-auto">
                         {loadingData ? (
                              <div className="text-center py-12 text-gray-400">Loading data...</div>
                         ) : (
                              <form id="allocate-form" onSubmit={handleSubmit} className="space-y-6">
                                   {/* Vendor Selection */}
                                   <AdminSelect
                                        label="Select Vendor"
                                        name="vendorId"
                                        value={formData.vendorId}
                                        onChange={e => setFormData({ ...formData, vendorId: e.target.value })}
                                        options={vendors.map(v => ({
                                             label: `${v.name} (${v.companyName || 'No Company'})`,
                                             value: v._id
                                        }))}
                                        placeholder="Choose a Vendor..."
                                   />

                                   {/* Batch Selection */}
                                   <AdminSelect
                                        label="Select Source Batch"
                                        name="batchId"
                                        value={formData.batchId}
                                        onChange={e => setFormData({ ...formData, batchId: e.target.value })}
                                        options={batches
                                             .filter(b => b.quantity > 0 && b.status === "active")
                                             .map(b => ({
                                                  label: `${b.batchNo} | ${b.product?.name} (${b.variant?.name}) | Available: ${b.quantity}`,
                                                  value: b._id
                                             }))}
                                        placeholder="Choose a Batch..."
                                        className="font-mono text-sm"
                                   />

                                   {/* Quantity */}
                                   <AdminInput
                                        label="Allocation Quantity"
                                        type="number"
                                        value={formData.quantity}
                                        onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                        placeholder="Enter quantity to transfer..."
                                        min="1"
                                   />
                              </form>
                         )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-50 bg-gray-50/30 flex justify-end gap-3">
                         <button
                              type="button"
                              onClick={onClose}
                              className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all uppercase tracking-wider"
                         >
                              Cancel
                         </button>
                         <button
                              type="submit"
                              form="allocate-form"
                              disabled={loadingData}
                              className="px-8 py-3 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 uppercase tracking-wider"
                         >
                              <MdArrowForward size={18} /> Allocate
                         </button>
                    </div>
               </div>
          </div>
     );
}
