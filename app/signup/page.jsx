"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Home/Navbar";
import Footer from "@/components/Home/Footer";
import toast from "react-hot-toast";

export default function SignupPage() {
     const [formData, setFormData] = useState({
          name: "",
          email: "",
          password: "",
          confirmPassword: ""
     });
     const [loading, setLoading] = useState(false);
     const router = useRouter();

     const handleChange = (e) => {
          setFormData({ ...formData, [e.target.name]: e.target.value });
     };

     const handleSubmit = async (e) => {
          e.preventDefault();
          if (formData.password !== formData.confirmPassword) {
               return toast.error("Passwords do not match");
          }

          setLoading(true);
          try {
               const res = await fetch("/api/auth/customer/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                         name: formData.name,
                         email: formData.email,
                         password: formData.password
                    }),
               });
               const data = await res.json();

               if (res.ok) {
                    toast.success("Account created! Please log in.");
                    router.push("/login");
               } else {
                    toast.error(data.error || "Signup failed");
               }
          } catch (error) {
               toast.error("Something went wrong");
          } finally {
               setLoading(false);
          }
     };

     return (
          <div className="min-h-screen flex flex-col font-sans bg-gray-50">
               <Navbar />
               <main className="flex-1 flex items-center justify-center py-20 px-4">
                    <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg max-w-md w-full border border-gray-100">
                         <h1 className="text-3xl font-bold text-font-title mb-2 text-center">Create Account</h1>
                         <p className="text-gray-500 text-center mb-8">Join the TrueGut community</p>

                         <form onSubmit={handleSubmit} className="space-y-6">
                              <div>
                                   <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                   <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="John Doe"
                                   />
                              </div>
                              <div>
                                   <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                   <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="you@example.com"
                                   />
                              </div>
                              <div>
                                   <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                                   <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="••••••••"
                                   />
                              </div>
                              <div>
                                   <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
                                   <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="••••••••"
                                   />
                              </div>

                              <button
                                   type="submit"
                                   disabled={loading}
                                   className="w-full bg-primary text-white font-bold py-4 rounded-xl uppercase tracking-wider hover:bg-opacity-90 transition-opacity disabled:opacity-70"
                              >
                                   {loading ? "Creating Account..." : "Sign Up"}
                              </button>
                         </form>

                         <div className="mt-8 text-center text-gray-500 text-sm">
                              Already have an account?{" "}
                              <Link href="/login" className="text-primary font-bold hover:underline">
                                   Sign In
                              </Link>
                         </div>
                    </div>
               </main>
               <Footer />
          </div>
     );
}
