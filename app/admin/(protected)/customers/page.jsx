"use client";

import { useState, useEffect } from "react";
import { adminFetch } from "@/lib/admin/adminFetch";
import { MdSearch, MdVisibility, MdPerson, MdMail, MdPhone, MdCalendarToday } from "react-icons/md";
import toast from "react-hot-toast";
import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import AdminSearch from "@/components/admin/common/AdminSearch";
import AdminTable from "@/components/admin/common/AdminTable";

export default function CustomersPage() {
     const { settings } = useSettings();
     const [customers, setCustomers] = useState([]);
     const [loading, setLoading] = useState(true);
     const [search, setSearch] = useState("");

     useEffect(() => {
          fetchCustomers();
     }, []);

     const fetchCustomers = async () => {
          setLoading(true);
          try {
               const data = await adminFetch('/api/admin/customers');
               if (data.success) {
                    setCustomers(data.data || []);
               }
          } catch (e) {
               if (e.message !== 'Unauthorized - Redirecting to login') {
                    toast.error(e.message || "Failed to load customers");
               }
          } finally {
               setLoading(false);
          }
     };

     const filteredCustomers = customers.filter(c =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase()) ||
          c.phone?.includes(search)
     );

     const tableHeaders = [
          { label: "Customer Profile" },
          { label: "Contact Intelligence" },
          { label: "Acquisition Date" },
          { label: "Order Count" },
          { label: "LTV (Lifetime Value)" },
          { label: "Actions", align: "right" }
     ];

     return (
          <div className="space-y-10 animate-in fade-in duration-700">
               <AdminPageHeader
                    title="Customer Intelligence"
                    description="Monitor patron behavior, acquisition metrics, and relationship health."
               />

               {/* Search & Stats Summary */}
               <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                    <AdminSearch
                         value={search}
                         onChange={setSearch}
                         placeholder="Search patrons by identity or contact..."
                         className="w-full lg:w-[32rem]"
                    />

                    <div className="flex gap-4">
                         <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-bg-color flex items-center justify-center text-primary">
                                   <MdPerson size={20} />
                              </div>
                              <div>
                                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Total Patrons</p>
                                   <p className="text-xl font-light text-gray-900 mt-1">{customers.length}</p>
                              </div>
                         </div>
                    </div>
               </div>

               <AdminTable
                    headers={tableHeaders}
                    loading={loading}
                    loadingMessage="Analyzing Patron Data..."
                    emptyMessage="No customer records found matching sequence."
               >
                    {filteredCustomers.map((customer) => (
                         <tr key={customer._id} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-8 py-6">
                                   <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-bg-color to-gray-50 border border-gray-100 flex items-center justify-center text-primary font-bold text-sm">
                                             {customer.name.charAt(0)}
                                        </div>
                                        <div>
                                             <p className="font-light text-gray-800 text-sm tracking-tight group-hover:text-primary transition-colors uppercase font-medium">{customer.name}</p>
                                             <div className="flex items-center gap-1.5 mt-1.5">
                                                  <MdMail className="text-gray-300" size={12} />
                                                  <p className="text-[10px] text-gray-400 font-light uppercase tracking-widest leading-none">{customer.email}</p>
                                             </div>
                                        </div>
                                   </div>
                              </td>
                              <td className="px-8 py-6">
                                   <div className="flex items-center gap-2 text-gray-400">
                                        <MdPhone size={14} />
                                        <span className="text-xs font-light">{customer.phone || "N/A"}</span>
                                   </div>
                              </td>
                              <td className="px-8 py-6">
                                   <div className="flex items-center gap-2 text-gray-400">
                                        <MdCalendarToday size={14} />
                                        <span className="text-[10px] uppercase tracking-widest font-light">{new Date(customer.createdAt).toLocaleDateString()}</span>
                                   </div>
                              </td>
                              <td className="px-8 py-6">
                                   <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-[10px] font-bold tracking-widest">
                                        {customer.orderCount || 0} ORDERS
                                   </span>
                              </td>
                              <td className="px-8 py-6">
                                   <p className="font-light text-gray-900 text-base">
                                        {settings.currency.symbol}{parseFloat(customer.totalSpent || 0).toFixed(2)}
                                   </p>
                              </td>
                              <td className="px-8 py-6 text-right">
                                   <Link
                                        href={`/admin/customers/${customer._id}`}
                                        className="inline-flex p-3 bg-white text-gray-400 hover:text-primary rounded-xl shadow-sm border border-gray-50 transition-all hover:shadow-md active:scale-95"
                                        title="Deep Intelligence Review"
                                   >
                                        <MdVisibility size={20} />
                                   </Link>
                              </td>
                         </tr>
                    ))}
               </AdminTable>
          </div>
     );
}
