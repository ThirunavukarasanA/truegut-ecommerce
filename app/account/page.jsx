"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Home/Navbar";
import Footer from "@/components/Home/Footer";

export default function AccountPage() {
     const { user, logout, loading } = useAuth();
     const router = useRouter();

     useEffect(() => {
          if (!loading && !user) {
               router.push("/login");
          }
     }, [user, loading, router]);

     if (loading || !user) {
          return (
               <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
               </div>
          );
     }

     return (
          <div className="min-h-screen flex flex-col font-sans bg-gray-50">
               <Navbar />
               <main className="flex-1 max-w-7xl mx-auto px-4 py-20 w-full">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                         <div>
                              <h1 className="text-3xl font-bold text-font-title">My Account</h1>
                              <p className="text-gray-500">Welcome back, {user.name || user.email}</p>
                         </div>
                         <button
                              onClick={logout}
                              className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:text-red-500 hover:border-red-500 transition-colors"
                         >
                              Log Out
                         </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                         {/* Orders Section */}
                         <div className="lg:col-span-2 space-y-8">
                              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                                   <h2 className="text-xl font-bold text-font-title mb-6">Order History</h2>
                                   <div className="text-center py-12 text-gray-400">
                                        <p>No orders yet.</p>
                                        <p className="text-sm mt-2">Start shopping to see your orders here.</p>
                                   </div>
                              </div>
                         </div>

                         {/* Address / Profile Section */}
                         <div className="space-y-8">
                              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                                   <h2 className="text-xl font-bold text-font-title mb-6">Account Details</h2>
                                   <div className="space-y-2 text-gray-600">
                                        <p className="font-bold text-gray-800">{user.name}</p>
                                        <p>{user.email}</p>
                                        <p className="text-sm text-gray-400 mt-4">Addresses will appear here once you checkout.</p>
                                   </div>
                              </div>
                         </div>
                    </div>
               </main>
               <Footer />
          </div>
     );
}
