"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdExpandMore, MdCheck, MdSearch, MdClose } from "react-icons/md";

export default function AdminSelect({
     label,
     options = [],
     value,
     name,
     onChange,
     error,
     icon: Icon,
     placeholder = "Select option",
     className = "",
     isModal = false,
     disabled = false,
     clearable = true // Default to true
}) {
     const [isOpen, setIsOpen] = useState(false);
     const [searchTerm, setSearchTerm] = useState("");
     const containerRef = useRef(null);
     const searchInputRef = useRef(null);

     const selectedOption = options.find(opt => opt.value === value);
     const isValueSelected = value !== "" && value !== null && value !== undefined;

     // Reset search when closed
     useEffect(() => {
          if (!isOpen) {
               setTimeout(() => setSearchTerm(""), 200);
          } else {
               // Focus search input when opened
               setTimeout(() => searchInputRef.current?.focus(), 100);
          }
     }, [isOpen]);

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

     const handleClear = (e) => {
          e.stopPropagation();
          if (onChange) {
               onChange({ target: { value: "", name } });
          }
          setIsOpen(false);
     };

     const filteredOptions = useMemo(() => {
          if (!searchTerm) return options;
          return options.filter(opt =>
               opt.label.toLowerCase().includes(searchTerm.toLowerCase())
          );
     }, [options, searchTerm]);

     return (
          <div className={`flex flex-col gap-2 ${className}`} ref={containerRef}>
               {label && (
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">
                         {label}
                    </label>
               )}

               <div className="relative">
                    {/* Trigger */}
                    <button
                         type="button"
                         disabled={disabled}
                         onClick={() => !disabled && setIsOpen(!isOpen)}
                         className={`w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none flex items-center justify-between group transition-all shadow-sm
                              ${disabled ? "bg-gray-50 cursor-not-allowed opacity-70" : "hover:border-primary/50 hover:ring-4 hover:ring-primary/10"}
                              ${isOpen ? "border-primary ring-4 ring-primary/10" : ""}
                              ${error ? "border-red-300 ring-red-50" : ""}
                              ${Icon ? "pl-10" : ""}
                         `}
                    >
                         <div className="flex items-center gap-3 overflow-hidden flex-1">
                              {Icon && (
                                   <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-primary transition-colors">
                                        <Icon size={18} />
                                   </div>
                              )}
                              <span className={`text-sm truncate ${selectedOption ? "text-gray-800 font-medium" : "text-gray-400 font-normal"}`}>
                                   {selectedOption ? selectedOption.label : placeholder}
                              </span>
                         </div>

                         <div className="flex items-center gap-1">
                              {clearable && isValueSelected && !disabled && (
                                   <div
                                        onClick={handleClear}
                                        className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors z-10"
                                        title="Clear selection"
                                   >
                                        <MdClose size={16} />
                                   </div>
                              )}
                              <motion.div
                                   animate={{ rotate: isOpen ? 180 : 0 }}
                                   className="text-gray-400 group-hover:text-primary transition-colors flex-shrink-0"
                              >
                                   <MdExpandMore size={20} />
                              </motion.div>
                         </div>
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                         {isOpen && !disabled && (
                              <motion.div
                                   initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                   animate={{ opacity: 1, scale: 1, y: 8 }}
                                   exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                   transition={{ duration: 0.1 }}
                                   className={`${isModal ? "fixed" : "absolute"} z-[9999] w-full min-w-[200px] bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden mt-1`}
                                   style={isModal ? { width: containerRef.current?.offsetWidth } : {}}
                              >
                                   {/* Search Input */}
                                   <div className="p-2 border-b border-gray-50 sticky top-0 bg-white z-10">
                                        <div className="relative">
                                             <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                             <input
                                                  ref={searchInputRef}
                                                  type="text"
                                                  value={searchTerm}
                                                  onChange={(e) => setSearchTerm(e.target.value)}
                                                  placeholder="Search..."
                                                  className="w-full bg-gray-50 text-sm rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400 text-gray-700"
                                                  onClick={(e) => e.stopPropagation()}
                                             />
                                        </div>
                                   </div>

                                   <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent p-1">
                                        {filteredOptions.length > 0 ? (
                                             filteredOptions.map((option) => (
                                                  <button
                                                       key={option.value}
                                                       type="button"
                                                       name={name}
                                                       onClick={() => handleSelect(option.value, name)}
                                                       className={`w-full px-3 py-2.5 text-left flex items-center justify-between rounded-xl transition-all mb-0.5 last:mb-0 ${value === option.value
                                                            ? "bg-primary/5 text-primary font-bold"
                                                            : "text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900"
                                                            }`}
                                                  >
                                                       <span className="text-sm truncate pr-2">
                                                            {option.label}
                                                       </span>
                                                       {value === option.value && (
                                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex-shrink-0">
                                                                 <MdCheck size={16} className="text-primary" />
                                                            </motion.div>
                                                       )}
                                                  </button>
                                             ))
                                        ) : (
                                             <div className="px-4 py-8 text-center flex flex-col items-center justify-center text-gray-400">
                                                  <MdSearch size={24} className="opacity-20 mb-2" />
                                                  <span className="text-xs font-medium">No options found</span>
                                             </div>
                                        )}
                                   </div>
                              </motion.div>
                         )}
                    </AnimatePresence>
               </div>

               {error && (
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider ml-1 animate-pulse">
                         {error}
                    </p>
               )}
          </div>
     );
}
