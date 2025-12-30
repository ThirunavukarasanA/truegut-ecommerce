"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FaCalendarAlt, FaUser } from "react-icons/fa";
import Navbar from "@/components/Home/Navbar";
import MobileBottomNav from "@/components/Home/MobileBottomNav";
import Footer from "@/components/Home/Footer";

const blogs = [
  {
    id: 1,
    title: "The Magic of Fermentation: Why Your Gut Loves It",
    excerpt:
      "Discover the ancient secret to better digestion and a stronger immune system trough natural probiotics.",
    category: "Health & Wellness",
    date: "Oct 12, 2024",
    author: "Dr. Sarah Roots",
    image: "/images/blog-1.jpg", // Placeholder
  },
  {
    id: 2,
    title: "Kimchi vs. Sauerkraut: What's the Difference?",
    excerpt:
      "A deep dive into the two most popular fermented cabbage dishes and which one might be right for your palate.",
    category: "Food Culture",
    date: "Sep 28, 2024",
    author: "Chef Mike Ferment",
    image: "/images/blog-2.jpg", // Placeholder
  },
  {
    id: 3,
    title: "5 Simple Ways to Incorporate Probiotics Daily",
    excerpt:
      "You don't need supplements. Here are easy (and delicious) ways to boost your gut health with real food.",
    category: "Lifestyle",
    date: "Sep 15, 2024",
    author: "Lisa Green",
    image: "/images/blog-3.jpg", // Placeholder
  },
  {
    id: 4,
    title: "The History of Kombucha",
    excerpt:
      "Tracing the roots of the 'Tea of Immortality' from ancient China to your local grocery store shelf.",
    category: "History",
    date: "Aug 30, 2024",
    author: "History Buff",
    image: "/images/blog-4.jpg", // Placeholder
  },
  {
    id: 5,
    title: "DIY Fermentation: Beginner's Guide",
    excerpt:
      "Ready to start your own bubbling jar of goodness? Here are the essential tools and tips you need.",
    category: "DIY",
    date: "Aug 10, 2024",
    author: "Fermentaa Team",
    image: "/images/blog-5.jpg", // Placeholder
  },
  {
    id: 6,
    title: "Beyond the Gut: Fermented Foods and Mental Health",
    excerpt:
      "Exploring the fascinating gut-brain connection and how what you eat affects your mood.",
    category: "Science",
    date: "Jul 22, 2024",
    author: "Neurosci Daily",
    image: "/images/blog-6.jpg", // Placeholder
  },
];

export default function Blogs() {
  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 w-full pt-20">
        {/* Header */}
        <div className="bg-[#f8f9fa] py-16 md:py-24 px-4 text-center border-b border-gray-100">
          <span className="text-secondary font-bold tracking-widest uppercase text-xs md:text-sm mb-4 block">
            Our Journal
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-font-title mb-6">
            Stories from the Jar
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed font-light">
            Insights, recipes, and science behind the world of fermentation and
            gut health.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {blogs.map((blog) => (
              <article
                key={blog.id}
                className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-secondary uppercase tracking-wider">
                    {blog.category}
                  </div>
                  {/* Placeholder for Image */}
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 group-hover:scale-105 transition-transform duration-700">
                    <span className="text-sm">Image Placeholder</span>
                  </div>
                  {/* 
                  <Image 
                    src={blog.image} 
                    alt={blog.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  */}
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
            ))}
          </div>

          {/* Pagination / Load More */}
          <div className="mt-20 text-center">
            <button className="px-8 py-4 bg-gray-50 text-gray-600 font-bold rounded-full hover:bg-secondary hover:text-white transition-all shadow-sm">
              Load More Articles
            </button>
          </div>
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
