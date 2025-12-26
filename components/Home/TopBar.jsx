import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaPinterestP,
  FaYoutube,
} from "react-icons/fa";

export default function TopBar() {
  return (
    <div className="bg-primary text-white py-2 text-xs md:text-sm">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2">
        {/* Social Icons */}
        <div className="flex items-center gap-4">
          <a href="#" className="hover:opacity-80 transition-opacity">
            <FaFacebookF />
          </a>
          <a href="#" className="hover:opacity-80 transition-opacity">
            <FaTwitter />
          </a>
          <a href="#" className="hover:opacity-80 transition-opacity">
            <FaInstagram />
          </a>
          <a href="#" className="hover:opacity-80 transition-opacity">
            <FaPinterestP />
          </a>
          <a href="#" className="hover:opacity-80 transition-opacity">
            <FaYoutube />
          </a>
        </div>

        {/* Center Promo */}
        <div className="text-center font-medium">
          Sign up and get 20% off for your first order
        </div>

        {/* Right Contact */}
        <div className="flex items-center gap-2">
          <a href="mailto:support@fermentaa.com" className="hover:underline">
            support@fermentaa.com
          </a>
        </div>
      </div>
    </div>
  );
}
