"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminInput from "@/components/admin/common/AdminInput";
import AdminSelect from "@/components/admin/common/AdminSelect";
import { useSettings } from "@/context/SettingsContext";
import toast from "react-hot-toast";
import {
     MdClose, MdScience, MdLocalShipping, MdArticle, MdImage,
     MdAccessTime, MdLocalBar, MdDateRange, MdVerifiedUser,
     MdPublic, MdWarning, MdCategory, MdInfo, MdHistory, MdRestaurantMenu
} from "react-icons/md";

// Helper to safely parse JSON if needed, or just return defaults
const safeParse = (data) => data;

export default function ProductForm({ editMode = false, initialData = null, categories = [], onSave, onCancel }) {
     const { settings } = useSettings();
     const [formData, setFormData] = useState({
          name: "",
          category: "",
          status: "draft",
          description: "",
          history: "",
          nutrition: "",
          shelfLifeDays: "",
          requiresColdShipping: false,
          isSubscriptionAvailable: false,
          images: [],

          fermentation: {
               type: "acetic", // Default from enum
               durationDays: "",
               liveCulture: true,
               alcoholPercentage: ""
          },
          regulatory: {
               warnings: "",
          }
     });

     const [submitting, setSubmitting] = useState(false);
     const [newImages, setNewImages] = useState([]);
     const [previewImages, setPreviewImages] = useState([]); // For new uploads
     const [existingImages, setExistingImages] = useState([]); // For edit mode

     const router = useRouter();

     useEffect(() => {
          if (editMode && initialData) {
               setFormData({
                    name: initialData.name || "",
                    category: initialData.category?._id || initialData.category || "",
                    status: initialData.status || "draft",
                    description: initialData.description || "",
                    history: initialData.history || "",
                    nutrition: initialData.nutrition || "",
                    shelfLifeDays: initialData.shelfLifeDays || "",
                    requiresColdShipping: initialData.requiresColdShipping || false,
                    isSubscriptionAvailable: initialData.isSubscriptionAvailable || false,
                    images: [], // We handle images separately via existingImages state

                    fermentation: {
                         type: initialData.fermentation?.type || "acetic",
                         durationDays: initialData.fermentation?.durationDays || "",
                         liveCulture: initialData.fermentation?.liveCulture !== undefined ? initialData.fermentation.liveCulture : true,
                         alcoholPercentage: initialData.fermentation?.alcoholPercentage || ""
                    },
                    regulatory: {
                         warnings: initialData.regulatory?.warnings || "",
                    }
               });

               // Handle Images
               if (initialData.images && initialData.images.length > 0) {
                    setExistingImages(initialData.images);
               }
          }
     }, [editMode, initialData]);

     // Helper for nested state updates
     const updateNestedStr = (parent, field, value) => {
          setFormData(prev => ({
               ...prev,
               [parent]: {
                    ...prev[parent],
                    [field]: value
               }
          }));
     };

     const handleImageChange = (e) => {
          const files = Array.from(e.target.files);
          setNewImages(prev => [...prev, ...files]);

          // Create previews
          const newPreviews = files.map(file => URL.createObjectURL(file));
          setPreviewImages(prev => [...prev, ...newPreviews]);
     };

     const removeNewImage = (index) => {
          setNewImages(prev => prev.filter((_, i) => i !== index));
          setPreviewImages(prev => prev.filter((_, i) => i !== index));
     };

     const removeExistingImage = (index) => {
          setExistingImages(prev => prev.filter((_, i) => i !== index));
     };

     const handleSubmit = async (e) => {
          e.preventDefault();

          // Validation Checks
          if (!formData.name?.trim()) { toast.error("Product name is required"); return; }
          if (formData.name.length > 100) { toast.error("Name cannot exceed 100 characters"); return; }

          if (!formData.category) { toast.error("Category is required"); return; }

          if (!formData.description?.trim()) { toast.error("Description is required"); return; }
          if (formData.description.length > 2000) { toast.error("Description cannot exceed 2000 characters"); return; }

          if (formData.history?.length > 2000) { toast.error("History cannot exceed 2000 characters"); return; }

          if (formData.fermentation.durationDays && Number(formData.fermentation.durationDays) < 0) {
               toast.error("Duration cannot be negative"); return;
          }

          if (formData.fermentation.alcoholPercentage !== "") {
               const alc = Number(formData.fermentation.alcoholPercentage);
               if (alc < 0 || alc > 100) { toast.error("Alcohol percentage must be between 0 and 100"); return; }
          }

          if (formData.shelfLifeDays && Number(formData.shelfLifeDays) < 0) {
               toast.error("Shelf life cannot be negative"); return;
          }

          setSubmitting(true);
          const data = new FormData();

          // Basic Fields
          data.append("name", formData.name);
          data.append("category", formData.category);
          data.append("status", formData.status);
          data.append("description", formData.description);
          data.append("history", formData.history);
          data.append("nutrition", formData.nutrition);
          data.append("shelfLifeDays", formData.shelfLifeDays);
          data.append("requiresColdShipping", formData.requiresColdShipping);
          data.append("isSubscriptionAvailable", formData.isSubscriptionAvailable);

          // Nested Fields
          data.append("fermentation.type", formData.fermentation.type);
          data.append("fermentation.durationDays", formData.fermentation.durationDays);
          data.append("fermentation.liveCulture", formData.fermentation.liveCulture);
          data.append("fermentation.alcoholPercentage", formData.fermentation.alcoholPercentage);

          data.append("regulatory.warnings", formData.regulatory.warnings);

          // Images
          existingImages.forEach(img => {
               const url = typeof img === 'string' ? img : img.url;
               data.append("existingImages", url);
          });

          newImages.forEach(file => {
               data.append("newImages", file);
          });

          try {
               await onSave(data);
          } catch (error) {
               console.error(error);
               toast.error("Failed to save product");
          } finally {
               setSubmitting(false);
          }
     };

     // Options for selects
     const categoryOptions = categories.map(cat => ({ label: cat.name, value: cat._id }));
     const fermentationTypes = ["lactic", "acetic", "alcoholic", "fungal", "wild", "symbiotic"].map(t => ({
          label: t.charAt(0).toUpperCase() + t.slice(1),
          value: t
     }));

     return (
          <form id="product-form" onSubmit={handleSubmit} className="flex flex-col h-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
               {/* 1. Basic Info Section */}
               <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="space-y-6">
                         <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                              <MdArticle size={16} /> Basic Details
                         </h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <AdminInput
                                   label="Product Name"
                                   value={formData.name}
                                   onChange={e => setFormData({ ...formData, name: e.target.value })}
                                   placeholder="e.g. Lavender Kombucha"
                                   icon={MdArticle}
                                   required
                                   maxLength={100}
                                   helperText={`${formData.name.length}/100`}
                              />
                              <AdminSelect
                                   label="Category"
                                   value={formData.category}
                                   onChange={e => setFormData({ ...formData, category: e.target.value })}
                                   options={categoryOptions}
                                   icon={MdCategory}
                                   placeholder="Select Category"
                              />
                         </div>

                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="space-y-1.5">
                                   <label className="text-[11px] font-black uppercase tracking-wider text-gray-500 ml-1">Status</label>
                                   <div className="flex gap-4 p-1">
                                        {['draft', 'active', 'archived'].map(s => (
                                             <label key={s} className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                                                  <input
                                                       type="radio"
                                                       name="status"
                                                       value={s}
                                                       checked={formData.status === s}
                                                       onChange={e => setFormData({ ...formData, status: e.target.value })}
                                                       className="w-4 h-4 rounded-full text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                                  />
                                                  <span className="text-sm capitalize text-gray-700 font-medium">{s}</span>
                                             </label>
                                        ))}
                                   </div>
                              </div>

                              <div className="flex items-center pt-6">
                                   <label className="flex items-center gap-3 cursor-pointer p-4 rounded-2xl hover:bg-gray-50 transition-colors w-full border border-transparent hover:border-gray-100">
                                        <input
                                             type="checkbox"
                                             checked={formData.isSubscriptionAvailable}
                                             onChange={e => setFormData({ ...formData, isSubscriptionAvailable: e.target.checked })}
                                             className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                        />
                                        <div>
                                             <span className="text-sm font-bold text-gray-900 block">Subscription Available</span>
                                             <span className="text-xs text-gray-500">Enable recurring orders for this product</span>
                                        </div>
                                   </label>
                              </div>
                         </div>
                    </div>

                    <div className="w-full h-px bg-gray-100" />

                    {/* 2. Fermentation & Logistics */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                         {/* Fermentation */}
                         <div className="space-y-6">
                              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                                   <MdScience size={16} /> Fermentation
                              </h3>
                              <div className="grid grid-cols-2 gap-4">
                                   <div className="col-span-2">
                                        <AdminSelect
                                             label="Fermentation Type"
                                             value={formData.fermentation.type}
                                             onChange={e => updateNestedStr('fermentation', 'type', e.target.value)}
                                             options={fermentationTypes}
                                             icon={MdScience}
                                        />
                                   </div>
                                   <AdminInput
                                        label="Duration (Days)"
                                        type="number"
                                        value={formData.fermentation.durationDays}
                                        onChange={e => updateNestedStr('fermentation', 'durationDays', e.target.value)}
                                        icon={MdAccessTime}
                                        min={0}
                                   />
                                   <AdminInput
                                        label="Alcohol %"
                                        type="number"
                                        step="0.1"
                                        value={formData.fermentation.alcoholPercentage}
                                        onChange={e => updateNestedStr('fermentation', 'alcoholPercentage', e.target.value)}
                                        icon={MdLocalBar}
                                        min={0}
                                        max={100}
                                   />
                              </div>
                              <label className="flex items-center gap-2 cursor-pointer ml-1">
                                   <input
                                        type="checkbox"
                                        checked={formData.fermentation.liveCulture}
                                        onChange={e => updateNestedStr('fermentation', 'liveCulture', e.target.checked)}
                                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                   />
                                   <span className="text-sm font-medium text-gray-700">Contains Live Culture</span>
                              </label>
                         </div>

                         {/* Logistics & Regulatory */}
                         <div className="space-y-6">
                              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                                   <MdLocalShipping size={16} /> Logistics & Regulatory
                              </h3>
                              <div className="grid grid-cols-2 gap-4">
                                   <AdminInput
                                        label="Shelf Life (Days)"
                                        type="number"
                                        value={formData.shelfLifeDays}
                                        onChange={e => setFormData({ ...formData, shelfLifeDays: e.target.value })}
                                        icon={MdDateRange}
                                        min={0}
                                   />
                                   <div className="flex items-end pb-3">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                             <input
                                                  type="checkbox"
                                                  checked={formData.requiresColdShipping}
                                                  onChange={e => setFormData({ ...formData, requiresColdShipping: e.target.checked })}
                                                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                             />
                                             <span className="text-sm font-medium text-gray-700">Requires Cold Shipping</span>
                                        </label>
                                   </div>

                              </div>
                              <AdminInput
                                   label="Warnings / Allergens"
                                   value={formData.regulatory.warnings}
                                   onChange={e => updateNestedStr('regulatory', 'warnings', e.target.value)}
                                   placeholder="e.g. Contains Nuts"
                                   icon={MdWarning}
                              />
                         </div>
                    </div>

                    <div className="w-full h-px bg-gray-100" />

                    {/* 3. Content Sections */}
                    <div className="space-y-6">
                         <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                              <MdArticle size={16} /> Product Content
                         </h3>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <AdminInput
                                   label="Short Description"
                                   value={formData.description}
                                   onChange={e => setFormData({ ...formData, description: e.target.value })}
                                   placeholder="Brief overview of the product..."
                                   icon={MdInfo}
                                   isTextArea
                                   rows={4}
                                   required
                                   maxLength={2000}
                                   helperText={`${formData.description.length}/2000`}
                              />
                              <AdminInput
                                   label="History / Brand Story"
                                   value={formData.history}
                                   onChange={e => setFormData({ ...formData, history: e.target.value })}
                                   placeholder="The origin story behind this ferment..."
                                   icon={MdHistory}
                                   isTextArea
                                   rows={4}
                                   maxLength={2000}
                                   helperText={`${formData.history.length}/2000`}
                              />
                              <div className="md:col-span-2">
                                   <AdminInput
                                        label="Nutrition & Ingredients"
                                        value={formData.nutrition}
                                        onChange={e => setFormData({ ...formData, nutrition: e.target.value })}
                                        placeholder="List of ingredients and nutritional values..."
                                        icon={MdRestaurantMenu}
                                        isTextArea
                                        rows={3}
                                   />
                              </div>
                         </div>
                    </div>

                    {/* 4. Images */}
                    <div className="space-y-6">
                         <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                              <MdImage size={16} /> Media
                         </h3>

                         <div className="border-2 border-dashed border-gray-100 rounded-2xl p-8 hover:bg-gray-50/50 transition-colors text-center cursor-pointer group relative">
                              <input
                                   type="file"
                                   multiple
                                   accept="image/*"
                                   onChange={handleImageChange}
                                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              <div className="space-y-2 pointer-events-none">
                                   <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                        <MdImage size={24} />
                                   </div>
                                   <div className="text-sm font-medium text-gray-700">
                                        Click to upload product images
                                   </div>
                                   <div className="text-xs text-gray-400">
                                        PNG, JPG up to 5MB
                                   </div>
                              </div>
                         </div>

                         {/* Image Previews */}
                         <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                              {/* Existing Images */}
                              {existingImages.map((img, index) => (
                                   <div key={`existing-${index}`} className="aspect-square rounded-xl overflow-hidden relative group">
                                        <img
                                             src={typeof img === 'string' ? img : img.url}
                                             alt={typeof img === 'string' ? "Product" : img.alt}
                                             className="w-full h-full object-cover"
                                        />
                                        <button
                                             type="button"
                                             onClick={() => removeExistingImage(index)}
                                             className="absolute top-1 right-1 p-1 bg-white/90 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                        >
                                             <MdClose size={14} />
                                        </button>
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                             Existing
                                        </div>
                                   </div>
                              ))}

                              {/* New Previews */}
                              {previewImages.map((src, index) => (
                                   <div key={`new-${index}`} className="aspect-square rounded-xl overflow-hidden relative group border-2 border-indigo-100">
                                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                             type="button"
                                             onClick={() => removeNewImage(index)}
                                             className="absolute top-1 right-1 p-1 bg-white/90 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                        >
                                             <MdClose size={14} />
                                        </button>
                                        <div className="absolute bottom-0 left-0 right-0 bg-green-500/80 text-white text-[10px] p-1 text-center font-bold">
                                             New
                                        </div>
                                   </div>
                              ))}
                         </div>
                    </div>
               </div>

               {/* Footer Section */}
               <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center px-8 shrink-0">
                    <button
                         type="button"
                         onClick={onCancel}
                         className="px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all flex items-center gap-2 group"
                    >
                         <MdClose size={18} className="group-hover:rotate-90 transition-transform" /> Discard
                    </button>

                    <button
                         type="submit"
                         form="product-form"
                         disabled={submitting}
                         className="px-10 py-4 bg-gray-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-blue-600 active:scale-95 transition-all shadow-xl shadow-gray-200 flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                         {submitting ? "Saving..." : "Save Product"}
                    </button>
               </div>
          </form>
     );
}
