"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin/adminFetch";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import ProductForm from "@/components/admin/catalog/ProductForm";
import toast from "react-hot-toast";
import AdminConfirmModal from "@/components/admin/common/AdminConfirmModal";

export default function CreateProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await adminFetch("/api/admin/catalog/categories");
      if (data.success) {
        setCategories(Array.isArray(data.data) ? data.data : []);
      }
    } catch (e) {
      if (e.message !== "Unauthorized - Redirecting to login") {
        toast.error(e.message || "Failed to load categories");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (formData) => {
    setFormDataToSubmit(formData);
    setIsConfirmOpen(true);
  };

  const confirmSubmit = async () => {
    if (!formDataToSubmit) return;
    const toastId = toast.loading("Creating product...");
    try {
      // adminFetch handles FormData correctly now (if updated)
      const data = await adminFetch("/api/admin/catalog/products", {
        method: "POST",
        body: formDataToSubmit,
      });

      if (data.success) {
        toast.success("Product created successfully", { id: toastId });
        router.push(`/admin/catalog/products`);
      } else {
        toast.error(data.error || "Failed to create product", { id: toastId });
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

  if (loading)
    return (
      <div className="p-8 text-center text-gray-400 font-light">
        Loading environment...
      </div>
    );

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

      <AdminConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmSubmit}
        title="Confirm Creation"
        message="Are you ready to create this product? You can add variants in the next step."
        action="create"
        type='info'
      />
    </div>
  );
}
