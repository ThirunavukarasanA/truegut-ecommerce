import React from "react";
import Link from "next/link";
import { FiHome, FiSearch, FiHeart, FiUser } from "react-icons/fi";

export default function MobileBottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden pb-safe">
      <div className="flex justify-around items-center h-16">
        <Link
          href="/"
          className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-primary active:text-primary transition-colors gap-1"
        >
          <FiHome size={22} />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <button className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-primary active:text-primary transition-colors gap-1">
          <FiSearch size={22} />
          <span className="text-[10px] font-medium">Search</span>
        </button>
        <Link
          href="/wishlist"
          className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-primary active:text-primary transition-colors gap-1 relative"
        >
          <div className="relative">
            <FiHeart size={22} />
            <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
              0
            </span>
          </div>
          <span className="text-[10px] font-medium">Wishlist</span>
        </Link>
        <Link
          href="/account"
          className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-primary active:text-primary transition-colors gap-1"
        >
          <FiUser size={22} />
          <span className="text-[10px] font-medium">Account</span>
        </Link>
      </div>
    </div>
  );
}
