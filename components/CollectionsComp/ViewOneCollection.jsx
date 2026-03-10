"use client";
import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Home/Navbar";
import MobileBottomNav from "@/components/Home/MobileBottomNav";
import Footer from "@/components/Home/Footer";
import { useCart } from "@/context/CartContext";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import RestockModal from "@/components/Product/RestockModal";

// Sub-components
import ProductGallery from "@/components/Product/ProductGallery";
import ProductInfo from "@/components/Product/ProductInfo";
import ProductTabs from "@/components/Product/ProductTabs";

// Hook
import { useProductDetails } from "@/hooks/useProductDetails";

export default function ViewOneCollection() {
  const { slug } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { vendorId, pincode, postOffice, district, isServiceable } = useLocation();

  const [quantity, setQuantity] = useState(1);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);

  // Custom hook for product logic
  const {
    product,
    loading,
    notifyLoading,
    selectedVariant,
    setSelectedVariant,
    handleNotifyRequest,
  } = useProductDetails(slug, pincode, vendorId, postOffice, user);

  const handleQuantityChange = (type) => {
    if (type === "dec") {
      setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
    } else {
      setQuantity((prev) => prev + 1);
    }
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-bold text-gray-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-30 w-full animate-fadeIn">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/collections" className="hover:text-primary transition-colors">
            Collections
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Left: Image Gallery */}
          <ProductGallery images={product.images} productName={product.name} />

          {/* Right: Product Details */}
          <ProductInfo
            product={product}
            selectedVariant={selectedVariant}
            setSelectedVariant={setSelectedVariant}
            quantity={quantity}
            handleQuantityChange={handleQuantityChange}
            pincode={pincode}
            isServiceable={isServiceable}
            district={district}
            addToCart={addToCart}
            router={router}
            handleNotifyRequest={() => handleNotifyRequest(() => setIsRestockModalOpen(true))}
            notifyLoading={notifyLoading}
          />
        </div>

        {/* Bottom: Tabs */}
        <ProductTabs product={product} />
      </main>

      <Footer />
      <MobileBottomNav />

      {/* Restock Modal for Guests */}
      {selectedVariant && (
        <RestockModal
          isOpen={isRestockModalOpen}
          onClose={() => setIsRestockModalOpen(false)}
          product={product}
          variant={selectedVariant}
          onSubmitSuccess={() => setIsRestockModalOpen(false)}
        />
      )}
    </div>
  );
}
