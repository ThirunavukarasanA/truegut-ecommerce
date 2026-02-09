"use client";
import React, { useEffect, useState } from "react";
import ProductCard from "@/components/Common/ProductCard";
import Navbar from "@/components/Home/Navbar";
import MobileBottomNav from "@/components/Home/MobileBottomNav";
import Footer from "@/components/Home/Footer";
// Hardcoded PRODUCTS removed
import { FiSearch } from "react-icons/fi";

import { useLocation } from "@/context/LocationContext";

export default function collections() {
  const { vendorId, pincode } = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, vendorId, pincode]); // Refetch when location changes

  async function fetchProducts() {
    setLoading(true);
    try {
      const url = new URL("/api/products", window.location.origin);
      if (searchQuery) url.searchParams.set("search", searchQuery);
      if (vendorId) url.searchParams.set("vendor", vendorId);
      if (pincode) url.searchParams.set("pincode", pincode);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setProducts(
          data.products.map((p) => ({
            ...p,
            id: p._id,
            image: p.images?.[0]?.url || "/images/placeholder.png",
            price: p.minPrice || 0,
          }))
        );
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-28 w-full">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl italic font-bold text-font-title mb-2">
              All Collections
            </h1>
            <p className="text-gray-500 text-sm">
              Explore our range of organic and fermented products
            </p>
          </div>
          <hr className="w-1/3 border-gray-200 hidden md:block" />
          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm placeholder:text-gray-400 font-medium shadow-sm"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <FiSearch size={20} />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="h-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No products found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search query to find what you're looking for.
            </p>
          </div>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
