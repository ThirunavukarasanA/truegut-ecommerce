"use client";

export default function AdminCard({ children, className = "", noPadding = false }) {
     return (
          <div className={`bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden ${className}`}>
               <div className={noPadding ? "" : "p-6 md:p-8"}>
                    {children}
               </div>
          </div>
     );
}
