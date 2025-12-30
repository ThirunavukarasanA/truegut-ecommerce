"use client";

import { useState, useEffect } from "react";
import { MdClose, MdCloudUpload, MdDelete, MdInfoOutline, MdAttachMoney, MdInventory, MdScience, MdCategory, MdImage } from "react-icons/md";
import toast from "react-hot-toast";
import AdminInput from "@/components/admin/common/AdminInput";
import AdminSelect from "@/components/admin/common/AdminSelect";
import AdminConfirmModal from "@/components/admin/common/AdminConfirmModal";

export default function ProductForm({ editMode = false, initialData = null, categories = [], onSave, onCancel }) {
     const [formData, setFormData] = useState({
          name: "", category: "", price: "", stock: "", openingStock: "0", status: "Draft", description: "",
          fermentationType: "", fermentationDuration: "", shelfLife: "", images: [], productCode: ""
     });
     const [submitting, setSubmitting] = useState(false);
     const [isConfirmOpen, setIsConfirmOpen] = useState(false);
     const [uploading, setUploading] = useState(false);

     useEffect(() => {
          if (initialData) {
               setFormData({
                    ...initialData,
                    category: initialData.category?._id || initialData.category || "",
                    fermentationType: initialData.fermentationType || "",
                    fermentationDuration: initialData.fermentationDuration || "",
                    shelfLife: initialData.shelfLife || "",
                    openingStock: initialData.openingStock || "0",
                    shelfLife: initialData.shelfLife || "",
                    openingStock: initialData.openingStock || "0",
                    // Normalize images: Remote URLs are strings.
                    images: (initialData.images || []).map(url => ({
                         id: url, // Unique ID for key
                         preview: url, // Display URL
                         file: null, // No file object for existing
                         original: url // To track existing
                    })),
                    productCode: initialData.productCode || ""
               });
          }
     }, [initialData]);

     // Real-time Scenario: Auto-update status based on stock
     useEffect(() => {
          // Logic for auto-updating status could go here
     }, [formData.stock]);

     // Helper to block negative inputs
     const preventNegative = (e) => {
          if (['-', 'e', 'E'].includes(e.key)) e.preventDefault();
     };

     const handleImageUpload = (e) => {
          const files = Array.from(e.target.files);

          // Filter large files (>2MB)
          const validFiles = files.filter(file => {
               if (file.size > 2 * 1024 * 1024) {
                    toast.error(`Skipped ${file.name}: >2MB`);
                    return false;
               }
               return true;
          });

          if (validFiles.length === 0) return;

          if (formData.images.length + validFiles.length > 5) {
               return toast.error("Max 5 images allowed");
          }

          // Create local previews
          const newImages = validFiles.map(file => ({
               id: Math.random().toString(36).substr(2, 9),
               preview: URL.createObjectURL(file),
               file: file
          }));

          setFormData(prev => ({
               ...prev,
               images: [...prev.images, ...newImages]
          }));
     };

     const removeImage = (index) => {
          // If it's a local file, revoke object URL to free memory
          const img = formData.images[index];
          if (img.file) {
               URL.revokeObjectURL(img.preview);
          }

          setFormData(prev => ({
               ...prev,
               images: prev.images.filter((_, i) => i !== index)
          }));
     };

     const handleSubmit = (e) => {
          e.preventDefault();
          if (!formData.name || !formData.category || !formData.price) {
               return toast.error("Required fields missing");
          }
          if (formData.images.length === 0) {
               return toast.error("At least one product image is required");
          }
          setIsConfirmOpen(true);
     };

     const confirmSubmit = async () => {
          setSubmitting(true);

          const toastId = toast.loading(editMode ? "Updating catalog..." : "Creating product...");

          try {
               const url = editMode
                    ? `/api/admin/catalog/products/${formData._id}`
                    : "/api/admin/catalog/products";
               const method = editMode ? "PATCH" : "POST";

               // Construct FormData
               const data = new FormData();
               data.append('name', formData.name);
               data.append('category', formData.category);
               data.append('price', formData.price);
               data.append('stock', formData.stock);
               data.append('openingStock', formData.openingStock);
               data.append('status', formData.status);
               data.append('description', formData.description);
               data.append('fermentationType', formData.fermentationType);
               data.append('fermentationDuration', formData.fermentationDuration);
               data.append('shelfLife', formData.shelfLife);

               // Append Images
               formData.images.forEach((img) => {
                    if (img.file) {
                         // New file to upload
                         data.append('newImages', img.file);
                    } else if (img.original) {
                         // Existing image URL
                         data.append('existingImages', img.original);
                    }
               });

               const res = await fetch(url, {
                    method,
                    body: data, // Send FormData directly
               });
               const responseData = await res.json();

               if (responseData.success) {
                    toast.success(editMode ? 'Product Updated' : 'Product Created', { id: toastId });
                    if (onSave) onSave(responseData.data);
               } else {
                    toast.error(responseData.error || "Operation failed", { id: toastId });
               }
          } catch (error) {
               toast.error("Network error", { id: toastId });
          } finally {
               setSubmitting(false);
               setIsConfirmOpen(false);
          }
     };

     const categoryOptions = [
          { value: "", label: "Select Category" },
          ...(Array.isArray(categories) ? categories.map(c => ({ value: c._id, label: c.name })) : [])
     ];

     const statusOptions = [
          { value: "Active", label: "Active (Visible)" },
          { value: "Draft", label: "Draft (Hidden)" },
          { value: "Out of Stock", label: "Out of Stock" }
     ];

     return (
          <div className="flex flex-col h-full bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
               <form id="product-form" onSubmit={handleSubmit} className="flex-1 flex flex-col lg:flex-row">

                    {/* LEFT COLUMN: Main Information */}
                    <div className="flex-1 p-8 lg:p-12 space-y-8 border-b lg:border-b-0 lg:border-r border-gray-100">
                         <div className="space-y-6">
                              <h3 className="text-sm font-light uppercase tracking-widest text-purple-600 flex items-center gap-2">
                                   <MdInfoOutline /> Basic Information
                              </h3>

                              {editMode && formData.productCode && (
                                   <div className="bg-purple-50/50 border border-purple-100 rounded-xl px-4 py-2 flex items-center gap-2">
                                        <span className="text-[10px] uppercase tracking-widest text-purple-400">SKU</span>
                                        <span className="font-mono text-sm text-purple-700">{formData.productCode}</span>
                                   </div>
                              )}

                              <AdminInput
                                   label="Product Name"
                                   required
                                   value={formData.name}
                                   onChange={e => setFormData({ ...formData, name: e.target.value })}
                                   placeholder="e.g. Lavender Kombucha"
                                   className="text-lg font-medium"
                              />

                              <div className="grid grid-cols-2 gap-6">
                                   <AdminSelect
                                        label="Category"
                                        required
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        options={categoryOptions}
                                        icon={MdCategory}
                                   />
                                   <AdminInput
                                        label="Price (₹)"
                                        required
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        onKeyDown={preventNegative}
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: Math.max(0, e.target.value) })}
                                        placeholder="0.00"
                                        icon={MdAttachMoney}
                                   />
                              </div>

                              <div className="space-y-2">
                                   <label className="text-xs font-light text-gray-400 ml-1">Description</label>
                                   <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:border-purple-300 focus:bg-white focus:ring-4 focus:ring-purple-500/10 transition-all h-40 resize-none text-sm font-light text-gray-600 placeholder:text-gray-300"
                                        placeholder="Describe the flavor, process, and benefits..."
                                   ></textarea>
                              </div>
                         </div>

                         <div className="pt-8 border-t border-gray-100 space-y-6">
                              <h3 className="text-sm font-light uppercase tracking-widest text-purple-600 flex items-center gap-2">
                                   <MdScience /> Fermentation Details
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                   <AdminInput
                                        label="Type"
                                        value={formData.fermentationType}
                                        onChange={e => setFormData({ ...formData, fermentationType: e.target.value })}
                                        placeholder="e.g. Wild"
                                   />
                                   <AdminInput
                                        label="Duration"
                                        value={formData.fermentationDuration}
                                        onChange={e => setFormData({ ...formData, fermentationDuration: e.target.value })}
                                        placeholder="e.g. 14 Days"
                                   />
                                   <AdminInput
                                        label="Shelf Life"
                                        type="number"
                                        min="0"
                                        onKeyDown={preventNegative}
                                        value={formData.shelfLife}
                                        onChange={e => setFormData({ ...formData, shelfLife: Math.max(0, e.target.value) })}
                                        placeholder="Days"
                                   />
                              </div>
                         </div>
                    </div>

                    {/* RIGHT COLUMN: Media & Inventory (Sidebar) */}
                    <div className="w-full lg:w-[400px] p-8 lg:p-12 space-y-8 bg-gray-50/30">
                         {/* Inventory Card */}
                         <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                              <h3 className="text-xs font-light uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                   <MdInventory /> Inventory Status
                              </h3>

                              <AdminSelect
                                   label="Status"
                                   required
                                   value={formData.status}
                                   onChange={e => setFormData({ ...formData, status: e.target.value })}
                                   options={statusOptions}
                              />

                              <div className="relative">
                                   <AdminInput
                                        label="Stock Quantity"
                                        required
                                        type="number"
                                        min="0"
                                        onKeyDown={preventNegative}
                                        value={formData.stock}
                                        onChange={e => setFormData({ ...formData, stock: Math.max(0, e.target.value) })}
                                        placeholder="0"
                                   />
                                   <AdminInput
                                        label="Opening Stock"
                                        type="number"
                                        min="0"
                                        onKeyDown={preventNegative}
                                        value={formData.openingStock}
                                        onChange={e => setFormData({ ...formData, openingStock: Math.max(0, e.target.value) })}
                                        placeholder="0"
                                   />
                                   {formData.stock === "0" && (
                                        <div className="absolute top-0 right-0 p-1">
                                             <span className="text-[9px] text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">Zero Stock</span>
                                        </div>
                                   )}
                              </div>
                         </div>

                         {/* Images Card */}
                         <div className="space-y-6">
                              <h3 className="text-xs font-light uppercase tracking-widest text-gray-500 flex items-center justify-between">
                                   <span className="flex items-center gap-2"><MdImage /> Media Gallery</span>
                                   <span className="text-purple-400">{formData.images.length}/5</span>
                              </h3>

                              <div className="grid grid-cols-2 gap-3">
                                   {formData.images.map((img, index) => (
                                        <div key={img.id} className="relative group aspect-square rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm">
                                             <img src={img.preview} alt={`img-${index}`} className="w-full h-full object-cover" />
                                             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                             <button
                                                  type="button"
                                                  onClick={() => removeImage(index)}
                                                  className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-white"
                                             >
                                                  <MdDelete size={14} />
                                             </button>
                                        </div>
                                   ))}

                                   {/* Upload Placeholder */}
                                   {formData.images.length < 5 && (
                                        <label className="aspect-square flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all group relative overflow-hidden">
                                             <input
                                                  type="file"
                                                  accept="image/*"
                                                  multiple
                                                  onChange={handleImageUpload}
                                                  className="hidden"
                                             />
                                             {uploading ? (
                                                  <div className="animate-pulse flex flex-col items-center">
                                                       <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mb-2"></div>
                                                       <span className="text-[9px] text-purple-400 uppercase tracking-widest">Uploading</span>
                                                  </div>
                                             ) : (
                                                  <>
                                                       <MdCloudUpload className="text-gray-300 group-hover:text-purple-400 transition-colors mb-2" size={28} />
                                                       <span className="text-[9px] text-gray-400 font-light text-center uppercase tracking-wider group-hover:text-purple-500">Add Image</span>
                                                  </>
                                             )}
                                        </label>
                                   )}
                              </div>
                         </div>
                    </div>
               </form>

               {/* Sticky Footer */}
               <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4 justify-between items-center">
                    <button type="button" onClick={onCancel} className="text-sm font-light text-gray-500 hover:text-gray-800 px-4 py-2 hover:bg-white rounded-xl transition-all">
                         Cancel
                    </button>
                    <button type="submit" form="product-form" disabled={submitting} className="px-10 py-4 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 disabled:opacity-70 disabled:shadow-none min-w-[160px]">
                         {submitting ? (
                              <div className="flex items-center justify-center gap-2">
                                   <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                   <span>Saving...</span>
                              </div>
                         ) : (
                              editMode ? "Save Changes" : "Create Product"
                         )}
                    </button>
               </div>

               <AdminConfirmModal
                    isOpen={isConfirmOpen}
                    onClose={() => setIsConfirmOpen(false)}
                    onConfirm={confirmSubmit}
                    title={editMode ? "Update Product" : "Create Product"}
                    message="Please confirm the product details before saving."
                    type="info"
                    action={editMode ? "update" : "create"}
                    confirmLabel={editMode ? "Update" : "Create"}
               />
          </div>
     );
}
