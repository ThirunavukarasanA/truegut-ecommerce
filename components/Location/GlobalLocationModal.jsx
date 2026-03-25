"use client";

import React from "react";
import { useLocation } from "@/context/LocationContext";
import { FiX } from "react-icons/fi";
import { motion } from "framer-motion";
import PincodeChecker from "../Product/PincodeChecker";

export default function GlobalLocationModal() {
  const { isModalOpen, closeModal } = useLocation();

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md relative overflow-hidden"
      >
        <button 
          onClick={closeModal}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-2 rounded-full hover:bg-gray-100"
        >
          <FiX size={20} />
        </button>

        <div className="p-4 pt-8">
          <PincodeChecker onVerificationSuccess={closeModal} />
        </div>
      </motion.div>
    </div>
  );
}
