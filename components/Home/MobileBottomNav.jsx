import React from "react";
import Link from "next/link";
import { BiStore, BiLineChart, BiShoppingBag, BiUser } from "react-icons/bi";
import { FaShippingFast, FaDna } from "react-icons/fa";
import { useCart } from "../../context/CartContext";

import { usePathname } from "next/navigation";

export default function MobileBottomNav() {
  const { openCart, cartItems } = useCart();
  const pathname = usePathname();

  const isActive = (path) => pathname.startsWith(path);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden pb-safe bg-transparent pointer-events-none">
      <div className="relative pointer-events-auto">
        {/* Curved Background Container */}
        <div className="bg-[#023120] rounded-t-[3rem] pb-safe pt-2 px-6 shadow-[0_-5px_15px_rgba(0,0,0,0.1)]">
          <div className="flex justify-between items-end h-16 w-full max-w-sm mx-auto pb-4 px-2">
            {/* Left Side */}
            <Link
              href="/collections"
              className={`flex flex-col items-center justify-center w-14 transition-colors gap-1 ${isActive("/collections")
                ? "text-secondary"
                : "text-white hover:text-secondary"
                }`}
            >
              <BiStore size={22} />
              <span className="text-[9px] font-bold uppercase tracking-wider">
                Shop
              </span>
            </Link>

            <Link
              href="/account"
              className={`flex flex-col items-center justify-center w-14 transition-colors gap-1 mr-4 ${isActive("/account")
                ? "text-secondary"
                : "text-gray-400 hover:text-white"
                }`}
            >
              <BiUser size={22} />
              <span className="text-[9px] font-bold uppercase tracking-wider">
                Account
              </span>
            </Link>

            {/* Center FAB (Absolutely Positioned) */}
            <div className="absolute left-1/2 -top-6 -translate-x-1/2">
              <div className="relative">
                {/* Cutout Effect Background */}
                <div className="absolute w-18 h-18 bg-white rounded-full -top-1 -left-1"></div>
                {/* Use Link or Button for the central action */}
                <Link
                  href="/dna-test"
                  className={`relative flex items-center justify-center w-16 h-16 rounded-full shadow-lg text-white hover:scale-105 transition-transform ${isActive("/dna-test")
                    ? "bg-secondary scale-105"
                    : "bg-secondary"
                    }`}
                >
                  <FaDna size={28} />
                </Link>
              </div>
            </div>

            {/* Right Side */}
            <Link
              href="/track"
              className={`flex flex-col items-center justify-center w-14 transition-colors gap-1 ml-4 ${isActive("/track")
                ? "text-secondary"
                : "text-gray-400 hover:text-white"
                }`}
            >
              <FaShippingFast size={22} />
              <span className="text-[9px] font-bold uppercase tracking-wider">
                Track
              </span>
            </Link>

            <Link
              href=""
              onClick={openCart}
              className="relative flex flex-col items-center justify-center w-14 text-white hover:text-secondary transition-colors gap-1"
            >
              <BiShoppingBag size={22} />
              <span className="text-[9px] font-bold uppercase tracking-wider">
                Bag
              </span>
              {cartItems.length > 0 && (
                <span className="absolute -top-1 right-2 bg-secondary text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-[#023120]">
                  {cartItems.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
