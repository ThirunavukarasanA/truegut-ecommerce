"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const toastId = toast.loading("Authenticating...");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      toast.success("Welcome back!", { id: toastId });
      router.push("/admin/dashboard");
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
        <div className="absolute -bottom-[10%] left-[20%] w-[35%] h-[35%] rounded-full bg-primary/5 blur-3xl"></div>
      </div>

      {/* Login Card */}
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-200 w-full max-w-md relative z-10 border border-gray-100 animate-in fade-in zoom-in-95 duration-500">
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg shadow-gray-200 mb-6 transform -rotate-6">
            <MdLock size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-light text-gray-800 tracking-tight mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-400 font-light text-sm">
            Please sign in to access your dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Input */}
          <div className="group relative">
            <MdEmail className="absolute left-5 top-5 text-gray-300 group-focus-within:text-primary transition-colors text-xl" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 pl-14 pr-4 outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all font-semibold text-gray-700 placeholder:text-gray-300"
              required
            />
          </div>

          {/* Password Input */}
          <div className="group relative">
            <MdLock className="absolute left-5 top-4 text-gray-300 group-focus-within:text-primary transition-colors text-xl" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 pl-14 pr-14 outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all font-semibold text-gray-700 placeholder:text-gray-300"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-4 text-gray-300 hover:text-primary transition-colors"
            >
              {showPassword ? (
                <MdVisibilityOff size={20} />
              ) : (
                <MdVisibility size={20} />
              )}
            </button>
          </div>

          <div className="flex justify-end">
            <Link
              href="/admin/forgot-password"
              className="text-[11px] text-primary hover:text-primary/80 font-bold uppercase tracking-wider"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-secondary text-white py-4.5 rounded-2xl font-bold text-lg shadow-lg shadow-gray-200 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3"
          >
            {" "}
            {loading ? (
              <span className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Enter Dashboard</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} Truegut
          </p>
        </div>
      </div>
    </div>
  );
}
