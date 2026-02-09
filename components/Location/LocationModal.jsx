"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "@/context/LocationContext";
import { useCart } from "@/context/CartContext";
import { toast } from "react-hot-toast";
import { FiChevronDown, FiCheck, FiMapPin, FiX } from "react-icons/fi";

export default function LocationModal() {
     const { isLocationSet, updateLocation, isLoaded, isModalOpen, closeModal } = useLocation();
     const { clearCart } = useCart();
     const [pincode, setPincode] = useState("");
     const [postOffices, setPostOffices] = useState([]);
     const [selectedPO, setSelectedPO] = useState("");
     const [loading, setLoading] = useState(false);
     const [vendorData, setVendorData] = useState(null);
     const [step, setStep] = useState(1); // 1: Pincode, 2: Post Office
     const [isDropdownOpen, setIsDropdownOpen] = useState(false);

     // Sync state with context for manual open
     useEffect(() => {
          if (isModalOpen && isLocationSet) {
               setStep(1);
               setPincode("");
               setSelectedPO("");
          }
     }, [isModalOpen, isLocationSet]);

     // Automatically fetch post offices when pincode reaches 6 digits
     useEffect(() => {
          if (pincode.length === 6) {
               handlePincodeSubmit();
          }
     }, [pincode]);

     const handlePincodeSubmit = async () => {
          setLoading(true);
          try {
               const res = await fetch(`/api/location/${pincode}`);
               const data = await res.json();

               if (res.ok && data.serviceable) {
                    setPostOffices(data.postOffices);
                    setVendorData(data.vendor);
                    setStep(2);
               } else {
                    // Fallback: Save pincode even if not found or not serviceable
                    await updateLocation({
                         pincode,
                         postOffice: "",
                         vendorId: null,
                         vendorName: "", // Clear vendor name
                    });
                    await clearCart();
                    window.location.reload();
                    toast.success("Location set");
               }

          } catch (error) {
               console.error("Pincode submit error:", error);
               toast.error("Failed to fetch location details");
          } finally {
               setLoading(false);
          }
     };

     const handlePOSubmit = async () => {
          if (!selectedPO) {
               toast.error("Please select a post office");
               return;
          }


          await updateLocation({
               pincode,
               postOffice: selectedPO,
               vendorId: vendorData?.id || null,
               vendorName: vendorData?.name || "Global Vendor",
          });

          toast.success("Location set successfully!");
          if (isModalOpen) closeModal();

          await clearCart();
          window.location.reload();
     };

     // Security mechanism to prevent modal removal/hiding
     useEffect(() => {
          if (!isLoaded || isLocationSet) return;

          const modalElement = document.getElementById("secure-location-modal");
          if (!modalElement) return;

          const checkTampering = () => {
               const style = window.getComputedStyle(modalElement);
               const isHidden = style.display === "none" || style.visibility === "hidden" || style.opacity === "0";

               if (isHidden) {
                    localStorage.removeItem("temp-location");
                    window.location.reload();
               }
          };

          const observer = new MutationObserver((mutations) => {
               for (const mutation of mutations) {
                    if (mutation.type === "childList") {
                         const stillExists = document.getElementById("secure-location-modal");
                         if (!stillExists) {
                              localStorage.removeItem("temp-location");
                              window.location.reload();
                              return;
                         }
                    }
                    if (mutation.type === "attributes") {
                         checkTampering();
                    }
               }
          });

          observer.observe(document.body, { childList: true, subtree: true });
          observer.observe(modalElement, { attributes: true, attributeFilter: ["style", "class"] });

          return () => observer.disconnect();
     }, [isLoaded, isLocationSet]);

     if (!isLoaded) return null;
     if (isLocationSet && !isModalOpen) return null;

     return (
          <div id="secure-location-modal" className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
               <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
               >
                    <div className="bg-primary p-6 text-white relative">
                         {isLocationSet && (
                              <button
                                   onClick={closeModal}
                                   className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                              >
                                   <FiX size={24} />
                              </button>
                         )}
                         <h2 className="text-2xl font-bold tracking-tight">
                              {isLocationSet ? "Change Location" : "Welcome to TrueGut"}
                         </h2>
                         <p className="mt-1 text-white/80">
                              {isLocationSet ? "Update your pincode to find local vendors." : "Please set your delivery location to see available products."}
                         </p>
                    </div>

                    <div className="p-8">
                         <AnimatePresence mode="wait">
                              {step === 1 ? (
                                   <motion.div
                                        key="pincode"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-4"
                                   >
                                        <div>
                                             <label className="block text-sm font-medium text-gray-700">Enter Delivery Pincode</label>
                                             <input
                                                  type="text"
                                                  inputMode="numeric"
                                                  maxLength={6}
                                                  value={pincode}
                                                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                                                  placeholder="e.g. 600001"
                                                  className="mt-2 w-full rounded-lg border border-gray-300 p-4 text-xl tracking-widest focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                  autoFocus
                                             />
                                        </div>
                                        {loading && (
                                             <div className="flex justify-center py-4">
                                                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                                             </div>
                                        )}
                                   </motion.div>
                              ) : (
                                   <motion.div
                                        key="postoffice"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-4"
                                   >
                                        <div className="relative">
                                             <label className="block text-sm font-medium text-gray-700 mb-2">Select Locality (Post Office)</label>

                                             <div className="relative">
                                                  <button
                                                       onClick={() => setIsDropdownOpen(!isDropdownOpen)} // Changed from isOpen to isDropdownOpen
                                                       className="w-full flex items-center justify-between rounded-lg border border-gray-300 p-4 bg-white text-left text-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all hover:bg-gray-50"
                                                  >
                                                       <span className={!selectedPO ? "text-gray-400" : ""}>
                                                            {selectedPO || "Choose your sub-place..."}
                                                       </span>
                                                       <FiChevronDown
                                                            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} // Changed from isOpen to isDropdownOpen
                                                       />
                                                  </button>

                                                  <AnimatePresence>
                                                       {isDropdownOpen && ( // Changed from isOpen to isDropdownOpen
                                                            <motion.div
                                                                 initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                                 animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                 exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                                 transition={{ duration: 0.2 }}
                                                                 className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-gray-100 bg-white shadow-xl"
                                                            >
                                                                 <div className="max-h-[240px] overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                                                                      {postOffices.map((po) => (
                                                                           <button
                                                                                key={po}
                                                                                onClick={() => {
                                                                                     setSelectedPO(po);
                                                                                     setIsDropdownOpen(false); // Changed from setIsOpen to setIsDropdownOpen
                                                                                }}
                                                                                className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors hover:bg-primary/5 ${selectedPO === po ? "bg-primary/10 text-primary font-medium" : "text-gray-700"
                                                                                     }`}
                                                                           >
                                                                                <div className="flex items-center gap-3">
                                                                                     <div className={`flex h-8 w-8 items-center justify-center rounded-full ${selectedPO === po ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
                                                                                          }`}>
                                                                                          <FiMapPin className="h-4 w-4" />
                                                                                     </div>
                                                                                     {po}
                                                                                </div>
                                                                                {selectedPO === po && (
                                                                                     <FiCheck className="h-5 w-5 text-primary" />
                                                                                )}
                                                                           </button>
                                                                      ))}
                                                                 </div>
                                                            </motion.div>
                                                       )}
                                                  </AnimatePresence>
                                             </div>
                                        </div>

                                        <div className="flex w-full gap-3">
                                             <button
                                                  onClick={() => setStep(1)}
                                                  className="flex w-full justify-center items-center rounded-lg border border-gray-300 py-3 font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                                             >
                                                  Change Pincode
                                             </button>
                                             <button
                                                  onClick={handlePOSubmit}
                                                  className="flex w-full justify-center items-center rounded-lg bg-primary py-3 font-semibold text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                             >
                                                  Confirm Location
                                             </button>
                                        </div>
                                   </motion.div>
                              )}
                         </AnimatePresence>
                    </div>

                    <div className="bg-gray-50 px-8 py-4 text-center text-xs text-gray-500">
                         We need your location to ensure fresh delivery from the nearest vendor.
                    </div>
               </motion.div>
          </div>
     );
}
