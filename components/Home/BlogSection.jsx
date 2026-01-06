"use client";
import React, { useRef } from "react";
import SectionHeading from "@/components/Common/SectionHeading";
import Image from "next/image";
import Link from "next/link";
import { FaCalendarAlt, FaUser } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { HiArrowLongRight } from "react-icons/hi2";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const BLOGS = [
  {
    id: 1,
    title: "The Magic of Fermentation: Why Your Gut Loves It",
    excerpt:
      "Discover the ancient secret to better digestion and a stronger immune system trough natural probiotics.",
    category: "Health & Wellness",
    date: "Oct 12, 2024",
    author: "Dr. Sarah Roots",
    image: "/images/blog-salad.png", // Placeholder
  },
  {
    id: 2,
    title: "Kimchi vs. Sauerkraut: What's the Difference?",
    excerpt:
      "A deep dive into the two most popular fermented cabbage dishes and which one might be right for your palate.",
    category: "Food Culture",
    date: "Sep 28, 2024",
    author: "Chef Mike Ferment",
    image: "/images/blog-veg.png", // Placeholder
  },
  {
    id: 3,
    title: "5 Simple Ways to Incorporate Probiotics Daily",
    excerpt:
      "You don't need supplements. Here are easy (and delicious) ways to boost your gut health with real food.",
    category: "Lifestyle",
    date: "Sep 15, 2024",
    author: "Lisa Green",
    image: "/images/blog-nuts.png", // Placeholder
  },
  {
    id: 4,
    title: "The History of Kombucha",
    excerpt:
      "Tracing the roots of the 'Tea of Immortality' from ancient China to your local grocery store shelf.",
    category: "History",
    date: "Aug 30, 2024",
    author: "History Buff",
    image: "/images/blog-veg.png", // Placeholder
  },
  {
    id: 5,
    title: "DIY Fermentation: Beginner's Guide",
    excerpt:
      "Ready to start your own bubbling jar of goodness? Here are the essential tools and tips you need.",
    category: "DIY",
    date: "Aug 10, 2024",
    author: "Fermentaa Team",
    image: "/images/blog-salad.png", // Placeholder
  },
  {
    id: 6,
    title: "Beyond the Gut: Fermented Foods and Mental Health",
    excerpt:
      "Exploring the fascinating gut-brain connection and how what you eat affects your mood.",
    category: "Science",
    date: "Jul 22, 2024",
    author: "Neurosci Daily",
    image: "/images/blog-veg.png", // Placeholder
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
              1024: {
                slidesPerView: 3,
              },
            }}
            className="pb-16!"
          >
            {BLOGS.map((blog) => (
              <SwiperSlide key={blog.id}>
                <article className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                  {/* Image Container */}
                  <div className="relative aspect-4/3 overflow-hidden bg-gray-100">
                    <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-secondary uppercase tracking-wider">
                      {blog.category}
                    </div>
                    {/* Placeholder for Image */}
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 group-hover:scale-105 transition-transform duration-700">
                      <span className="text-sm">Image Placeholder</span>
                    </div>

                    <Image
                      src={blog.image}
                      alt={blog.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6 md:p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-4 font-medium">
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt /> {blog.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaUser /> {blog.author}
                      </span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-font-title mb-3 group-hover:text-secondary transition-colors line-clamp-2">
                      <Link
                        href={`/blogs/${blog.id}`}
                        className="inset-0 focus:outline-none"
                      >
                        {blog.title}
                      </Link>
                    </h3>

                    <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                      {blog.excerpt}
                    </p>

                    <div className="mt-auto pt-6 border-t border-gray-50">
                      <Link
                        href={`/blogs/${blog.id}`} // Assuming generic route for now
                        className="text-secondary font-bold text-sm uppercase tracking-wider hover:underline"
                      >
                        Read Full Article
                      </Link>
                    </div>
                  </div>
                </article>
              </SwiperSlide>
            ))}
            {/* {BLOGS.map((blog) => (
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
            ))} */}
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
              href="/blogs"
              className="underline justify-center flex underline-offset-4 decoration-2 w-full mt-4 text-primary hover:text-secondary font-bold"
            >
              View All Blogs
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
