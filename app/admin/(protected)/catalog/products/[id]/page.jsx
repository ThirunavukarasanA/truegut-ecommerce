"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin/adminFetch";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import ProductForm from "@/components/admin/catalog/ProductForm";
import toast from "react-hot-toast";
import AdminConfirmModal from "@/components/admin/common/AdminConfirmModal";

export default function EditProductPage({ params }) {
     const { id } = use(params);
     const router = useRouter();
     const [product, setProduct] = useState(null);
     const [categories, setCategories] = useState([]);
     const [loading, setLoading] = useState(true);

     const [isConfirmOpen, setIsConfirmOpen] = useState(false);
     const [formDataToSubmit, setFormDataToSubmit] = useState(null);

     useEffect(() => {
          const init = async () => {
               try {
                    const [catData, prodData] = await Promise.all([
                         adminFetch("/api/admin/catalog/categories"),
                         adminFetch(`/api/admin/catalog/products/${id}`)
                    ]);

                    if (catData.success) setCategories(catData.data);

                    if (prodData.success) {
                         setProduct(prodData.data);
                    } else {
                         toast.error("Product not found");
                         router.push("/admin/catalog/products");
                    }
               } catch (error) {
                    if (error.message !== 'Unauthorized - Redirecting to login') {
                         toast.error(error.message || "Failed to load data");
                    }
               } finally {
                    setLoading(false);
               }
          };

          if (id) init();
     }, [id, router]);

     const handleSave = (formData) => {
          setFormDataToSubmit(formData);
          setIsConfirmOpen(true);
     };

     const confirmSubmit = async () => {
          if (!formDataToSubmit) return;
          const toastId = toast.loading("Updating product...");
          try {
               const data = await adminFetch(`/api/admin/catalog/products/${id}`, {
                    method: "PATCH",
                    body: formDataToSubmit,
               });

               if (data.success) {
                    toast.success("Product updated successfully", { id: toastId });
                    setProduct(data.data);
                    router.replace('/admin/catalog/products')
               } else {
                    toast.error(data.error || "Failed to update product", { id: toastId });
               }
          } catch (error) {
               console.error(error);
               toast.error("An error occurred", { id: toastId });
          } finally {
               setIsConfirmOpen(false);
               setFormDataToSubmit(null);
          }
     };

     const handleCancel = () => {
          router.back();
     };

     if (loading) return <div className="p-8 text-center text-gray-400 font-light">Loading product data...</div>;
     if (!product) return null;

     return (
          <div className="space-y-6 animate-in fade-in duration-500 flex flex-col h-[calc(100vh-8rem)]">
               <AdminPageHeader
                    title="Update Product"
                    description={`Refine specifications for ${product.name}`}
                    showBack={true}
               />

               <ProductForm
                    editMode={true}
                    initialData={product}
                    categories={categories}
                    onSave={handleSave}
                    onCancel={handleCancel}
               />

               <AdminConfirmModal
                    isOpen={isConfirmOpen}
                    onClose={() => setIsConfirmOpen(false)}
                    onConfirm={confirmSubmit}
                    title="Confirm Update"
                    message="Are you sure you want to update the product details?"
                    action="update"
                    type="info"
               />
          </div>
     );
}