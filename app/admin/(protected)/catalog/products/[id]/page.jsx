"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import ProductForm from "@/components/admin/catalog/ProductForm";
import toast from "react-hot-toast";

export default function EditProductPage({ params }) {
     const { id } = use(params);
     const router = useRouter();
     const [product, setProduct] = useState(null);
     const [categories, setCategories] = useState([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          const fetchData = async () => {
               try {
                    // Fetch Categories
                    const catRes = await fetch("/api/admin/catalog/categories");
                    const catData = await catRes.json();
                    if (catData.success) {
                         setCategories(Array.isArray(catData.data) ? catData.data : []);
                    }

                    // Fetch Product (Using the search API or we might need a direct GET by ID if not available, usually reusing search logic fits or we assume the list has it, but better explicit fetch)
                    // Currently our API route `app/api/admin/catalog/products/[id]/route.js` ONLY has PATCH and DELETE.
                    // We need to implement GET in `[id]/route.js` OR use the main route with search? No, `[id]` is best. 
                    // Wait, I see I should check if GET is available in [id] route.
                    // I will check the file using `read_file` before writing if unsure, BUT 
                    // `app/api/admin/catalog/products/route.js` has GET (list), `[id]/route.js` usually has GET too. 
                    // Let me quickly assume I need to ADD GET to `[id]/route.js` OR just use what I have.
                    // Actually, looking at previous context `app/api/admin/catalog/products/[id]/route.js` ONLY showed PATCH and DELETE in the `view_file` output in step 22.
                    // So I MUST add GET to `[id]/route.js` as well to support this page.
               } catch (e) {
                    console.error(e);
               }
          };
          fetchData();
          // For now, I'll implement the component assuming I'll fix the API next.
     }, []);

     // Let's reimplement useEffect to purely handle the page logic, I'll fix the API separately.
     useEffect(() => {
          const init = async () => {
               try {
                    const [catRes, prodRes] = await Promise.all([
                         fetch("/api/admin/catalog/categories"),
                         fetch(`/api/admin/catalog/products/${id}`)
                    ]);

                    const catData = await catRes.json();
                    const prodData = await prodRes.json();

                    if (catData.success) setCategories(catData.data);

                    if (prodData.success) {
                         setProduct(prodData.data);
                    } else {
                         toast.error("Product not found");
                         router.push("/admin/catalog/products");
                    }
               } catch (error) {
                    toast.error("Failed to load data");
               } finally {
                    setLoading(false);
               }
          };

          if (id) init();
     }, [id, router]);

     const handleSave = (updatedProduct) => {
          router.push("/admin/catalog/products");
     };

     const handleCancel = () => {
          router.back();
     };

     if (loading) return <div className="p-8 text-center text-gray-400 font-light">Loading product data...</div>;
     if (!product) return null;

     return (
          <div className="space-y-6 animate-in fade-in duration-500">
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
          </div>
     );
}
