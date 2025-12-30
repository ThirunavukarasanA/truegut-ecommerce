"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MdWarning, MdClose, MdAddCircle, MdEdit, MdDeleteForever, MdInfo, MdRemoveCircle } from "react-icons/md";

export default function AdminConfirmModal({
     isOpen,
     onClose,
     onConfirm,
     title = "Are you sure?",
     message = "This action cannot be undone.",
     confirmLabel = "Confirm",
     cancelLabel = "Cancel",
     type = "danger", // danger, warning, info, success
     action = "warning" // create, update, delete, remove, info
}) {
     if (!isOpen) return null;

     const colors = {
          danger: {
               icon: "bg-red-50 text-red-600",
               button: "bg-red-600 hover:bg-red-700 shadow-red-100",
               border: "border-red-100"
          },
          warning: {
               icon: "bg-orange-50 text-orange-600",
               button: "bg-orange-600 hover:bg-orange-700 shadow-orange-100",
               border: "border-orange-100"
          },
          info: {
               icon: "bg-blue-50 text-blue-600",
               button: "bg-blue-600 hover:bg-blue-700 shadow-blue-100",
               border: "border-blue-100"
          },
          success: {
               icon: "bg-emerald-50 text-emerald-600",
               button: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100",
               border: "border-emerald-100"
          }
     };

     const icons = {
          create: <MdAddCircle size={28} />,
          update: <MdEdit size={28} />,
          delete: <MdDeleteForever size={28} />,
          remove: <MdRemoveCircle size={28} />,
          warning: <MdWarning size={28} />,
          info: <MdInfo size={28} />
     };

     const currentColors = colors[type] || colors.danger;
     const currentIcon = icons[action] || icons.warning;

     return (
          <AnimatePresence>
               {isOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                         {/* Backdrop */}
                         <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              onClick={onClose}
                              className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
                         />

                         {/* Modal Card */}
                         <motion.div
                              initial={{ scale: 0.95, opacity: 0, y: 10 }}
                              animate={{ scale: 1, opacity: 1, y: 0 }}
                              exit={{ scale: 0.95, opacity: 0, y: 10 }}
                              className="relative bg-white rounded-[2rem] w-full max-w-sm shadow-2xl border border-gray-100 overflow-hidden"
                         >
                              <div className="p-8">
                                   <div className="flex justify-between items-start mb-6">
                                        <div className={`p-4 rounded-2xl ${currentColors.icon}`}>
                                             {currentIcon}
                                        </div>
                                        <button
                                             onClick={onClose}
                                             className="p-2 text-gray-300 hover:text-gray-900 transition-colors"
                                        >
                                             <MdClose size={20} />
                                        </button>
                                   </div>

                                   <h3 className="text-xl font-light text-gray-800 tracking-tight mb-2">
                                        {title}
                                   </h3>
                                   <p className="text-sm font-light text-gray-500 leading-relaxed">
                                        {message}
                                   </p>
                              </div>

                              <div className="p-8 pt-0 flex gap-3">
                                   <button
                                        onClick={onClose}
                                        className="flex-1 px-6 py-4 bg-gray-50 text-gray-400 font-light rounded-2xl hover:bg-gray-100 hover:text-gray-600 transition-all uppercase text-[10px] tracking-widest"
                                   >
                                        {cancelLabel}
                                   </button>
                                   <button
                                        onClick={() => {
                                             onConfirm();
                                             onClose();
                                        }}
                                        className={`flex-1 px-6 py-4 text-white font-light rounded-2xl transition-all shadow-xl uppercase text-[10px] tracking-widest ${currentColors.button}`}
                                   >
                                        {confirmLabel}
                                   </button>
                              </div>
                         </motion.div>
                    </div>
               )}
          </AnimatePresence>
     );
}
