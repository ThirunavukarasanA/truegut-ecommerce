import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoPlay, IoReload } from 'react-icons/io5';
import AdminSelect from '@/components/admin/common/AdminSelect';
import toast from 'react-hot-toast';
import { adminFetch } from "@/lib/admin/adminFetch";

export default function PincodeModal({ isOpen, onClose, onSuccess }) {
     const [states, setStates] = useState([]);
     const [selectedState, setSelectedState] = useState('');
     const [loading, setLoading] = useState(false);
     const [range, setRange] = useState(null);

     // Fetch states on open
     useEffect(() => {
          if (isOpen) {
               fetchStates();
               // Reset state on open
               setSelectedState('');
               setRange(null);
          }
     }, [isOpen]);

     const fetchStates = async () => {
          try {
               const res = await adminFetch('/api/admin/states');
               if (res.error) throw new Error(res.error);
               setStates(res || []);
          } catch (error) {
               console.error('Error fetching states:', error);
               toast.error('Failed to load states');
          }
     };

     const handleStateChange = (e) => {
          const stateCode = e.target.value;
          setSelectedState(stateCode);

          const state = states.find(s => s.code === stateCode);
          if (state && state.range && state.range.length === 2) {
               setRange(state.range);
          } else {
               setRange(null);
          }
     };

     const handleGenerate = async () => {
          if (!selectedState) return;
          setLoading(true);

          try {
               const res = await adminFetch('/api/admin/pincodes', {
                    method: 'POST',
                    body: JSON.stringify({
                         stateCode: selectedState,
                         generate: true
                    })
               });

               if (res.error) throw new Error(res.error);

               toast.success('Background generation started');
               // Immediate Close and Reset
               onClose();
               onSuccess(); // Trigger parent refresh (to show progress component if needed)

          } catch (error) {
               console.error('Error:', error);
               toast.error(error.message || 'Generation failed');
          } finally {
               setLoading(false);
          }
     };

     if (!isOpen) return null;

     return (
          <AnimatePresence>
               <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                         initial={{ opacity: 0, scale: 0.95 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.95 }}
                         className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                    >
                         {/* Header */}
                         <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                              <h3 className="text-lg font-semibold text-gray-800">Generate Pincodes</h3>
                              <button
                                   onClick={onClose}
                                   className="p-2 hover:bg-white rounded-full transition-colors text-gray-500 hover:text-red-500 shadow-sm"
                              >
                                   <IoClose size={20} />
                              </button>
                         </div>

                         {/* Body */}
                         <div className="p-6 space-y-6">
                              <div>
                                   <label className="block text-sm font-medium text-gray-700 mb-2">Select State</label>
                                   <AdminSelect
                                        isModal
                                        value={selectedState}
                                        onChange={handleStateChange}
                                        placeholder="Choose a state..."
                                        options={states.map(s => ({ value: s.code, label: s.name }))}
                                   />
                              </div>

                              {states.length === 0 && !loading && (
                                   <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 mb-4">
                                        No states found. Please close this modal and click "Update States" first.
                                   </div>
                              )}

                              {range && (
                                   <div className="bg-blue-50 text-blue-700 p-4 rounded-xl text-sm border border-blue-100">
                                        <p className="font-medium flex items-center gap-2">
                                             <IoReload className="animate-pulse" />
                                             Pincode Range Info
                                        </p>
                                        <p className="mt-1 opacity-90">
                                             Range: <strong>{range[0]}</strong> - <strong>{range[1]}</strong>
                                        </p>
                                   </div>
                              )}
                         </div>

                         {/* Footer */}
                         <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                              <button
                                   onClick={onClose}
                                   className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                              >
                                   Cancel
                              </button>

                              <button
                                   onClick={handleGenerate}
                                   disabled={!selectedState || !range || loading}
                                   className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md shadow-indigo-200 transition-all active:scale-95"
                              >
                                   {loading ? (
                                        <>
                                             <IoReload className="animate-spin" /> Starting...
                                        </>
                                   ) : (
                                        <>
                                             <IoPlay /> Start Generation
                                        </>
                                   )}
                              </button>
                         </div>
                    </motion.div>
               </div>
          </AnimatePresence>
     );
}
