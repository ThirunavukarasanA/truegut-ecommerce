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
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-3xl"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-secondary/5 blur-3xl"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[35%] h-[35%] rounded-full bg-secondary/5 blur-3xl"></div>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-secondary/10 w-full max-w-md relative z-10 border border-gray-100 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary rounded-2xl shadow-lg shadow-secondary/10 mb-6 transform -rotate-6">
            <span className="text-white text-3xl font-black">F</span>
          </div>
          <h1 className="text-3xl font-black text-primary mb-2">
            Fermentaa Admin
          </h1>
          <p className="text-gray-400 font-medium text-sm">
            Control center for your boutique
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
              Email Address
            </label>
            <div className="relative group">
              <MdEmail className="absolute left-5 top-4 text-gray-300 group-focus-within:text-secondary transition-colors text-xl" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 pl-14 pr-4 outline-none focus:bg-white focus:border-secondary/20 focus:ring-4 focus:ring-secondary/5 transition-all font-semibold text-gray-700 placeholder:text-gray-300"
                placeholder="admin@fermentaa.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
              Secret Password
            </label>
            <div className="relative group">
              <MdLock className="absolute left-5 top-4 text-gray-300 group-focus-within:text-secondary transition-colors text-xl" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 pl-14 pr-14 outline-none focus:bg-white focus:border-secondary/20 focus:ring-4 focus:ring-secondary/5 transition-all font-semibold text-gray-700 placeholder:text-gray-300"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-4 text-gray-300 hover:text-secondary transition-colors"
                tabIndex="-1"
              >
                {showPassword ? (
                  <MdVisibilityOff size={22} />
                ) : (
                  <MdVisibility size={22} />
                )}
              </button>
            </div>
            <div className="text-right">
              <Link
                href="#"
                className="text-[11px] text-secondary hover:text-secondary/80 font-bold uppercase tracking-wider"
              >
                Access Help?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary hover:bg-secondary/80 text-white py-4.5 rounded-2xl font-bold text-lg shadow-lg shadow-secondary/10 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3"
          >
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
            © {new Date().getFullYear()} Fermentaa Boutique
          </p>
        </div>
      </div>
    </div>
  );
}
