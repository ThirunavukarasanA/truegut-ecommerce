"use client";

import { MdSearch, MdClose } from "react-icons/md";

export default function AdminSearch({ value, onChange, placeholder = "Search...", className = "" }) {
     return (
          <div className={`relative group ${className}`}>
               <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors pointer-events-none">
                    <MdSearch size={20} />
               </div>
               <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-10 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:border-gray-300"
               />
               {value && (
                    <button
                         onClick={() => onChange("")}
                         className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-all"
                         title="Clear search"
                    >
                         <MdClose size={16} />
                    </button>
               )}
          </div>
     );
}
