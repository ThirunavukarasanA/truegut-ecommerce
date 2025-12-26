"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const SLIDES = [
  {
    id: 1,
    image: "/images/banners/banner1.png",
    subheading: "Fresh & Healthy Food - 2025",
    heading: "ORGANIC",
    description:
      "Organic fermented foods without the use of synthetic chemicals, such as human-made pesticides.",
    buttonText: "Show Now",
  },
  {
    id: 2,
    image: "/images/banners/banner2.png",
    subheading: "Best Summer Offer",
    heading: "HEALTHY",
    description:
      "Get the best organic vegetables and fruits directly from the farm to your table.",
    buttonText: "Shop Deal",
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000); // 5 seconds per slide

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
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

  return (
    <div
      className="w-full relative overflow-hidden h-[500px] md:h-[650px] flex items-center group bg-bg-color"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Carousel Container */}
      <div
        className="absolute inset-0 flex transition-transform duration-1000 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {SLIDES.map((slide) => (
          <div
            key={slide.id}
            className="min-w-full h-full relative flex items-center"
          >
            {/* Background Image */}
            <div className="absolute inset-0 w-full h-full z-0">
              <Image
                src={slide.image}
                alt={slide.heading}
                fill
                className="object-cover object-center md:object-right" // Focus on center mobile, right on desktop if image has whitespace on left
                priority={slide.id === 1}
              />
            </div>

            {/* Content Overlay */}
            <div className="container mx-auto px-4 relative z-10 grid grid-cols-1 md:grid-cols-2 h-full items-center">
              <div className="max-w-lg space-y-4 md:space-y-6 pt-10 md:pt-0 text-center md:text-left flex flex-col items-center md:items-start">
                <h3 className="text-secondary font-bold tracking-wide text-xs md:text-base uppercase animate-fade-in-up">
                  {slide.subheading}
                </h3>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-font-title tracking-tight leading-tighter animate-fade-in-up delay-100">
                  {slide.heading}
                </h1>
                <p className="text-gray-600 text-sm md:text-lg leading-relaxed max-w-md mx-auto md:mx-0 animate-fade-in-up delay-200 lg:pr-10">
                  {slide.description}
                </p>
                <button className="bg-secondary hover:bg-primary text-white px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-opacity-90 transition-colors rounded-sm shadow-lg shadow-secondary/20 animate-fade-in-up">
                  {slide.buttonText}
                </button>
              </div>
              {/* Empty column for spacing against the image subject */}
              <div></div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-secondary text-white flex items-center justify-center rounded-sm hover:bg-opacity-80 transition-all z-20 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 duration-300 hidden md:flex"
      >
        <FiChevronLeft size={20} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-secondary text-white flex items-center justify-center rounded-sm hover:bg-opacity-80 transition-all z-20 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 duration-300 hidden md:flex"
      >
        <FiChevronRight size={20} />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              currentSlide === index ? "bg-primary w-6" : "bg-gray-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
