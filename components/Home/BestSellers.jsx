"use client";
import React, { useEffect, useState } from "react";
// import SectionHeading from "@/components/Common/SectionHeading";
import ProductCard from "@/components/Common/ProductCard";
import { HiArrowLongRight } from "react-icons/hi2";

// Hardcoded PRODUCTS removed

export default function BestSellers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await fetch("/api/products?limit=8&sort=newest");
        const data = await res.json();
        if (data.success) {
          // Normalize data for ProductCard if needed
          const mappedProducts = data.products.map((p) => ({
            ...p,
            id: p._id, // Ensure ID mapping if Card expects id
            image: p.images?.[0]?.url || "/images/placeholder.png",
            price: p.minPrice || 0,
          }));
          setProducts(mappedProducts);
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 relative">
        {/* <SectionHeading subheading="ORGANIC FOODS" heading="Best Sellers" /> */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold italic text-primary uppercase tracking-wide">
            Live Microbial Starters
          </h2>
        </div>

        <div className="max-w-7xl mx-auto relative px-4 md:px-8 mt-10">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pb-12">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
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

          <div className="flex group justify-center items-center">
            <a
              href="/collections"
              className="underline justify-center flex underline-offset-4 decoration-2 w-full mt-4 text-primary hover:text-secondary font-bold"
            >
              View All Products
              <HiArrowLongRight
                size={20}
                className="ml-2 group-hover:translate-x-2 transition-all duration-300"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
