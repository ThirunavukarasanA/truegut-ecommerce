"use client";
import React, { useEffect, useRef, useState } from "react";
// import SectionHeading from "@/components/Common/SectionHeading";
import ProductCard from "@/components/Common/ProductCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { HiArrowLongRight } from "react-icons/hi2";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
// import { BiArrowFromLeft, BiArrowToLeft } from "react-icons/bi";
// import { FaArrowRight } from "react-icons/fa";
// import { FaArrowRightLong } from "react-icons/fa6";

// Hardcoded PRODUCTS removed

export default function BestSellers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

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
    <section className="py-20 group/slider relative">
      <div className="max-w-7xl mx-auto px-4 relative">
        {/* <SectionHeading subheading="ORGANIC FOODS" heading="Best Sellers" /> */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold italic text-primary uppercase tracking-wide">
            Live Microbial Starters
          </h2>
        </div>

        <div className="max-w-7xl mx-auto relative px-8 md:px-12 mt-10">
          {/* Custom Navigation Arrows */}
          <button
            ref={prevRef}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-secondary text-white rounded-md shadow-lg opacity-80 hover:opacity-100 transition-opacity disabled:opacity-30"
          >
            <FiChevronLeft size={24} />
          </button>
          <button
            ref={nextRef}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-secondary text-white rounded-md shadow-lg opacity-80 hover:opacity-100 transition-opacity disabled:opacity-30"
          >
            <FiChevronRight size={24} />
          </button>

          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            pagination={{
              clickable: true,
              renderBullet: function (index, className) {
                return (
                  '<span class="' +
                  className +
                  ' transition-all duration-300"></span>'
                );
              },
            }}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            className="pb-16!"
          >
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : products.length > 0 ? (
              <>
                {products.map((product) => (
                  <SwiperSlide key={product.id}>
                    <ProductCard product={product} />
                  </SwiperSlide>
                ))}
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search query to find what you're looking
                  for.
                </p>
              </div>
            )}
          </Swiper>

          <style jsx global>{`
            .swiper-pagination-bullet {
              width: 8px;
              height: 8px;
              background: #d1d5db; /* gray-300 */
              opacity: 1;
              border-radius: 9999px;
              transition: all 0.3s ease;
            }
            .swiper-pagination-bullet-active {
              width: 24px;
              background-color: var(--color-secondary, #ea580c);
              border-radius: 9999px;
            }
          `}</style>
          <div className="flex group justify-center items-center ">
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
