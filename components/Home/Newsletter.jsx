import React from "react";
import { FiSend } from "react-icons/fi";

export default function Newsletter() {
  return (
    <section className="py-20 md:px px-6">
      <div className="bg-primary py-16 border overflow-hidden max-w-7xl mx-auto rounded-4xl px-5">
        <div className="relative">
          {/* Decorative elements */}
          <div className="absolute top-0 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-0 right-10 w-32 h-32 bg-secondary/20 rounded-full blur-xl"></div>

          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Subscribe and 20% off
              </h2>
              <p className="text-white/80 text-sm hidden md:block">
                Join our newsletter and get updates on new arrivals and special
                offers.
              </p>
            </div>

            <div className="flex-1 w-full max-w-lg">
              <form className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="example.jpg@mail.com"
                  className="flex-1 bg-white items-center py-3.5 px-6 text-sm text-gray-700 outline-none rounded-sm border-none placeholder:text-gray-300"
                />
                <button className="bg-secondary border border-white/20 text-white font-bold text-xs px-8 py-3.5 uppercase tracking-wider hover:bg-white hover:text-primary transition-colors rounded-sm">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
