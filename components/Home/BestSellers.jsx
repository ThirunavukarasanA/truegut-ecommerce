"use client";
import React, { useRef } from "react";
import SectionHeading from "@/components/Common/SectionHeading";
import ProductCard from "@/components/Common/ProductCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const PRODUCTS = [
  {
    id: 1,
    name: "Honey Dill | 100% organic",
    description:
      "Lorem Ipsum has been the industry's standard dummy text Lorem Ipsum has been the industry's standard dummy text",
    price: 59.0,
    oldPrice: 130.0,
    image: "/images/product-honey.png",
  },
  {
    id: 2,
    name: "Milk kombucha 100% organic",
    description: "Lorem Ipsum has been the industry's standard dummy text",
    price: 59.0,
    oldPrice: 120.0,
    image: "/images/product-kombucha.png",
  },
  {
    id: 3,
    name: "Kimchi 100% organic",
    description: "Lorem Ipsum has been the industry's standard dummy text",
    price: 59.0,
    oldPrice: 120.0,
    image: "/images/product-kimchi-1.png",
  },
  {
    id: 4,
    name: "Kimchi 100% organic",
    description: "Lorem Ipsum has been the industry's standard dummy text",
    price: 59.0,
    oldPrice: 120.0,
    image: "/images/product-kimchi-2.png",
  },
  {
    id: 5,
    name: "Milk Kefir Grains",
    description: "Lorem Ipsum has been the industry's standard dummy text",
    price: 59.0,
    oldPrice: 120.0,
    image: "/images/milk-kefir-grains.jpg",
  },
  {
    id: 6,
    name: "Kimchi 100% organic",
    description: "Lorem Ipsum has been the industry's standard dummy text",
    price: 59.0,
    oldPrice: 120.0,
    image: "/images/product-kimchi-1.png",
  },
  {
    id: 7,
    name: "Kimchi 100% organic",
    description: "Lorem Ipsum has been the industry's standard dummy text",
    price: 59.0,
    oldPrice: 120.0,
    image: "/images/product-kimchi-2.png",
  },
];

export default function BestSellers() {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

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
                return '<span class="' + className + ' transition-all duration-300"></span>';
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
            {PRODUCTS.map((product) => (
              <SwiperSlide key={product.id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
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
        </div>
      </div>
    </section>
  );
}
