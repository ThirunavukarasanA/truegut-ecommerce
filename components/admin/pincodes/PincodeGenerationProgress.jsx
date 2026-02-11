import React, { useState, useEffect, useRef } from 'react';
import { adminFetch } from "@/lib/admin/adminFetch";
import { IoReload, IoCheckmarkCircle, IoWarning, IoClose } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';

export default function PincodeGenerationProgress({ onSuccess, triggerPoll }) {
     const [jobs, setJobs] = useState([]);
     const [isOpen, setIsOpen] = useState(false);
     const pollInterval = useRef(null);

     const fetchStatus = async () => {
          try {
               const res = await adminFetch('/api/admin/pincodes/status');
               if (res && Array.isArray(res)) {
                    setJobs(res);

                    // Check if we have any active jobs
                    const anyActive = res.some(j => j.status === 'running' || j.status === 'pending');

                    if (anyActive) {
                         // Ensure we are polling if not already
                         startPolling();
                    } else {
                         // No active jobs? We can stop polling to save resources
                         // UNLESS we just started? (handled by manual trigger)
                         // But if we already have data and none are running, we stop.
                         stopPolling();
                    }
               }
          } catch (error) {
               // console.error("Error polling status:", error);
               stopPolling(); // Stop on error to avoid spamming
          }
     };

     const startPolling = () => {
          if (!pollInterval.current) {
               pollInterval.current = setInterval(fetchStatus, 3000);
          }
     };

     const stopPolling = () => {
          if (pollInterval.current) {
               clearInterval(pollInterval.current);
               pollInterval.current = null;
          }
     };

     useEffect(() => {
          // On mount or trigger, fetch once and decide
          fetchStatus();
          // Also start polling blindly for a moment to ensure we catch updates if needed
          startPolling();

          return () => stopPolling();
     }, [triggerPoll]);

     if (jobs.length === 0) return null;

     const activeCount = jobs.filter(j => j.status === 'running' || j.status === 'pending').length;

     return (
          <>
               {/* Trigger Button - Persistent Indicator */}
               <div className="mb-6 flex">
                    <button
                         onClick={() => setIsOpen(true)}
                         className="flex items-center gap-3 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors shadow-sm font-medium animate-pulse"
                    >
                         <IoReload className="animate-spin" />
                         <span>
                              {activeCount > 0
                                   ? `Generating Pincodes (${activeCount} running)...`
                                   : 'Generation Completed'}
                         </span>
                         <span className="text-xs bg-white px-2 py-0.5 rounded-md border border-indigo-100 text-indigo-600">
                              View Progress
                         </span>
                    </button>
               </div>

               {/* Modal Overlay */}
               <AnimatePresence>
                    {isOpen && (
                         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                              <motion.div
                                   initial={{ opacity: 0, scale: 0.95 }}
                                   animate={{ opacity: 1, scale: 1 }}
                                   exit={{ opacity: 0, scale: 0.95 }}
                                   className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[80vh] flex flex-col"
                              >
                                   <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                        <h3 className="font-semibold text-gray-800">Generation Tasks</h3>
                                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white rounded-full text-gray-500">
                                             <IoClose size={20} />
                                        </button>
                                   </div>

                                   <div className="p-6 overflow-y-auto space-y-4">
                                        {jobs.map(job => (
                                             <div key={job._id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
                                                  {/* Status Icon */}
                                                  <div className={`p-3 rounded-full flex-shrink-0 ${job.status === 'completed' ? 'bg-green-50 text-green-600' :
                                                       job.status === 'failed' ? 'bg-red-50 text-red-600' :
                                                            'bg-indigo-50 text-indigo-600'
                                                       }`}>
                                                       {job.status === 'completed' ? <IoCheckmarkCircle size={24} /> :
                                                            job.status === 'failed' ? <IoWarning size={24} /> :
                                                                 <IoReload size={24} className="animate-spin" />}
                                                  </div>

                                                  {/* Info */}
                                                  <div className="flex-1 min-w-0">
                                                       <div className="flex justify-between items-center mb-1">
                                                            <h4 className="font-medium text-gray-800 text-sm">State: {job.state}</h4>
                                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${job.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                                 job.status === 'failed' ? 'bg-red-100 text-red-700' :
                                                                      'bg-indigo-100 text-indigo-700'
                                                                 }`}>
                                                                 {job.status}
                                                            </span>
                                                       </div>

                                                       {/* Progress Bar */}
                                                       <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-1">
                                                            <div
                                                                 className={`h-full transition-all duration-500 ${job.status === 'failed' ? 'bg-red-500' :
                                                                      job.status === 'completed' ? 'bg-green-500' : 'bg-indigo-500'
                                                                      }`}
                                                                 style={{ width: `${job.progress}%` }}
                                                            />
                                                       </div>

                                                       <div className="flex justify-between text-xs text-gray-500">
                                                            <span>{job.processedPincodes} processed</span>
                                                            <div className="flex gap-3">
                                                                 <span className="text-green-600">Success: {job.successCount}</span>
                                                                 {job.failedCount > 0 && <span className="text-red-600">Failed: {job.failedCount}</span>}
                                                            </div>
                                                       </div>
                                                       {job.error && <p className="text-xs text-red-500 mt-1">Error: {job.error}</p>}
                                                  </div>

                                                  {(job.status === 'completed' || job.status === 'failed') && (
                                                       <button
                                                            onClick={(e) => {
                                                                 e.stopPropagation();
                                                                 onSuccess && onSuccess();
                                                            }}
                                                            className="text-xs ml-2 text-gray-400 hover:text-indigo-600 underline"
                                                       >
                                                            Refresh
                                                       </button>
                                                  )}
                                             </div>
                                        ))}
                                   </div>
                                   <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                                        <button onClick={() => setIsOpen(false)} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">Close</button>
                                   </div>
                              </motion.div>
                         </div>
                    )}
               </AnimatePresence>
          </>
     );
}
