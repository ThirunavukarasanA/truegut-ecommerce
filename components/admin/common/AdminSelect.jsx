"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdExpandMore, MdCheck } from "react-icons/md";

export default function AdminSelect({ label, options = [], value, onChange, error, placeholder = "Select option", className = "" }) {
     const [isOpen, setIsOpen] = useState(false);
     const containerRef = useRef(null);

     const selectedOption = options.find(opt => opt.value === value);

     useEffect(() => {
          const handleClickOutside = (event) => {
               if (containerRef.current && !containerRef.current.contains(event.target)) {
                    setIsOpen(false);
               }
          };
          document.addEventListener("mousedown", handleClickOutside);
          return () => document.removeEventListener("mousedown", handleClickOutside);
     }, []);

     const handleSelect = (val) => {
          if (onChange) {
               onChange({ target: { value: val } });
          }
          setIsOpen(false);
     };

     return (
          <div className={`flex flex-col gap-2 ${className}`} ref={containerRef}>
               {label && (
                    <label className="text-xs font-light text-gray-400 ml-1">
                         {label}
                    </label>
               )}

               <div className="relative">
                    {/* Trigger */}
                    <button
                         type="button"
                         onClick={() => setIsOpen(!isOpen)}
                         className={`w-full bg-white border border-gray-100 rounded-[1.25rem] px-6 py-4 outline-none flex items-center justify-between group hover:border-purple-300 hover:ring-4 hover:ring-purple-50 transition-all shadow-sm ${isOpen ? "border-purple-300 ring-4 ring-purple-50" : ""
                              } ${error ? "border-red-300 ring-red-50" : ""}`}
                    >
                         <span className={`text-sm ${selectedOption ? "text-gray-700 font-medium" : "text-gray-300 font-light"}`}>
                              {selectedOption ? selectedOption.label : placeholder}
                         </span>
                         <motion.div
                              animate={{ rotate: isOpen ? 180 : 0 }}
                              className="text-gray-300 group-hover:text-purple-600 transition-colors"
                         >
                              <MdExpandMore size={22} />
                         </motion.div>
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                         {isOpen && (
                              <motion.div
                                   initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                   animate={{ opacity: 1, scale: 1, y: 5 }}
                                   exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                   className="absolute z-[150] w-full bg-white rounded-[1.5rem] border border-gray-100 shadow-2xl shadow-purple-900/10 overflow-hidden py-2"
                              >
                                   <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-100">
                                        {options.length > 0 ? (
                                             options.map((option) => (
                                                  <button
                                                       key={option.value}
                                                       type="button"
                                                       onClick={() => handleSelect(option.value)}
                                                       className={`w-full px-6 py-3.5 text-left flex items-center justify-between group transition-all ${value === option.value
                                                            ? "bg-purple-50 text-purple-700 font-medium"
                                                            : "text-gray-600 font-normal hover:bg-gray-50 hover:text-purple-600"
                                                            }`}
                                                  >
                                                       <span className={`text-sm tracking-tight`}>
                                                            {option.label}
                                                       </span>
                                                       {value === option.value && (
                                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                                 <MdCheck size={18} className="text-purple-600" />
                                                            </motion.div>
                                                       )}
                                                  </button>
                                             ))
                                        ) : (
                                             <div className="px-6 py-4 text-xs font-light text-gray-400 uppercase tracking-widest text-center">
                                                  No options available
                                             </div>
                                        )}
                                   </div>
                              </motion.div>
                         )}
                    </AnimatePresence>
               </div>

               {error && (
                    <p className="text-[10px] text-red-500 font-light uppercase tracking-widest px-1">
                         {error}
                    </p>
               )}
          </div>
     );
}
