"use client";

import Link from "next/link";
import { HiOutlineExclamationCircle } from "react-icons/hi";

export default function AdminNotFound() {
     return (
          <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
               <div className="bg-white p-12 rounded-2xl shadow-xl shadow-gray-200/50 text-center max-w-md w-full border border-gray-100">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-50 rounded-full mb-6">
                         <HiOutlineExclamationCircle className="w-10 h-10 text-purple-600" />
                    </div>

                    <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
                    <p className="text-xl font-semibold text-gray-700 mb-4">Page Not Found</p>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                         The administrative page you are looking for doesn't exist or has been moved.
                         Please check the URL or return to the dashboard.
                    </p>

                    <div className="space-y-3">
                         <Link
                              href="/admin/dashboard"
                              className="block w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all shadow-lg shadow-purple-200"
                         >
                              Back to Dashboard
                         </Link>
                         <Link
                              href="/admin"
                              className="block text-sm text-gray-400 hover:text-purple-600 transition-colors"
                         >
                              Go to Login
                         </Link>
                    </div>
               </div>

               <p className="mt-8 text-sm text-gray-400 font-medium">
                    &copy; {new Date().getFullYear()} Fermentaa Admin. All rights reserved.
               </p>
          </div>
     );
}
