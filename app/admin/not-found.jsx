"use client";

import Link from "next/link";
import { MdErrorOutline, MdArrowBack, MdDashboard } from "react-icons/md";

export default function AdminNotFound() {
     return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-3xl"></div>
                    <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-bg-color blur-3xl"></div>
                    <div className="absolute -bottom-[10%] left-[20%] w-[35%] h-[35%] rounded-full bg-secondary/10 blur-3xl"></div>
               </div>

               <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-12 text-center animate-in fade-in zoom-in duration-700 relative z-10">
                    <div className="w-24 h-24 bg-bg-color rounded-[2rem] flex items-center justify-center text-primary mx-auto mb-8 shadow-sm border border-gray-100 rotate-12">
                         <MdErrorOutline size={48} />
                    </div>

                    <h1 className="text-6xl font-black text-gray-900 tracking-tighter mb-4">404</h1>
                    <h2 className="text-3xl font-bold text-gray-900 mt-6">Page Not Found</h2>
                    <p className="text-gray-500 mt-2 font-light">The page you are looking for does not exist or has been moved.</p>

                    <Link
                         href="/admin/dashboard"
                         className="mt-8 px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-gray-200 hover:bg-secondary active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                         <MdDashboard size={20} />
                         Back to Dashboard
                    </Link>

                    <button
                         onClick={() => window.history.back()}
                         className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-primary transition-colors flex items-center justify-center gap-2 w-full"
                    >
                         <MdArrowBack /> Go Back
                    </button>
               </div>
          </div>
     );
}
