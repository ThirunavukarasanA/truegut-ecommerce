"use client";

import React, { useRef } from "react";
import SectionHeading from "@/components/Common/SectionHeading";
import { FaQuoteLeft, FaQuoteRight } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

const REVIEWS = [
  {
    id: 1,
    name: "Smita Jaiswal",
    role: "User review",
    text: "Organic food, ecological food or biological food are food and drinks produced by methods standards of organic.",
    avatarColor: "bg-blue-200",
  },
  {
    id: 2,
    name: "Manosh John",
    role: "User review",
    text: "Organic farming features positions that cycle resources, promote ecological is a balance, and conserve biodiversity.",
    avatarColor: "bg-orange-200",
  },
  {
    id: 3,
    name: "Smita Jaiswal",
    role: "User review",
    text: "Organic food, ecological food or biological food are food and drinks produced by methods standards of organic.",
    avatarColor: "bg-blue-200",
  },
  {
    id: 4,
    name: "Manosh John",
    role: "User review",
    text: "Organic farming features positions that cycle resources, promote ecological is a balance, and conserve biodiversity.",
    avatarColor: "bg-orange-200",
  },
];

export default function Testimonials() {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    <section className="py-20 bg-bg-color/30 relative">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeading
          subheading="HAPPY CUSTOMERS"
          heading="Our testimonials"
        />

        <div className="max-w-5xl mx-auto relative px-8">
          {/* Custom Navigation Arrows */}
          <button
            ref={prevRef}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-primary text-white rounded-md shadow-lg opacity-80 hover:opacity-100 transition-opacity disabled:opacity-30"
          >
            &lt;
          </button>
          <button
            ref={nextRef}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-secondary text-white rounded-md shadow-lg opacity-80 hover:opacity-100 transition-opacity disabled:opacity-30"
          >
            &gt;
          </button>

          <Swiper
            modules={[Autoplay, Navigation]}
            spaceBetween={30}
            slidesPerView={1}
            loop={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            breakpoints={{
              768: {
                slidesPerView: 2,
              },
            }}
            className="pb-10"
          >
            {REVIEWS.map((review) => (
              <SwiperSlide key={review.id}>
                <div className="relative text-center p-8 bg-transparent group h-full flex flex-col justify-center">
                  <div className="flex justify-center mb-6">
                    <div
                      className={`w-20 h-20 rounded-full ${review.avatarColor} grayscale border-4 border-white shadow-sm overflow-hidden`}
                    >
                      {/* Placeholder for avatar */}
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white/50">
                        {review.name.charAt(0)}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-500 text-sm leading-7 mb-6 italic relative px-4 text-center">
                    "{review.text}"
                  </p>

                  <div className="flex justify-center items-center gap-2 mb-2">
                    <FaQuoteLeft className="text-secondary text-2xl opacity-80" />
                    <div className="text-center">
                      <h4 className="font-bold text-font-title text-sm">
                        {review.name}
                      </h4>
                      <span className="text-primary text-xs font-bold text-opacity-80">
                        ({review.role})
                      </span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
