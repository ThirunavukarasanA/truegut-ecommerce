import React from "react";

export default function ShippingForm({ formData, handleChange, handleBlur, pincode, district }) {
     return (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
               <div className="grid grid-cols-2 gap-4">
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                         <input
                              name="firstName"
                              required
                              className="w-full border border-gray-200 rounded p-2 focus:ring-primary focus:border-primary"
                              value={formData.firstName}
                              onChange={handleChange}
                              onBlur={handleBlur}
                         />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                         <input
                              name="lastName"
                              required
                              className="w-full border border-gray-200 rounded p-2 focus:ring-primary focus:border-primary"
                              value={formData.lastName}
                              onChange={handleChange}
                              onBlur={handleBlur}
                         />
                    </div>
               </div>

               <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                         type="email"
                         name="email"
                         required
                         className="w-full border border-gray-200 rounded p-2 focus:ring-primary focus:border-primary"
                         value={formData.email}
                         onChange={handleChange}
                         onBlur={handleBlur}
                    />
               </div>

               <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                         type="text"
                         inputMode="numeric"
                         name="phone"
                         required
                         maxLength={10}
                         className="w-full border border-gray-200 rounded p-2 focus:ring-primary focus:border-primary"
                         value={formData.phone}
                         onChange={handleChange}
                         onBlur={handleBlur}
                    />
               </div>

               <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                         name="address"
                         required
                         className="w-full border border-gray-200 rounded p-2 focus:ring-primary focus:border-primary"
                         value={formData.address}
                         onChange={handleChange}
                         onBlur={handleBlur}
                    />
               </div>

               <div className="grid grid-cols-2 gap-4">
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                         <input
                              name="city"
                              required
                              className="w-full border border-gray-200 rounded p-2 focus:ring-primary focus:border-primary"
                              value={formData.city}
                              onChange={handleChange}
                              onBlur={handleBlur}
                         />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                         <input
                              name="state"
                              required
                              className="w-full border border-gray-200 rounded p-2 focus:ring-primary focus:border-primary"
                              value={formData.state}
                              onChange={handleChange}
                              onBlur={handleBlur}
                         />
                    </div>
               </div>

               <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                    <input
                         type="text"
                         inputMode="numeric"
                         name="zipLevel"
                         required
                         maxLength={6}
                         className="w-full border border-gray-200 rounded p-2 focus:ring-primary focus:border-primary"
                         value={formData.zipLevel}
                         onChange={handleChange}
                         onBlur={handleBlur}
                         placeholder="6-digit Pincode"
                    />
                    {pincode && formData.zipLevel === pincode && (
                         <p className="text-[10px] text-primary font-bold mt-1 uppercase tracking-wider flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                              Serviceable: {district}
                         </p>
                    )}
               </div>
          </div>
     );
}
