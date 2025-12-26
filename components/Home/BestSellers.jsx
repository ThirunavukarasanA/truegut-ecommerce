"use client";
import React from "react";
import SectionHeading from "@/components/Common/SectionHeading";
import ProductCard from "@/components/Common/ProductCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

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
  return (
    <section className="py-20 bg-white group/slider relative">
      <div className="container mx-auto px-4 relative">
        <SectionHeading subheading="ORGANIC FOODS" heading="Best Sellers" />

        <div className="relative mt-10">
          <Swiper
            modules={[Navigation]}
            spaceBetween={30}
            slidesPerView={1}
            navigation={{
              nextEl: ".swiper-button-next-custom",
              prevEl: ".swiper-button-prev-custom",
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 4,
              },
            }}
            className="!pb-10"
          >
            {PRODUCTS.map((product) => (
              <SwiperSlide key={product.id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Buttons - Show on Group Hover */}
          <button className="swiper-button-prev-custom absolute -left-4 top-1/2 -translate-y-1/2 -translate-x-1/2 lg:-translate-x-full z-10 w-10 h-10 flex items-center justify-center hover:text-white hover:bg-primary duration-300 group-hover/slider:opacity-100 cursor-pointer bg-secondary text-white rounded-md shadow-lg opacity-80 hover:opacity-100 transition-opacity disabled:opacity-30">
            <FiChevronLeft size={24} />
          </button>
          <button className="swiper-button-next-custom absolute -right-4 top-1/2 -translate-y-1/2 translate-x-1/2 lg:translate-x-full z-10 w-10 h-10 flex items-center justify-center hover:text-white hover:bg-primary duration-300 group-hover/slider:opacity-100 cursor-pointer bg-secondary text-white rounded-md shadow-lg opacity-80 hover:opacity-100 transition-opacity disabled:opacity-30">
            <FiChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
}
