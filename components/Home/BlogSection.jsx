"use client";
import React, { useRef } from "react";
import SectionHeading from "@/components/Common/SectionHeading";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const BLOGS = [
  {
    id: 1,
    title: "Green onion knife and salad placed",
    description:
      "Lorem Ipsum is simply dummy text of the printing industry. Lorem Ipsum daler...",
    date: "AUG-2023",
    image: "/images/blog-salad.png",
  },
  {
    id: 2,
    title: "Fresh organic brand and picnic",
    description:
      "Lorem Ipsum is simply dummy text of the printing industry. Lorem Ipsum daler...",
    date: "SEP-2023",
    image: "/images/blog-veg.png",
  },
  {
    id: 3,
    title: "Health and skin for your organic",
    description:
      "Lorem Ipsum is simply dummy text of the printing industry. Lorem Ipsum daler...",
    date: "OCT-2023",
    image: "/images/blog-nuts.png",
  },
  {
    id: 4,
    title: "Fresh organic brand and picnic",
    description:
      "Lorem Ipsum is simply dummy text of the printing industry. Lorem Ipsum daler...",
    date: "SEP-2023",
    image: "/images/blog-veg.png",
  },
];

export default function BlogSection() {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    <section className="py-20 group/slider relative">
      <div className="max-w-7xl mx-auto px-4 relative">
        <SectionHeading
          subheading="ARTICLES AND NEWS"
          heading="Updated story"
        />

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
              1024: {
                slidesPerView: 3,
              },
            }}
            className="pb-16!"
          >
            {BLOGS.map((blog) => (
              <SwiperSlide key={blog.id}>
                <div className="group cursor-pointer bg-white shadow-xl pb-10 rounded-4xl">
                  <div className="relative p-3 aspect-4/3 w-full overflow-hidden mb-6">
                    <Image
                      src={blog.image}
                      alt={blog.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110 group-hover:rounded-4xl hover:rounded-4xl rounded-4xl"
                    />
                    <div className="absolute rounded-2xl top-4 left-4 bg-white text-font-title text-[10px] font-bold px-3 py-1 uppercase tracking-wider">
                      {blog.date}
                    </div>
                  </div>

                  <div className="text-center px-4">
                    <h3 className="text-base font-bold text-font-title mb-3 group-hover:text-secondary transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed mb-4">
                      {blog.description}
                    </p>
                    <Link
                      href={`/blog/${blog.id}`}
                      className="text-primary text-xs font-bold border-b border-primary/30 pb-1 hover:text-secondary hover:border-secondary transition-colors inline-block uppercase"
                    >
                      READ MORE
                    </Link>
                  </div>
                </div>
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
