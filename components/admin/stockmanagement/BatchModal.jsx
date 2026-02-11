"use client";

import { useState, useEffect } from "react";
import { MdClose, MdSave, MdCalendarToday, MdInventory } from "react-icons/md";
import AdminInput from "../common/AdminInput";
import AdminSelect from "../common/AdminSelect";
import { adminFetch, adminFetchWithToast } from "@/lib/admin/adminFetch";
import toast from "react-hot-toast";

export default function BatchModal({ isOpen, onClose, onSave }) {
     const [products, setProducts] = useState([]);
     const [variants, setVariants] = useState([]);
     const [loadingProducts, setLoadingProducts] = useState(false);
     const [loadingVariants, setLoadingVariants] = useState(false);

     const [batchPrefix, setBatchPrefix] = useState("");
     const [batchSuffix, setBatchSuffix] = useState("");

     const [formData, setFormData] = useState({
          product: "",
          variant: "",
          batchNo: "",
          productionDate: "",
          expiryDate: "",
          quantity: ""
     });

     const [submitting, setSubmitting] = useState(false);

     useEffect(() => {
          if (isOpen) {
               fetchProducts();
               // Reset form
               const today = new Date().toISOString().split('T')[0];
               setFormData({
                    product: "",
                    variant: "",
                    batchNo: "",
                    productionDate: today,
                    expiryDate: "",
                    quantity: ""
               });
               setBatchPrefix("");
               setBatchSuffix("");
               setVariants([]);
          }
     }, [isOpen]);

     // Fetch Variants when Product changes
     useEffect(() => {
          if (formData.product) {
               fetchVariants(formData.product);
          } else {
               setVariants([]);
          }
     }, [formData.product]);

     // Auto-generate Batch Prefix
     useEffect(() => {
          if (formData.product && formData.variant && products.length > 0 && variants.length > 0) {
               const productObj = products.find(p => p.value === formData.product);
               const variantObj = variants.find(v => v.value === formData.variant);

               if (productObj && variantObj) {
                    const cleanName = (str) => str ? str.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() : "XXX";

                    const catCode = cleanName(productObj.categoryName).substring(0, 3);
                    const prodCode = cleanName(productObj.label).substring(0, 3);
                    const varCode = cleanName(variantObj.name).substring(0, 3);

                    // Format: CAT-PRO-VAR-
                    const prefix = `${catCode}-${prodCode}-${varCode}-`; // User requested cat(3)-prod(3)-var(3)-batchname
                    setBatchPrefix(prefix);
               }
          }
     }, [formData.product, formData.variant, products, variants]);

     // Sync Batch No
     useEffect(() => {
          setFormData(prev => ({ ...prev, batchNo: batchPrefix + batchSuffix }));
     }, [batchPrefix, batchSuffix]);

     const fetchProducts = async () => {
          setLoadingProducts(true);
          try {
               const res = await adminFetch("/api/admin/catalog/products?status=active"); // Only active products
               if (res.success) {
                    setProducts(res.data.map(p => ({
                         label: p.name,
                         value: p._id,
                         categoryName: p.category?.name || "Uncategorized"
                    })));
               }
          } catch (error) {
               toast.error("Failed to load products");
          } finally {
               setLoadingProducts(false);
          }
     };

     const fetchVariants = async (productId) => {
          setLoadingVariants(true);
          try {
               const res = await adminFetch(`/api/admin/catalog/variants?product=${productId}`);
               if (res.success) {
                    setVariants(res.data.map(v => ({
                         label: `${v.name} (SKU: ${v.sku})`,
                         value: v._id,
                         name: v.name
                    })));
               }
          } catch (error) {
               toast.error("Failed to load variants");
          } finally {
               setLoadingVariants(false);
          }
     };

     const handleChange = (e) => {
          const { name, value } = e.target;
          setFormData(prev => ({ ...prev, [name]: value }));
     };

     const handleSubmit = async (e) => {
          e.preventDefault();

          if (!formData.product || !formData.variant || !formData.batchNo || !formData.expiryDate || !formData.quantity) {
               toast.error("Please fill all required fields");
               return;
          }

          if (new Date(formData.expiryDate) < new Date(formData.productionDate)) {
               toast.error("Expiry date cannot be before production date");
               return;
          }

          setSubmitting(true);

          try {
               const data = await adminFetchWithToast(
                    "/api/admin/stockmanagement",
                    {
                         method: "POST",
                         body: JSON.stringify(formData)
                    },
                    {
                         loading: "Creating batch...",
                         success: "Batch created successfully",
                         error: "Failed to create batch"
                    },
                    toast
               );

               if (data.success) {
                    onSave();
                    onClose();
               }
          } catch (error) {
               console.error(error);
          } finally {
               setSubmitting(false);
               const today = new Date().toISOString().split('T')[0];
               setFormData({
                    product: "",
                    variant: "",
                    batchNo: "",
                    productionDate: today,
                    expiryDate: "",
                    quantity: ""
               });
               setBatchPrefix("");
               setBatchSuffix("");
               setVariants([]);
               setProducts([]);
          }
     };

     if (!isOpen) return null;

     return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-300">
               <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden border border-gray-100">

                    {/* Header */}
                    <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                         <div>
                              <h2 className="text-xl font-bold text-gray-800 tracking-tight">Add Batch</h2>
                              <p className="text-[10px] text-gray-400 font-light uppercase tracking-widest mt-1">Production Run Entry</p>
                         </div>
                         <button onClick={onClose} className="p-2 bg-white hover:bg-red-50 hover:text-red-500 rounded-full transition-all shadow-sm border border-gray-100">
                              <MdClose size={20} />
                         </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">

                         <AdminSelect
                              label="Product *"
                              name="product"
                              value={formData.product}
                              onChange={handleChange}
                              options={products}
                              placeholder={loadingProducts ? "Loading Products..." : "Select Product"}
                              disabled={loadingProducts}
                         />

                         <AdminSelect
                              label="Variant *"
                              name="variant"
                              value={formData.variant}
                              onChange={handleChange}
                              options={variants}
                              placeholder={!formData.product ? "Select Product First" : (loadingVariants ? "Loading Variants..." : "Select Variant")}
                              disabled={!formData.product || loadingVariants}
                         />

                         {/* Split Batch Input */}
                         <div>
                              <label className="text-xs font-light text-gray-400 ml-1 mb-2 block">
                                   Batch Number *
                              </label>
                              <div className="flex items-center">
                                   <div className="bg-gray-100 border border-r-0 border-gray-200 rounded-l-2xl py-3.5 px-4 text-[13px] text-gray-500 font-mono font-medium select-none min-w-[120px] text-center">
                                        {batchPrefix || "PREFIX-"}
                                   </div>
                                   <input
                                        type="text"
                                        value={batchSuffix}
                                        onChange={(e) => setBatchSuffix(e.target.value.toUpperCase())}
                                        placeholder="Suffix (e.g. A)"
                                        className="w-full bg-white border border-gray-100 rounded-r-2xl py-3.5 px-5 outline-none focus:border-purple-600/30 focus:ring-4 focus:ring-purple-600/5 transition-all text-[13px] font-light text-gray-600 placeholder:font-light shadow-sm"
                                   />
                              </div>
                              <p className="text-[10px] text-gray-400 mt-1 ml-1">
                                   Full Batch No: <span className="font-mono font-bold text-gray-600">{batchPrefix}{batchSuffix || "..."}</span>
                              </p>
                         </div>


                         <div className="grid grid-cols-2 gap-4">
                              <AdminInput
                                   label="Production Date"
                                   name="productionDate"
                                   type="date"
                                   value={formData.productionDate}
                                   onChange={handleChange}
                                   icon={MdCalendarToday}
                              />
                              <AdminInput
                                   label="Expiry Date *"
                                   name="expiryDate"
                                   type="date"
                                   value={formData.expiryDate}
                                   onChange={handleChange}
                                   icon={MdCalendarToday}
                              />
                         </div>

                         <AdminInput
                              label="Quantity *"
                              name="quantity"
                              type="number"
                              value={formData.quantity}
                              onChange={handleChange}
                              placeholder="e.g. 300"
                              min="0"
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
                                        <MdSave size={16} /> Save Batch
                                   </>
                              )}
                         </button>
                    </div>
               </div>
          </div>
     );
}
