import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaGoogle,
  FaEnvelope,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-bg-color pt-16 pb-8 border-t border-white">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        {/* Brand */}
        <div className="space-y-6">
          <h3 className="font-bold text-font-title text-xl">Company Logo</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            There are many variations of passages of Lorem Ipsum available, but
            the majority have suffered alteration in some.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:bg-primary hover:text-white transition-colors"
            >
              <FaFacebookF size={14} />
            </a>
            <a
              href="#"
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:bg-primary hover:text-white transition-colors"
            >
              <FaTwitter size={14} />
            </a>
            <a
              href="#"
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:bg-primary hover:text-white transition-colors"
            >
              <FaEnvelope size={14} />
            </a>
            <a
              href="#"
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:bg-primary hover:text-white transition-colors"
            >
              <FaInstagram size={14} />
            </a>
            <a
              href="#"
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:bg-primary hover:text-white transition-colors"
            >
              <FaGoogle size={14} />
            </a>
          </div>
        </div>

        {/* Categories */}
        <div className="md:pl-8">
          <h4 className="font-bold text-secondary text-sm mb-6">Categories</h4>
          <ul className="space-y-4 text-gray-500 text-sm">
            <li className="hover:text-primary cursor-pointer transition-colors">
              Kelif
            </li>
            <li className="hover:text-primary cursor-pointer transition-colors">
              Kombucha
            </li>
            <li className="hover:text-primary cursor-pointer transition-colors">
              Kimchi
            </li>
          </ul>
        </div>

        {/* Account */}
        <div>
          <h4 className="font-bold text-secondary text-sm mb-6">Account</h4>
          <ul className="space-y-4 text-gray-500 text-sm">
            <li className="hover:text-primary cursor-pointer transition-colors">
              My cart
            </li>
            <li className="hover:text-primary cursor-pointer transition-colors">
              Wishlist
            </li>
            <li className="hover:text-primary cursor-pointer transition-colors">
              Sign in
            </li>
            <li className="hover:text-primary cursor-pointer transition-colors">
              Shipping details
            </li>
            <li className="hover:text-primary cursor-pointer transition-colors">
              Help center
            </li>
          </ul>
        </div>

        {/* Blank/Placeholder for balance or extra Links */}
        <div>
          {/* Can add another column here if needed, or leave blank to match design's 4 columns where 4th might be empty or combined */}
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-200 pt-8 text-center">
        <p className="text-gray-400 text-xs">Copywrite © 2025 by TrueGut</p>
      </div>
    </footer>
  );
}
