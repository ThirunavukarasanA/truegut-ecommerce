"use client";

import React, { useState, useEffect } from "react";
import { useLocation } from "@/context/LocationContext";
import { useCart } from "@/context/CartContext";
import { toast } from "react-hot-toast";
import { FiMapPin } from "react-icons/fi";
import { CgSpinner } from "react-icons/cg";
import { motion, AnimatePresence } from "framer-motion";
import ShippingReturnsModal from "./ShippingReturnsModal";

export default function PincodeChecker() {
  const {
    pincode: storedPincode,
    updateLocation,
    isLocationSet,
    clearLocation,
  } = useLocation();
  const { clearCart, cartItems } = useCart();
  const [pincode, setPincode] = useState(storedPincode || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [serviceable, setServiceable] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (storedPincode) {
      setPincode(storedPincode);
      setServiceable(true);
    }
  }, [storedPincode]);

  const handleCheck = async () => {
    if (pincode.length !== 6) {
      setError("Please enter a valid 6-digit pincode");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/location/${pincode}`);
      const data = await res.json();

      if (res.ok && data.serviceable) {
        setServiceable(true);

        // If pincode changed and cart has items, clear cart automatically (no alert as requested)
        if (
          storedPincode &&
          storedPincode !== pincode &&
          cartItems.length > 0
        ) {
          await clearCart();
          toast.success("Cart cleared due to location change", { icon: "🛒" });
        }

        await updateLocation({
          pincode,
          postOffice: data.postOffices?.[0] || "",
          vendorId: data.vendor?.id || null,
          vendorName: data.vendor?.name || "Global Vendor",
          isServiceable: true,
        });

        toast.success(`Serviceable at ${pincode}`);
      } else {
        setServiceable(false);
        setError("Not available for this location");
        // Explicitly update context that this pincode is NOT serviceable
        await updateLocation({ pincode, isServiceable: false });
      }
    } catch (err) {
      console.error("Pincode check error:", err);
      setError("Failed to check pincode. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryEstimate = () => {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 3); // Simple 3-day estimate
    return deliveryDate.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  return (
    <div
      id="pincode-section"
      className="my-6 p-4 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-3"
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <FiMapPin className="text-primary" />
        <span>Delivery Options</span>
      </div>

      <div className="relative flex items-center">
        <input
          type="text"
          maxLength={6}
          value={pincode}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            setPincode(val);

            if (val === "") {
              setServiceable(null);
              setError("");
              clearLocation();
              return;
            }

            if (val.length < 6) {
              setServiceable(null);
              setError("");
            }
            // Crucial: if user types anything new, they MUST click "Check" again
            // So we set isServiceable to false in context temporarily
            if (val !== storedPincode) {
              updateLocation({ isServiceable: false });
            }
          }}
          placeholder="Enter pin code to check delivery date"
          className={`w-full px-4 py-3 bg-white border ${error ? "border-red-300" : "border-gray-200"} rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all pr-20`}
        />
        
        <button
          onClick={handleCheck}
          disabled={loading || pincode.length !== 6}
          className="absolute right-2 px-4 py-1.5 disabled:bg-[#4b8b3c73] bg-[#4a8b3c] text-white font-bold text-sm hover:bg-[#35bb17] rounded-lg transition-colors disabled:text-[#ffffff81] cursor-pointer flex items-center justify-center min-w-[60px]"
        >
          {loading ? <CgSpinner className="animate-spin text-xl" /> : "Check"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-xs text-red-500 font-semibold ml-1 bg-red-50 p-2 rounded-lg border border-red-100 flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
            {error}
          </motion.p>
        )}

        {serviceable === true && !error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-1.5 ml-1 p-3 bg-primary/5 rounded-xl border border-primary/10"
          >
            <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full" />
              FREE delivery by{" "}
              <span className="text-primary font-bold">
                {getDeliveryEstimate()}
              </span>
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              Looking good! Serviceable at{" "}
              <span className="font-semibold text-gray-700">{pincode}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-3 pt-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 text-xs text-gray-500 font-medium group cursor-pointer hover:text-gray-800 transition-colors"
          >
            <div className="p-1.5 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <span className="underline underline-offset-2">
              Shipping & Returns
            </span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Fast
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Safe
              </span>
            </div>
          </div>
        </div>
      </div>

      <ShippingReturnsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
