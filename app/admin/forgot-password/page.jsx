"use client";

import { useState } from "react";
import { MdEmail, MdArrowBack } from "react-icons/md";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ForgotPassword() {
     const [email, setEmail] = useState("");
     const [loading, setLoading] = useState(false);
     const [submitted, setSubmitted] = useState(false);

     const handleSubmit = async (e) => {
          e.preventDefault();
          setLoading(true);
          const toastId = toast.loading("Processing...");

          try {
               const res = await fetch("/api/auth/forgot-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
               });

               const data = await res.json();
               if (res.ok) {
                    setSubmitted(true);
                    toast.success(data.message, { id: toastId });
                    // DEV/DEBUG: In this environment, we show token for ease of use
                    if (data.debugToken) {
                         console.log("DEBUG: Reset Token is:", data.debugToken);
                         toast.success("Debug: Token logged to console", { duration: 10000 });
                    }
               } else {
                    throw new Error(data.error || "Something went wrong");
               }
          } catch (err) {
               toast.error(err.message, { id: toastId });
               setLoading(false);
          }
     };

     return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">
               {/* Background Decor */}
               <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-3xl"></div>
                    <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-secondary/10 blur-3xl"></div>
               </div>

               <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-200 w-full max-w-md relative z-10 border border-gray-100 animate-in fade-in zoom-in-95 duration-500">
                    <div className="text-center mb-10">
                         <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg shadow-gray-200 mb-6 transform -rotate-6">
                              <span className="text-white text-3xl font-black">?</span>
                         </div>
                         <h1 className="text-3xl font-black text-gray-900 mb-2">Recovery</h1>
                         <p className="text-gray-400 font-medium text-sm">Regain access to your admin dashboard</p>
                    </div>

                    {!submitted ? (
                         <form onSubmit={handleSubmit} className="space-y-6">
                              <div className="space-y-2">
                                   <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                   <div className="relative group">
                                        <MdEmail className="absolute left-5 top-4 text-gray-300 group-focus-within:text-primary transition-colors text-xl" />
                                        <input
                                             type="email"
                                             value={email}
                                             onChange={(e) => setEmail(e.target.value)}
                                             className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 pl-14 pr-4 outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all font-semibold text-gray-700 placeholder:text-gray-300"
                                             placeholder="admin@fermentaa.com"
                                             required
                                        />
                                   </div>
                              </div>

                              <button
                                   type="submit"
                                   disabled={loading}
                                   className="w-full bg-primary hover:bg-secondary text-white py-4.5 rounded-2xl font-bold text-lg shadow-lg shadow-gray-200 active:scale-[0.98] transition-all duration-200"
                              >
                                   {loading ? "Sending link..." : "Send Reset Link"}
                              </button>

                              <div className="text-center pt-2">
                                   <Link href="/admin" className="inline-flex items-center gap-2 text-[11px] text-gray-400 hover:text-primary font-bold uppercase tracking-wider transition-colors">
                                        <MdArrowBack /> Back to Sign In
                                   </Link>
                              </div>
                         </form>
                    ) : (
                         <div className="text-center space-y-6 py-4 animate-in fade-in slide-in-from-top-4">
                              <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
                                   <MdEmail size={40} />
                              </div>
                              <div className="space-y-2">
                                   <h3 className="text-xl font-bold text-gray-900">Check Your Inbox</h3>
                                   <p className="text-gray-400 text-sm leading-relaxed px-4">
                                        We've sent a secure link to <span className="text-primary font-bold">{email}</span>. Click it to reset your password.
                                   </p>
                              </div>
                              <Link
                                   href="/admin"
                                   className="w-full block bg-gray-900 text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-black transition-colors"
                              >
                                   Return to Login
                              </Link>
                         </div>
                    )}
               </div>
          </div>
     );
}
