import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoLocation } from 'react-icons/io5';

export default function SubPlacesModal({ isOpen, onClose, pincodeData }) {
     if (!isOpen || !pincodeData) return null;

     const places = pincodeData.postOffices || [];

     return (
          <AnimatePresence>
               <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                         initial={{ opacity: 0, scale: 0.95 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.95 }}
                         className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]"
                    >
                         {/* Header */}
                         <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                              <div>
                                   <h3 className="text-lg font-semibold text-gray-800">
                                        Pincode: {pincodeData.pincode}
                                   </h3>
                                   <p className="text-sm text-gray-500">
                                        {places.length} Sub-places found
                                   </p>
                              </div>
                              <button
                                   onClick={onClose}
                                   className="p-2 hover:bg-white rounded-full transition-colors text-gray-500 hover:text-red-500 shadow-sm"
                              >
                                   <IoClose size={20} />
                              </button>
                         </div>

                         {/* Body - Scrollable */}
                         <div className="flex-1 overflow-y-auto p-6 space-y-3">
                              {places.length === 0 ? (
                                   <p className="text-center text-gray-400 py-8">No specific sub-places data available.</p>
                              ) : (
                                   places.map((place, idx) => (
                                        <div
                                             key={idx}
                                             className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors"
                                        >
                                             <div className="mt-1 text-indigo-500">
                                                  <IoLocation size={18} />
                                             </div>
                                             <div>
                                                  <h4 className="font-medium text-gray-800">{place.name}</h4>
                                                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                                                       <span>Division: {place.division}</span>
                                                       <span className="w-1 h-1 rounded-full bg-gray-300 self-center"></span>
                                                       <span>Circle: {place.circle}</span>
                                                       <span className="w-1 h-1 rounded-full bg-gray-300 self-center"></span>
                                                       <span>District: {place.district}</span>
                                                  </div>
                                             </div>
                                        </div>
                                   ))
                              )}
                         </div>

                         {/* Footer */}
                         <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                              <button
                                   onClick={onClose}
                                   className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium transition-colors text-sm"
                              >
                                   Done
                              </button>
                         </div>
                    </motion.div>
               </div>
          </AnimatePresence>
     );
}
