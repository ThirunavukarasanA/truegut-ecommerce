import React from "react";
import Link from "next/link";
import { MdLogin } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";

export default function AuthBridge({ user }) {
     if (user) return null;

     return (
          <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
               <div className="space-y-1">
                    <h3 className="font-bold text-gray-800">Already have an account?</h3>
                    <p className="text-sm text-gray-500">Sign in for a faster checkout experience.</p>
               </div>
               <div className="flex gap-3 w-full md:w-auto">
                    <Link
                         href="/login?redirect=/checkout"
                         className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-200 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors"
                    >
                         <MdLogin size={18} />
                         Login
                    </Link>
                    <Link
                         href="/login?redirect=/checkout"
                         className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-200 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors"
                    >
                         <FcGoogle size={18} />
                         Google
                    </Link>
               </div>
          </div>
     );
}
