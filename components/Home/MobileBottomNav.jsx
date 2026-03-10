import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BiStoreAlt, BiHomeAlt2, BiUserCircle, BiShoppingBag } from "react-icons/bi";
import { FiHeadphones } from "react-icons/fi";
import { useCart } from "../../context/CartContext";

export default function MobileBottomNav() {
  const { openCart, cartItems } = useCart();
  const pathname = usePathname();

  const isActive = (path) => {
    if (path === "/") return pathname === "/";
    if (path === "#") return false;
    return pathname.startsWith(path);
  };

  const navItems = [
    { href: "/", icon: BiHomeAlt2, label: "Home", id: "home" },
    { href: "/collections", icon: BiStoreAlt, label: "Shop", id: "shop" },
    { href: "#", action: openCart, icon: BiShoppingBag, label: "Bag", id: "bag", isCenter: true },
    { href: "/contact", icon: FiHeadphones, label: "Contact", id: "contact" },
    { href: "/account", icon: BiUserCircle, label: "Profile", id: "profile" },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden w-[94%] max-w-lg pb-safe">
      <nav className="relative bg-[#023120]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] px-2 py-2 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] flex justify-around items-center overflow-visible">

        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          if (item.isCenter) {
            return (
              <div key={item.id} className="relative -top-6 w-16 flex flex-col items-center">
                <button
                  onClick={(e) => {
                    if (item.action) {
                      e.preventDefault();
                      item.action();
                    }
                  }}
                  className="relative flex items-center justify-center w-14 h-14 rounded-full shadow-[0_4px_20px_rgba(234,88,12,0.4)] transition-transform active:scale-95 bg-secondary border-[3px] border-[#023120] z-20"
                >
                  <Icon size={24} className="text-white relative z-10" />

                  {/* Badge for Central Action */}
                  {cartItems.length > 0 && item.id === "bag" && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-white text-secondary font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-lg border border-secondary z-30"
                    >
                      {cartItems.length}
                    </motion.span>
                  )}
                </button>
                <span className="absolute -bottom-5 text-[9px] font-black uppercase tracking-[0.15em] text-white/70">
                  {item.label}
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              className="flex flex-col items-center justify-center w-14 h-12 gap-1 relative z-10 transition-all active:scale-90"
            >
              {active && (
                <motion.div
                  layoutId="active-nav-pill"
                  className="absolute inset-0 bg-white/10 rounded-[1.25rem] -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon size={20} className={`transition-all duration-300 ${active ? "text-secondary scale-110" : "text-white/60"}`} />
              <span className={`text-[8px] font-black uppercase tracking-wider transition-all duration-300 ${active ? "text-white opacity-100" : "text-white/40"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <style jsx>{`
        .pb-safe {
          padding-bottom: calc(env(safe-area-inset-bottom) / 2);
        }
      `}</style>
    </div>
  );
}
