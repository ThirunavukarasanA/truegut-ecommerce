"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdPerson, MdSettings, MdLock, MdLogout, MdKeyboardArrowDown } from "react-icons/md";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { adminFetchWithToast } from "@/lib/admin/adminFetch";

export default function AdminProfileDropdown() {
     const [isOpen, setIsOpen] = useState(false);
     const [loggingOut, setLoggingOut] = useState(false);
     const dropdownRef = useRef(null);
     const router = useRouter();

     useEffect(() => {
          const handleClickOutside = (event) => {
               if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                    setIsOpen(false);
               }
          };
          document.addEventListener("mousedown", handleClickOutside);
          return () => document.removeEventListener("mousedown", handleClickOutside);
     }, []);

     const menuItems = [
          { label: "Settings", icon: <MdSettings />, href: "/admin/settings" },
          { label: "Change Password", icon: <MdLock />, href: "/admin/settings?tab=Security" },
     ];

     const handleLogout = async () => {
          setLoggingOut(true);

          try {
               await adminFetchWithToast(
                    "/api/auth/logout",
                    { method: "POST" },
                    {
                         loading: "Signing out...",
                         success: "Logged out successfully",
                         error: "Logout failed"
                    },
                    toast
               );
               router.push("/admin");
          } catch (error) {
               console.error(error);
               setLoggingOut(false);
          }
     };

     return (
          <div className="relative" ref={dropdownRef}>
               <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-3 pl-6 border-l border-gray-100 hover:opacity-80 transition-all"
               >
                    <div className="text-right hidden md:block">
                         <p className="text-sm font-medium text-gray-700">Admin User</p>
                         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Super Admin</p>
                    </div>
                    <div className="relative">
                         <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 shadow-sm overflow-hidden">
                              <MdPerson size={24} />
                         </div>
                         <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-50 text-gray-400">
                              <MdKeyboardArrowDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                         </div>
                    </div>
               </button>

               <AnimatePresence>
                    {isOpen && (
                         <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              className="absolute right-0 mt-4 w-56 bg-white rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden z-100"
                         >
                              <div className="p-5 bg-gray-50/50 border-b border-gray-100">
                                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Account</p>
                                   <p className="text-sm font-semibold text-gray-800">admin@truegut.com</p>
                              </div>

                              <div className="p-2">
                                   {menuItems.map((item, index) => (
                                        <Link
                                             key={index}
                                             href={item.href}
                                             onClick={() => setIsOpen(false)}
                                             className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-primary transition-all group"
                                        >
                                             <span className="text-gray-400 group-hover:text-primary transition-colors">
                                                  {item.icon}
                                             </span>
                                             {item.label}
                                        </Link>
                                   ))}

                                   <div className="h-px bg-gray-100 my-2 mx-2"></div>

                                   <button
                                        onClick={handleLogout}
                                        disabled={loggingOut}
                                        className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all group w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                   >
                                        <span className="text-red-400 group-hover:text-red-500 transition-colors">
                                             <MdLogout />
                                        </span>
                                        {loggingOut ? "Logging out..." : "Log Out"}
                                   </button>
                              </div>
                         </motion.div>
                    )}
               </AnimatePresence>
          </div>
     );
}
