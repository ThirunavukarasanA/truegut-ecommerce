import React from "react";
import Navbar from "@/components/Home/Navbar";
import Footer from "@/components/Home/Footer";
import { useRouter } from "next/navigation";

export default function EmptyCart() {
     const router = useRouter();

     return (
          <div className="min-h-screen bg-gray-50 flex flex-col">
               <Navbar />
               <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
                    <button
                         onClick={() => router.push('/collections')}
                         className="bg-primary text-white px-6 py-2 rounded"
                    >
                         Shop Now
                    </button>
               </div>
               <Footer />
          </div>
     );
}
