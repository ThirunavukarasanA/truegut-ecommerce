"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Home/Navbar";
import Footer from "@/components/Home/Footer";
import OrderHistory from "@/components/Account/OrderHistory";
import AccountDetails from "@/components/Account/AccountDetails";
import { useAccountData } from "@/hooks/useAccountData";

export default function AccountPage() {
     const { user, logout, loading: authLoading } = useAuth();
     const router = useRouter();

     // Safety fallback to prevent stuck loader in edge cases
     const [isAuthTimeout, setIsAuthTimeout] = React.useState(false);

     // Custom hook to manage account data (orders, etc.)
     const { orders, loading: ordersLoading } = useAccountData(user);

     useEffect(() => {
          const timer = setTimeout(() => {
               if (authLoading) setIsAuthTimeout(true);
          }, 5000); // 5 second timeout
          return () => clearTimeout(timer);
     }, [authLoading]);

     // Fix: Redirect to login if user is not authenticated after loading
     useEffect(() => {
          if ((!authLoading || isAuthTimeout) && !user) {
               router.replace("/login"); // Use replace for auth redirects
          }
     }, [user, authLoading, router, isAuthTimeout]);

     // While checking auth, show premium loader (unless timeout hit)
     if (authLoading && !isAuthTimeout) {
          return (
               <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="flex flex-col items-center gap-4">
                         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2 border-primary/30"></div>
                         <p className="text-gray-400 font-medium animate-pulse text-sm">Verifying your identity...</p>
                    </div>
               </div>
          );
     }

     // If redirected (or not authenticated), prevent flickering of account page
     if (!user) {
          return null;
     }

     return (
          <div className="min-h-screen flex flex-col font-sans bg-gray-50/50">
               <Navbar />

               <main className="flex-1 max-w-7xl mx-auto px-4 py-20 w-full animate-fadeIn">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 pt-10 border-b border-gray-100 pb-10">
                         <div className="space-y-2">
                              <h1 className="text-4xl md:text-5xl font-black text-font-title tracking-tight italic">My Account</h1>
                              <p className="text-gray-400 font-medium text-lg flex items-center gap-2">
                                   Welcome back, <span className="text-primary font-bold">{user.name?.split(' ')[0] || user.email.split('@')[0]}</span>
                                   <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                              </p>
                         </div>
                         <button
                              onClick={logout}
                              className="px-8 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50/30 transition-all shadow-sm active:scale-95 flex items-center gap-2 group"
                         >
                              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1h3a2 2 0 012 2v3a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h3a2 2 0 012 2v1" />
                              </svg>
                              Log Out
                         </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                         {/* Left/Middle Column: Order History */}
                         <div className="lg:col-span-2">
                              <OrderHistory
                                   orders={orders}
                                   loading={ordersLoading}
                              />
                         </div>

                         {/* Right Column: Profile & Details */}
                         <div className="lg:col-span-1">
                              <AccountDetails user={user} />
                         </div>
                    </div>
               </main>

               <Footer />

               <style jsx global>{`
                    @keyframes fadeIn {
                         from { opacity: 0; transform: translateY(10px); }
                         to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fadeIn {
                         animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }
               `}</style>
          </div>
     );
}
