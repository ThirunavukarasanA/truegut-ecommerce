"use client";
import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import Link from "next/link";

export default function WhatsAppButton() {
  return (
    <Link
      href="https://wa.me/919916452199" // Replace with actual number
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-6 md:bottom-10 md:right-10 z-40 bg-[#25D366] text-white p-4 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:scale-110 transition-transform duration-300 flex items-center justify-center group"
      aria-label="Chat on WhatsApp"
    >
      <FaWhatsapp size={32} />
      <span className="absolute right-full mr-3 bg-white text-gray-800 px-3 py-1 rounded-md text-sm font-medium shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block">
        Chat with us
      </span>
    </Link>
  );
}
