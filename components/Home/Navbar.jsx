"use client";
import React, { useEffect, useState } from "react";
import {
  FiSearch,
  FiUser,
  FiHeart,
  FiShoppingBag,
  FiHeadphones,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { FaBagShopping } from "react-icons/fa6";
import Link from "next/link";
import { usePathname } from "next/navigation";
import TopBar from "./TopBar";
import MobileBottomNav from "./MobileBottomNav";
import { useCart } from "../../context/CartContext";
import { FaUserAlt } from "react-icons/fa";
import Image from "next/image";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "../../context/LocationContext";
import { FiMapPin } from "react-icons/fi";

export default function Navbar() {
  const [scrollPosition, setScrollPosition] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  useEffect(() => {
    isMobileMenuOpen
      ? (document.body.style.overflow = "hidden")
      : (document.body.style.overflow = "auto");

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobileMenuOpen]);
  const { openCart, cartItems } = useCart();
  const { user } = useAuth();
  const { pincode, openModal, isLocationSet, postOffice } = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const pathname = usePathname();
  const isActive = (path) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <div className="w-full relative">
      {/* <TopBar /> */}

      {/* Main Header */}
      <div
        className={`fixed w-full top-0 z-40 border-b border-gray-200 ${scrollPosition ? "shadow-lg bg-white/80 backdrop-blur" : "bg-white"
          }`}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center gap-4">
          {/* Logo */}
          <div className="text-2xl font-bold text-font-title flex-1 text-center md:text-left md:flex-none">
            <Link
              href="/"
              className="text-primary flex items-center space-x-3.5"
              aria-label="Home"
              title="Home"
            >
              <Image
                src="/logos/truegut.svg"
                alt="Logo"
                width={50}
                height={50}
              />
              True<span className="text-secondary">gut</span>
            </Link>
          </div>

          {/* Search Bar (Desktop) */}
          {/* <div className="hidden md:block flex-1 max-w-xl mx-auto w-full">
            <div className="relative">
              <input
                type="text"
                placeholder="Search our store"
                className="w-full border border-gray-200 rounded-sm py-2 px-4 pr-10 focus:outline-none focus:border-primary text-sm"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary">
                <FiSearch size={18} />
              </button>
            </div>
          </div> */}
          <div className="hidden md:block">
            <div className="container mx-auto px-4 h-12 flex justify-between items-center">
              {/* Menu Links */}
              <nav className="flex items-center gap-8 font-bold text-sm text-font-title tracking-wide">
                {[
                  { name: "HOME", path: "/" },
                  { name: "SHOP", path: "/collections" },
                  { name: "ABOUT US", path: "/about" },
                  { name: "BLOGS", path: "/blogs" },
                  { name: "CONTACT US", path: "/contact" },
                ].map((link) => (
                  <Link
                    key={link.name}
                    href={link.path}
                    className={`transition-colors ${isActive(link.path)
                      ? "text-secondary"
                      : "hover:text-primary"
                      }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* User Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-6 text-gray-600">
            {/* Pincode Display */}
            <button
              onClick={openModal}
              className="flex items-center gap-2 group hover:text-primary transition-all pr-4 border-r border-gray-200"
              title="Change Location"
            >
              <div className="w-9 h-9 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <FiMapPin size={18} />
              </div>
              <div className="flex flex-col items-start -space-y-1">
                <span className="text-[10px] font-bold text-gray-400 tracking-wider">DELIVER TO</span>
                <span className="text-sm font-bold text-font-title group-hover:text-primary">
                  {isLocationSet ? pincode : "Set Pincode"}
                </span>
              </div>
            </button>

            <Link
              href={user ? "/account" : "/login"}
              className="flex flex-col items-center gap-1 hover:text-primary transition-colors"
              title={user ? "My Account" : "Login"}
            >
              <FaUserAlt size={22} />
            </Link>
            {/* <Link
              href="/wishlist"
              className="flex flex-col items-center gap-1 relative hover:text-primary transition-colors"
            >
              <FiHeart size={22} />
              <span className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                0
              </span>
            </Link> */}
            <button
              onClick={openCart}
              className="flex flex-col items-center gap-1 bg-primary cursor-pointer relative text-white hover:text-secondary transition-colors rounded-full p-3"
            >
              <FaBagShopping size={22} />
              <span className="absolute top-0 -right-1 ring-2 ring-white bg-secondary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartItems.length}
              </span>
            </button>
          </div>

          {/* Mobile Cart Icon (Always visible) */}
          <div className="md:hidden">
            <button
              onClick={openCart}
              className="relative text-white bg-primary rounded-full p-3 cursor-pointer"
            >
              <FaBagShopping size={22} />
              <span className="absolute top-0 -right-1 ring-2 ring-white bg-secondary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartItems.length}
              </span>
            </button>
          </div>

          {/* Hamburger Menu (Mobile) */}
          <button
            className="md:hidden text-font-title hover:text-primary transition-colors"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Sidebar & Overlay */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-visibility duration-300 ${isMobileMenuOpen ? "visible" : "invisible"
          }`}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100" : "opacity-0"
            }`}
          onClick={toggleMobileMenu}
        ></div>

        {/* Sidebar Drawer */}
        <div
          className={`absolute top-0 right-0 w-3/4 max-w-[300px] h-full bg-white shadow-xl transition-transform duration-300 ease-in-out transform ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-bg-color">
              <div className="flex flex-col">
                <span className="font-bold text-lg text-font-title">Menu</span>
                {isLocationSet && (
                  <button
                    onClick={() => {
                      toggleMobileMenu();
                      openModal();
                    }}
                    className="flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
                  >
                    <FiMapPin size={12} />
                    Pincode: {pincode}
                  </button>
                )}
              </div>
              <button
                onClick={toggleMobileMenu}
                className="text-gray-500 hover:text-primary"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Sidebar Links */}
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="flex flex-col">
                {[
                  { name: "HOME", path: "/" },
                  { name: "SHOP", path: "/collections" },
                  { name: "ABOUT US", path: "/about" },
                  { name: "BLOGS", path: "/blogs" },
                  { name: "CONTACT US", path: "/contact" },
                ].map((link) => (
                  <Link
                    key={link.name}
                    href={link.path}
                    className={`px-6 py-3 font-medium border-l-4 transition-all ${isActive(link.path)
                      ? "text-primary bg-primary/5 border-primary"
                      : "text-gray-700 hover:bg-gray-50 hover:text-primary border-transparent hover:border-primary"
                      }`}
                    onClick={toggleMobileMenu}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Sidebar Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center gap-3 text-font-title text-sm font-medium mb-4">
                <div className="w-8 h-8 rounded-full border border-secondary flex items-center justify-center text-secondary bg-white">
                  <FiHeadphones />
                </div>
                <span>(+91) 0000 0000</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}
