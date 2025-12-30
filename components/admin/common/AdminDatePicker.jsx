"use client";

export default function AdminDatePicker({ label, error, className = "", ...props }) {
     return (
          <div className={`flex flex-col gap-2 ${className}`}>
               {label && (
                    <label className="text-xs font-light text-gray-400 ml-1">
                         {label}
                    </label>
               )}
               <input
                    type="date"
                    {...props}
                    className={`w-full bg-white border border-gray-100 rounded-xl py-3 px-4 outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-50 transition-all text-sm font-normal text-gray-600 ${error ? "border-red-300 focus:border-red-400 focus:ring-red-50" : ""
                         }`}
               />
               {error && <span className="text-[10px] font-light text-red-500 ml-1">{error}</span>}
          </div>
     );
}
