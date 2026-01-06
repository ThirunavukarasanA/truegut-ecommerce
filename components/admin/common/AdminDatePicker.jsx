"use client";

export default function AdminDatePicker({ label, error, icon: Icon, className = "", ...props }) {
     return (
          <div className={`flex flex-col gap-2 ${className}`}>
               {label && (
                    <label className="text-xs font-light text-gray-400 ml-1">
                         {label}
                    </label>
               )}
               <div className="relative">
                    {Icon && (
                         <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                              <Icon size={18} />
                         </div>
                    )}
                    <input
                         type="date"
                         {...props}
                         className={`w-full bg-white border border-gray-100 rounded-2xl py-3.5 px-5 outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all text-[13px] font-light text-gray-600 placeholder:font-light shadow-sm ${error ? "border-red-300 focus:border-red-400 focus:ring-red-50" : ""
                              } ${Icon ? "pl-12" : ""}`}
                    />
               </div>
               {error && <span className="text-[10px] font-light text-red-500 ml-1 uppercase tracking-widest">{error}</span>}
          </div>
     );
}
