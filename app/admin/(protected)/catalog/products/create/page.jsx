"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import ProductForm from "@/components/admin/catalog/ProductForm";
import toast from "react-hot-toast";

export default function CreateProductPage() {
     const router = useRouter();
     const [categories, setCategories] = useState([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          fetchCategories();
     }, []);

     const fetchCategories = async () => {
          try {
               const res = await fetch("/api/admin/catalog/categories");
               const data = await res.json();
               if (data.success) {
                    setCategories(Array.isArray(data.data) ? data.data : []);
               }
          } catch (e) {
               toast.error("Failed to load categories");
          } finally {
               setLoading(false);
          }
     };

     const handleSave = (newProduct) => {
          router.push("/admin/catalog/products");
     };

     const handleCancel = () => {
          router.back();
     };

     if (loading) return <div className="p-8 text-center text-gray-400 font-light">Loading environment...</div>;

     return (
          <div className="space-y-6 animate-in fade-in duration-500">
               <AdminPageHeader
                    title="Initialize Product"
                    description="Define specifications for a new catalog item"
                    showBack={true}
               />

               <ProductForm
                    categories={categories}
                    onSave={handleSave}
                    onCancel={handleCancel}
               />
          </div>
     );
}
