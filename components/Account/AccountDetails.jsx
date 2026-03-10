import React from "react";
import { FiUser, FiMail, FiMapPin } from "react-icons/fi";

export default function AccountDetails({ user }) {
     return (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm h-fit">
               <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                         <FiUser size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-font-title">Account Details</h2>
               </div>

               <div className="space-y-6">
                    <div className="group">
                         <label className="text-[10px] text-gray-400 uppercase tracking-widest font-black block mb-2 transition-colors group-hover:text-primary">Full Name</label>
                         <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-transparent transition-all group-hover:bg-white group-hover:border-gray-100 group-hover:shadow-sm">
                              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-400 shadow-xs">
                                   <FiUser size={14} />
                              </div>
                              <p className="font-bold text-gray-800">{user.name || "N/A"}</p>
                         </div>
                    </div>

                    <div className="group">
                         <label className="text-[10px] text-gray-400 uppercase tracking-widest font-black block mb-2 transition-colors group-hover:text-primary">Email Address</label>
                         <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-transparent transition-all group-hover:bg-white group-hover:border-gray-100 group-hover:shadow-sm">
                              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-400 shadow-xs">
                                   <FiMail size={14} />
                              </div>
                              <p className="text-gray-600 font-medium truncate">{user.email}</p>
                         </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-gray-50">
                         <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                              <div className="mt-1 text-primary">
                                   <FiMapPin size={16} />
                              </div>
                              <div>
                                   <p className="text-xs font-bold text-gray-800 mb-1">Saved Addresses</p>
                                   <p className="text-[10px] text-gray-500 leading-relaxed italic">
                                        Addresses are securely saved during your checkout process for a faster shopping experience.
                                   </p>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}
