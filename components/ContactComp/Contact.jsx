"use client";
import React from "react";
import Link from "next/link";
import {
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdAccessTime,
  MdSend,
} from "react-icons/md";
import Navbar from "@/components/Home/Navbar";
import MobileBottomNav from "@/components/Home/MobileBottomNav";
import Footer from "@/components/Home/Footer";

export default function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handler for form submission would go here
    alert("Thanks for contacting us! We'll get back to you soon.");
  };

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 w-full pt-20">
        {/* Simple Hero */}
        <div className="bg-[#023120] py-20 px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-gray-300 max-w-xl mx-auto text-lg font-light">
            Have questions about our products or just want to say hello? We'd
            loved to hear from you.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <div className="space-y-10">
              <div>
                <h4 className="text-secondary font-bold tracking-widest uppercase text-sm mb-2">
                  Contact Us
                </h4>
                <h2 className="text-3xl md:text-4xl font-bold text-font-title mb-6">
                  We're here to help
                </h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Whether you're curious about our fermentation process, need
                  help with an order, or want to partner with us, reach out!
                </p>
              </div>

              <div className="space-y-6">
                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 shrink-0">
                    <MdLocationOn size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-font-title mb-1">Visit Us</h3>
                    <p className="text-gray-600">
                      123 Fermentaa Lane, <br />
                      Organic Valley, CA 90210
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                    <MdEmail size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-font-title mb-1">Email Us</h3>
                    <p className="text-gray-600">hello@fermentaa.com</p>
                    <p className="text-gray-500 text-sm">
                      We reply within 24 hours.
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 shrink-0">
                    <MdPhone size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-font-title mb-1">Call Us</h3>
                    <p className="text-gray-600">+91 98765 43210</p>
                    <p className="text-gray-500 text-sm">
                      Mon-Fri, 9am - 6pm EST
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gray-50 p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">
                      Name
                    </label>
                    <input
                      type="text"
                      placeholder="Your Name"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all font-medium"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="How can we help?"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all font-medium"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us more..."
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all font-medium"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-secondary text-white font-bold py-4 rounded-xl hover:bg-[#3d7a30] transition-transform active:scale-[0.98] shadow-lg shadow-secondary/20 flex items-center justify-center gap-2"
                >
                  Send Message <MdSend />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="h-[400px] w-full bg-gray-200 relative grayscale hover:grayscale-0 transition-all duration-700">
          {/* Integrate Google Maps Embed Here */}
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <span className="bg-white/80 px-6 py-3 rounded-full shadow-sm backdrop-blur-sm">
              Map Location Placeholder
            </span>
          </div>
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
