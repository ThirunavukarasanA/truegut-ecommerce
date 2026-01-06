import React from "react";

export default function Newsletter() {
  return (
    <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto font-sans">
      <div className="bg-[#02332a] rounded-4xl md:rounded-[3rem] p-8 md:p-16 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12 shadow-2xl">
        {/* Glow Effects */}
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-[#EF5A21]/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-80 h-80 bg-white/5 blur-[100px] rounded-full pointer-events-none"></div>

        {/* Text Content */}
        <div className="relative z-10 w-full lg:max-w-xl text-center lg:text-left space-y-4">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Subscribe and 20% off
          </h2>
          <p className="text-white/80 text-base md:text-lg font-light max-w-md mx-auto lg:mx-0">
            Join our newsletter and get updates on new arrivals and special
            offers.
          </p>
        </div>

        {/* Form */}
        <div className="relative z-10 w-full lg:max-w-xl">
          <form className="flex flex-col sm:flex-row gap-4 w-full">
            <input
              type="email"
              placeholder="example.jpg@mail.com"
              className="flex-1 bg-white text-gray-800 px-6 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF5A21]/50 shadow-lg placeholder:text-gray-400 transition-all w-full"
              required
            />
            <button
              type="submit"
              className="bg-[#EF5A21] text-white font-bold px-10 py-4 rounded-lg uppercase tracking-wider hover:bg-[#d84e1a] transition-all transform hover:scale-105 shadow-xl shadow-orange-900/20 whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
