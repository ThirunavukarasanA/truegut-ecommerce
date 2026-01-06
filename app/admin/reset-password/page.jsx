"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MdLock, MdVisibility, MdVisibilityOff, MdCheckCircle } from "react-icons/md";
import Link from "next/link";
import toast from "react-hot-toast";

function ResetPasswordForm() {
     const router = useRouter();
     const searchParams = useSearchParams();
     const token = searchParams.get("token");

     const [showPassword, setShowPassword] = useState(false);
     const [loading, setLoading] = useState(false);
     const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
     const [success, setSuccess] = useState(false);

     useEffect(() => {
          if (!token) {
               toast.error("Invalid or missing reset token");
               router.push("/admin/forgot-password");
          }
     }, [token, router]);

     const handleSubmit = async (e) => {
          e.preventDefault();
          if (form.newPassword !== form.confirmPassword) {
               return toast.error("Passwords do not match");
          }
          if (form.newPassword.length < 6) {
               return toast.error("Password must be at least 6 characters");
          }

          setLoading(true);
          const toastId = toast.loading("Updating password...");

          try {
               const res = await fetch("/api/auth/reset-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token, newPassword: form.newPassword }),
               });

               const data = await res.json();
               if (res.ok) {
                    setSuccess(true);
                    toast.success(data.message, { id: toastId });
               } else {
                    throw new Error(data.error || "Reset failed");
               }
          } catch (err) {
               toast.error(err.message, { id: toastId });
               setLoading(false);
          }
     };

     if (success) {
          return (
               <div className="text-center space-y-6 pt-4 animate-in fade-in slide-in-from-top-4">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
                         <MdCheckCircle size={40} />
                    </div>
                    <div className="space-y-2">
                         <h3 className="text-2xl font-black text-gray-900">Success!</h3>
                         <p className="text-gray-400 font-medium text-sm leading-relaxed px-4">
                              Your password has been reset securely. You can now access your dashboard.
                         </p>
                    </div>
                    <Link
                         href="/admin"
                         className="w-full block bg-emerald-600 text-white py-4.5 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all"
                    >
                         Sign In Now
                    </Link>
               </div>
          );
     }

     return (
          <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-500">
               <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                    <div className="relative group">
                         <MdLock className="absolute left-5 top-4 text-gray-300 group-focus-within:text-emerald-600 transition-colors text-xl" />
                         <input
                              type={showPassword ? "text" : "password"}
                              value={form.newPassword}
                              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                              className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 pl-14 pr-14 outline-none focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-50 transition-all font-semibold text-gray-700 placeholder:text-gray-300"
                              placeholder="Min 6 characters"
                              required
                         />
                         <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-5 top-4 text-gray-300 hover:text-emerald-600 transition-colors"
                              tabIndex="-1"
                         >
                              {showPassword ? <MdVisibilityOff size={22} /> : <MdVisibility size={22} />}
                         </button>
                    </div>
               </div>

               <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                    <div className="relative group">
                         <MdLock className="absolute left-5 top-4 text-gray-300 group-focus-within:text-emerald-600 transition-colors text-xl" />
                         <input
                              type={showPassword ? "text" : "password"}
                              value={form.confirmPassword}
                              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                              className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 pl-14 pr-14 outline-none focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-50 transition-all font-semibold text-gray-700 placeholder:text-gray-300"
                              placeholder="Repeat password"
                              required
                         />
                    </div>
               </div>

               <button
                    type="submit"
                    disabled={loading || !token}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4.5 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-100 active:scale-[0.98] transition-all duration-200 flex items-center justify-center"
               >
                    {loading ? "System Updating..." : "Secure Update"}
               </button>
          </form>
     );
}

export default function ResetPassword() {
     return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">
               {/* Background Decor */}
               <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-emerald-100/50 blur-3xl"></div>
                    <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-emerald-50 blur-3xl"></div>
               </div>

               <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-emerald-100/50 w-full max-w-md relative z-10 border border-gray-100 animate-in fade-in zoom-in-95 duration-500">
                    <div className="text-center mb-10">
                         <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-200 mb-6 transform -rotate-6">
                              <span className="text-white text-3xl font-black">!</span>
                         </div>
                         <h1 className="text-3xl font-black text-gray-900 mb-2">Reset</h1>
                         <p className="text-gray-400 font-medium text-sm">Securely update your admin credentials</p>
                    </div>

                    <Suspense fallback={<div className="text-center py-10 text-gray-400 animate-pulse">Initializing Security...</div>}>
                         <ResetPasswordForm />
                    </Suspense>
               </div>
          </div>
     );
}
