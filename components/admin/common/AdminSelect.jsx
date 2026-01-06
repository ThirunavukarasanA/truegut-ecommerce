"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdExpandMore, MdCheck } from "react-icons/md";

export default function AdminSelect({ label, options = [], value, name, onChange, error, icon: Icon, placeholder = "Select option", className = "" }) {
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

     const handleSelect = (val, name) => {
          if (onChange) {
               onChange({ target: { value: val, name } });
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
                         className={`w-full bg-white border border-gray-100 rounded-[1.25rem] px-6 py-4 outline-none flex items-center justify-between group hover:border-primary/50 hover:ring-4 hover:ring-primary/10 transition-all shadow-sm ${isOpen ? "border-primary ring-4 ring-primary/10" : ""
                              } ${error ? "border-red-300 ring-red-50" : ""} ${Icon ? "pl-12" : ""}`}
                    >
                         <div className="flex items-center gap-3">
                              {Icon && (
                                   <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-primary transition-colors">
                                        <Icon size={18} />
                                   </div>
                              )}
                              <span className={`text-sm ${selectedOption ? "text-gray-700 font-medium" : "text-gray-300 font-light"}`}>
                                   {selectedOption ? selectedOption.label : placeholder}
                              </span>
                         </div>
                         <motion.div
                              animate={{ rotate: isOpen ? 180 : 0 }}
                              className="text-gray-300 group-hover:text-primary transition-colors"
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
                                   className="absolute z-[150] w-full bg-white rounded-[1.5rem] border border-gray-100 shadow-2xl shadow-gray-200 overflow-hidden py-2"
                              >
                                   <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-100">
                                        {options.length > 0 ? (
                                             options.map((option) => (
                                                  <button
                                                       key={option.value}
                                                       type="button"
                                                       name={name}
                                                       onClick={() => handleSelect(option.value, name)}
                                                       className={`w-full px-6 py-3.5 text-left flex items-center justify-between group transition-all ${value === option.value
                                                            ? "bg-bg-color text-primary font-medium"
                                                            : "text-gray-600 font-normal hover:bg-gray-50 hover:text-primary"
                                                            }`}
                                                  >
                                                       <span className={`text-sm tracking-tight`}>
                                                            {option.label}
                                                       </span>
                                                       {value === option.value && (
                                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                                 <MdCheck size={18} className="text-primary" />
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
