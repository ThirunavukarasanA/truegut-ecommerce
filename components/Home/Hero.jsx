"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const FALLBACK_SLIDES = [
  {
    _id: "1",
    image: { url: "/images/banners/banner3.jpg" },
    title: "Bio-Active Marketplace",
    link: "",
  },
];

export default function Hero() {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await fetch("/api/banners");
        const data = await res.json();
        if (data.success && data.banners.length > 0) {
          setSlides(data.banners);
        } else {
          setSlides(FALLBACK_SLIDES);
        }
      } catch (error) {
        console.error("Failed to fetch banners", error);
        setSlides(FALLBACK_SLIDES);
      } finally {
        setLoading(false);
      }
    }
    fetchBanners();
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // 5 seconds per slide

    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    if (slides.length <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    if (slides.length <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Touch handling for swipe
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null); // Reset touch end
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl md:rounded-4xl mx-auto mt-28 md:mt-32 relative overflow-hidden h-[300px] md:h-[500px] sm:h-[300px] flex items-center justify-center bg-gray-100 animate-pulse"></div>
    );
  }

  if (slides.length === 0) return null;

  return (
    <div
      className="w-full max-w-7xl md:rounded-4xl mx-auto mt-28 md:mt-32 relative overflow-hidden h-[200px] md:h-[500px] sm:h-[300px] flex items-center group bg-bg-color"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Carousel Container */}
      <div
        className="absolute inset-0 flex transition-transform duration-1000 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div
            key={slide._id}
            className="min-w-full h-full relative flex items-center"
          >
            {/* Conditional wrapper if link exists */}
            {slide.link ? (
              <Link
                href={slide.link}
                target={slide.target || "_self"}
                className="absolute inset-0 w-full h-full z-10 cursor-pointer"
              >
                <Image
                  src={slide.image?.url || slide.image}
                  alt={slide.altText || slide.title || "Banner"}
                  fill
                  className=""
                  priority={slide._id === slides[0]?._id}
                />
              </Link>
            ) : (
              <div className="absolute inset-0 w-full h-full z-0">
                <Image
                  src={slide.image?.url || slide.image}
                  alt={slide.altText || slide.title || "Banner"}
                  width={1920}
                  height={600}
                  className=" "
                  priority={slide._id === slides[0]?._id}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows (only show if multiple slides) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-secondary text-white items-center justify-center rounded-sm hover:bg-opacity-80 transition-all z-20 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 duration-300 hidden md:flex"
          >
            <FiChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-secondary text-white items-center justify-center rounded-sm hover:bg-opacity-80 transition-all z-20 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 duration-300 hidden md:flex"
          >
            <FiChevronRight size={20} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                  currentSlide === index ? "bg-secondary w-6" : "bg-white"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
