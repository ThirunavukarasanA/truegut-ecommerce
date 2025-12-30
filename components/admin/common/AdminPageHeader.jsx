"use client";

import { MdAdd } from "react-icons/md";

export default function AdminPageHeader({ title, description, primaryAction, secondaryAction }) {
     return (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                    <h2 className="text-2xl font-light text-gray-800 tracking-tight">{title}</h2>
                    {description && <p className="text-gray-400 font-light text-sm mt-1">{description}</p>}
               </div>
               <div className="flex items-center gap-3">
                    {secondaryAction && (
                         <button
                              onClick={secondaryAction.onClick}
                              className="px-6 py-3 bg-white border border-gray-100 text-gray-500 rounded-2xl font-light hover:bg-gray-50 flex items-center gap-2 transition-all shadow-sm text-xs uppercase tracking-widest"
                         >
                              {secondaryAction.icon && <secondaryAction.icon size={18} />}
                              {secondaryAction.label}
                         </button>
                    )}
                    {primaryAction && (
                         <button
                              onClick={primaryAction.onClick}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl font-light shadow-lg shadow-purple-200 transition-all flex items-center gap-2 group"
                         >
                              {primaryAction.icon ? (
                                   <primaryAction.icon size={22} className="group-hover:rotate-90 transition-transform" />
                              ) : (
                                   <MdAdd size={22} className="group-hover:rotate-90 transition-transform" />
                              )}
                              {primaryAction.label}
                         </button>
                    )}
               </div>
          </div>
     );
}
