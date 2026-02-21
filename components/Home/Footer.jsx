import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaGoogle,
  FaEnvelope,
} from "react-icons/fa";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-bg-color pt-16 pb-8 border-t border-white">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        {/* Brand */}
        <div className="space-y-6">
          <h3 className="font-bold text-primary text-xl">
            True<span className="text-secondary">gut</span>
          </h3>
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
          <h4 className="font-bold text-primary text-sm mb-6">Categories</h4>
          <ul className="space-y-4 text-gray-500 text-sm">
            <li className="hover:text-secondary cursor-pointer transition-colors">
              kefir
            </li>
            <li className="hover:text-secondary cursor-pointer transition-colors">
              Kombucha
            </li>
            <li className="hover:text-secondary cursor-pointer transition-colors">
              Kimchi
            </li>
          </ul>
        </div>

        {/* Account */}
        <div>
          <h4 className="font-bold text-primary text-sm mb-6">Account</h4>
          <ul className="space-y-4 text-gray-500 text-sm">
            <li className="hover:text-secondary cursor-pointer transition-colors">
              My cart
            </li>
            {/* <li className="hover:text-secondary cursor-pointer transition-colors">
              Wishlist
            </li> */}
            <li className="hover:text-secondary cursor-pointer transition-colors">
              <Link href="/login">Sign in</Link>
            </li>
            <li className="hover:text-secondary cursor-pointer transition-colors">
              Shipping details
            </li>
            <li className="hover:text-secondary cursor-pointer transition-colors">
              Help center
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-primary text-sm mb-6">Quick Links</h4>
          <ul className="space-y-4 text-gray-500 text-sm">
            <li className="hover:text-secondary cursor-pointer transition-colors">
              <Link href="/about">About Us</Link>
            </li>
            <li className="hover:text-secondary cursor-pointer transition-colors">
              <Link href="/contact">Contact</Link>
            </li>
            <li className="hover:text-secondary cursor-pointer transition-colors">
              <Link href="/blogs">Blog</Link>
            </li>
            <li className="hover:text-secondary cursor-pointer transition-colors">
              <Link href="/privacy-policy">Privacy Policy</Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-gray-400 text-xs">
          Copyright © 2025 by TrueGut. All rights reserved.
        </p>
        <Link
          href="/privacy-policy"
          className="text-gray-400 text-xs hover:text-secondary transition-colors"
        >
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
