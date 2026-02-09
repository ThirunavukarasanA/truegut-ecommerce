"use client";
import { useState } from 'react';
import { MdClose, MdNotificationsActive } from 'react-icons/md';
import { BiLoaderAlt } from 'react-icons/bi';
import { toast } from 'react-hot-toast';
import { useLocation } from "@/context/LocationContext";

export default function RestockModal({ isOpen, onClose, product, variant, onSubmitSuccess }) {
     const { vendorId, pincode, postOffice } = useLocation();
     const [formData, setFormData] = useState({
          name: '',
          email: '',
          phone: ''
     });
     const [loading, setLoading] = useState(false);

     if (!isOpen) return null;

     const handleSubmit = async (e) => {
          e.preventDefault();
          setLoading(true);

          try {
               const res = await fetch('/api/restock-requests', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                         productId: product._id,
                         variantId: variant._id,
                         ...formData,
                         pincode,
                         postOffice,
                         vendorId
                    })
               });

               const data = await res.json();
               if (data.success) {
                    toast.success(data.message);
                    onSubmitSuccess();
                    onClose();
               } else {
                    toast.error(data.error || 'Something went wrong');
               }
          } catch (error) {
               toast.error('Failed to submit request');
          } finally {
               setLoading(false);
          }
     };

     return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
               <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-slideUp">
                    <div className="p-6">
                         <div className="flex justify-between items-center mb-6">
                              <div className="flex items-center gap-2 text-amber-600">
                                   <MdNotificationsActive size={20} />
                                   <h3 className="text-xl font-bold">Stock Request</h3>
                              </div>
                              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                   <MdClose size={20} className="text-gray-500" />
                              </button>
                         </div>

                         <div className="mb-6">
                              <p className="text-gray-600 text-sm">
                                   Enter your details to request stock for <strong>{product.name} ({variant.name})</strong>.
                              </p>
                         </div>

                         <form onSubmit={handleSubmit} className="space-y-4">
                              <div>
                                   <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Name</label>
                                   <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                                        placeholder="Your Name"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                   />
                              </div>
                              <div>
                                   <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email</label>
                                   <input
                                        type="email"
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                   />
                              </div>
                              <div>
                                   <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone (Optional)</label>
                                   <input
                                        type="tel"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                                        placeholder="+91 ...."
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                   />
                              </div>

                              <button
                                   type="submit"
                                   disabled={loading}
                                   className="w-full bg-amber-500 text-white font-bold py-3.5 rounded-xl uppercase tracking-wider hover:bg-amber-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                              >
                                   {loading ? <BiLoaderAlt className="animate-spin" size={20} /> : 'Submit Request'}
                              </button>
                         </form>
                    </div>
               </div>
          </div>
     );
}
