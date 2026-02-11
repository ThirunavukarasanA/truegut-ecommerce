"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { GoogleLogin } from "@react-oauth/google";

export default function UserLogin() {
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Welcome back!");
        // Assuming API returns { success: true, message: "...", customer: { ... } }
        login(data.customer);
        router.push("/account");
      } else {
        toast.error(data.error || "Login failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Welcome back!");
        login(data.customer);
        router.push("/account");
      } else {
        toast.error(data.error || "Google Login failed");
      }
    } catch (error) {
      toast.error("Something went wrong with Google Login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center py-36 px-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg max-w-md w-full border border-gray-100">
        <h1 className="text-3xl text-gray-800 tracking-tight mb-2 text-center">
          Welcome Back
        </h1>
        <p className="text-gray-400 font-light text-sm text-center mb-8">
          Sign in to access your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="group relative">
            {/* <label className="block text-sm font-bold text-gray-700 mb-2">
              Email Address
            </label> */}
            <MdEmail className="absolute left-5 top-5 text-gray-300 group-focus-within:text-primary transition-colors text-xl" />
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              // className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 pl-14 pr-4 outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all font-semibold text-gray-700 placeholder:text-gray-300"
              placeholder="you@example.com"
            />
          </div>
          <div className="group relative">
            {/* <label className="block text-sm font-bold text-gray-700 mb-2">
              Password
            </label> */}
            <MdLock className="absolute left-5 top-4 text-gray-300 group-focus-within:text-primary transition-colors text-xl" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              // className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 pl-14 pr-14 outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all font-semibold text-gray-700 placeholder:text-gray-300"
              placeholder="••••••••"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-secondary active:scale-[0.98] duration-200 text-white font-bold py-4 rounded-xl tracking-wider hover:bg-opacity-90 transition-opacity disabled:opacity-70"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-gray-200 w-full"></div>
            <span className="bg-white px-3 text-gray-500 text-sm">OR</span>
            <div className="border-t border-gray-200 w-full"></div>
          </div>

          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                toast.error("Google Login Failed");
              }}
              useOneTap
              theme="outline"
              size="large"
              shape="circle"
              width="100%"
            />
          </div>
        </form>

        <div className="mt-8 text-center text-gray-500 text-sm">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-primary font-bold hover:underline"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}
