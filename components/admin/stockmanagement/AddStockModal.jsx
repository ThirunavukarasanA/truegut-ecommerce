"use client";

import { useState, useEffect } from "react";
import { MdClose, MdSave, MdInventory } from "react-icons/md";
import AdminInput from "../common/AdminInput";
import toast from "react-hot-toast";

export default function AddStockModal({ isOpen, onClose, batch, onSave }) {
     const [quantity, setQuantity] = useState("");
     const [submitting, setSubmitting] = useState(false);

     useEffect(() => {
          if (isOpen) {
               setQuantity("");
          }
     }, [isOpen]);

     const handleSubmit = async (e) => {
          e.preventDefault();

          if (!quantity || quantity <= 0) {
               toast.error("Please enter a valid quantity");
               return;
          }

          setSubmitting(true);
          const toastId = toast.loading("Adding stock...");

          try {
               const res = await fetch("/api/admin/stockmanagement", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                         batchId: batch._id,
                         quantity: parseInt(quantity)
                    })
               });
               const data = await res.json();

               if (data.success) {
                    toast.success("Stock added successfully", { id: toastId });
                    onSave();
                    onClose();
               } else {
                    toast.error(data.error || "Failed to update stock", { id: toastId });
               }
          } catch (error) {
               toast.error("An error occurred", { id: toastId });
          } finally {
               setSubmitting(false);
          }
     };

     if (!isOpen || !batch) return null;

     return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-300">
               <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden border border-gray-100">

                    {/* Header */}
                    <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                         <div>
                              <h2 className="text-xl font-bold text-gray-800 tracking-tight">Add Stock</h2>
                              <p className="text-[10px] text-gray-400 font-light uppercase tracking-widest mt-1">
                                   {batch.batchNo}
                              </p>
                         </div>
                         <button onClick={onClose} className="p-2 bg-white hover:bg-red-50 hover:text-red-500 rounded-full transition-all shadow-sm border border-gray-100">
                              <MdClose size={20} />
                         </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">

                         <div className="bg-bg-color p-4 rounded-xl border border-gray-100">
                              <p className="text-xs text-primary mb-1 font-bold">Product Details</p>
                              <p className="text-sm font-bold text-gray-800">{batch.product?.name}</p>
                              <p className="text-xs text-gray-500">{batch.variant?.name}</p>
                              <div className="mt-2 flex gap-4">
                                   <div>
                                        <p className="text-[10px] uppercase text-gray-400">Current Stock</p>
                                        <p className="font-mono font-bold text-gray-700">{batch.quantity}</p>
                                   </div>
                                   <div>
                                        <p className="text-[10px] uppercase text-gray-400">Expiry</p>
                                        <p className="font-mono font-bold text-gray-700">{new Date(batch.expiryDate).toLocaleDateString()}</p>
                                   </div>
                              </div>
                         </div>

                         <AdminInput
                              label="Quantity to Add *"
                              name="quantity"
                              type="number"
                              value={quantity}
                              onChange={(e) => setQuantity(e.target.value)}
                              placeholder="e.g. 50"
                              min="1"
                              icon={MdInventory}
                              autoFocus
                         />
                    </form>

                    {/* Footer */}
                    <div className="px-8 py-6 border-t border-gray-50 bg-gray-50/30 flex justify-end gap-3">
                         <button
                              type="button"
                              onClick={onClose}
                              className="px-6 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-700 uppercase tracking-widest transition-colors"
                         >
                              Cancel
                         </button>
                         <button
                              onClick={handleSubmit}
                              disabled={submitting}
                              className="px-6 py-2.5 bg-gray-900 text-white rounded-xl shadow-lg shadow-gray-200 hover:bg-black transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                         >
                              {submitting ? (
                                   <>Saving...</>
                              ) : (
                                   <>
                                        <MdSave size={16} /> Update
                                   </>
                              )}
                         </button>
                    </div>
               </div>
          </div>
     );
}
