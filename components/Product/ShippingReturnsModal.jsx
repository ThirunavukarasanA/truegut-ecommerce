"use client";

import React from "react";
import { MdClose, MdLocalShipping, MdKeyboardReturn } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

export default function ShippingReturnsModal({ isOpen, onClose }) {
     if (!isOpen) return null;

     return (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
               <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative"
               >
                    <button
                         onClick={onClose}
                         className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                    >
                         <MdClose size={24} className="text-gray-500" />
                    </button>

                    <div className="p-8">
                         <h3 className="text-2xl font-extrabold text-[#1a1a1a] mb-8 flex items-center gap-3">
                              Shipping & Returns
                         </h3>

                         <div className="space-y-8">
                              <section className="flex gap-4">
                                   <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                                        <MdLocalShipping className="text-primary" size={24} />
                                   </div>
                                   <div>
                                        <h4 className="font-bold text-gray-800 mb-2">Shipping Policy</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                             We offer free delivery on all orders above ₹999. Orders are usually processed within 24 hours and delivered within 3-5 business days depending on your location.
                                        </p>
                                        <div className="mt-4 flex flex-wrap gap-2">
                                             <span className="text-[10px] font-bold uppercase tracking-widest bg-gray-100 px-2.5 py-1 rounded-full text-gray-500">Live Tracking</span>
                                             <span className="text-[10px] font-bold uppercase tracking-widest bg-gray-100 px-2.5 py-1 rounded-full text-gray-500">Secure Packaging</span>
                                        </div>
                                   </div>
                              </section>

                              <section className="flex gap-4">
                                   <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0">
                                        <MdKeyboardReturn className="text-amber-600" size={24} />
                                   </div>
                                   <div>
                                        <h4 className="font-bold text-gray-800 mb-2">Returns & Refunds</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                             Due to the perishable nature of our products, we only accept returns if the product is damaged or defective upon arrival. Please notify us within 24 hours of delivery.
                                        </p>
                                        <p className="text-sm text-gray-600 leading-relaxed mt-2">
                                             Contact our support team with photos of the damaged item for a full refund or replacement.
                                        </p>
                                   </div>
                              </section>
                         </div>

                         <button
                              onClick={onClose}
                              className="w-full mt-10 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
                         >
                              Got it, thanks!
                         </button>
                    </div>
               </motion.div>
          </div>
     );
}
