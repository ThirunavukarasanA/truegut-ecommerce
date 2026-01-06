"use client";

import { MdSearch } from "react-icons/md";

export default function AdminSearch({ value, onChange, placeholder = "Search...", className = "" }) {
     return (
          <div className={`relative ${className}`}>
               <MdSearch className="absolute left-4 top-3 text-gray-400 text-2xl" />
               <input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-white/80 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all text-[13px] font-light text-gray-600 shadow-sm placeholder:text-gray-300 placeholder:font-light placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest"
               />
          </div>
     );
}
