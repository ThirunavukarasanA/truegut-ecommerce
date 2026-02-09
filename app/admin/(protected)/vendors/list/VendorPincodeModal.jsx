"use client";

import { useEffect, useState } from "react";
import { MdClose, MdMap, MdSearch } from "react-icons/md";

export default function VendorPincodeModal({ isOpen, onClose, vendor }) {
     const [search, setSearch] = useState("");
     const [pincodes, setPincodes] = useState([]);

     useEffect(() => {
          if (vendor && vendor.serviceablePincodes) {
               setPincodes(vendor.serviceablePincodes);
          } else {
               setPincodes([]);
          }
          setSearch("");
     }, [vendor, isOpen]);

     if (!isOpen || !vendor) return null;

     const filteredPincodes = pincodes.filter(p => p.includes(search));

     return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
               <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">

                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                         <div>
                              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                   <MdMap className="text-primary" />
                                   Service Area
                              </h2>
                              <p className="text-sm text-gray-500 mt-1">
                                   {vendor.name} covers {pincodes.length} pincodes
                              </p>
                         </div>
                         <button
                              onClick={onClose}
                              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-800"
                         >
                              <MdClose size={24} />
                         </button>
                    </div>

                    {/* Search */}
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                         <div className="relative">
                              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                              <input
                                   type="text"
                                   placeholder="Search pincode..."
                                   className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                   value={search}
                                   onChange={(e) => setSearch(e.target.value)}
                              />
                         </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto p-4">
                         {filteredPincodes.length > 0 ? (
                              <div className="grid grid-cols-3 gap-3">
                                   {filteredPincodes.map((code, index) => (
                                        <div key={index} className="px-3 py-2 bg-gray-50 rounded-lg text-center text-sm font-medium text-gray-700 border border-gray-100">
                                             {code}
                                        </div>
                                   ))}
                              </div>
                         ) : (
                              <div className="text-center py-8 text-gray-500">
                                   {search ? `No pincodes match "${search}"` : "No pincodes assigned to this vendor."}
                              </div>
                         )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50/30 text-center">
                         <button
                              onClick={onClose}
                              className="px-6 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                         >
                              Close
                         </button>
                    </div>
               </div>
          </div>
     );
}
