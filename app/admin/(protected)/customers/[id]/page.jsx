"use client";

import { useState, useEffect } from "react";
import { adminFetch } from "@/lib/adminFetch";
import {
     MdArrowBack, MdPerson, MdMail, MdPhone, MdLocationOn,
     MdHistory, MdPayment, MdAccountBalanceWallet, MdTrendingUp,
     MdCheckCircle, MdSchedule, MdCancel, MdLocalShipping
} from "react-icons/md";
import toast from "react-hot-toast";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import AdminTabs from "@/components/admin/common/AdminTabs";
import AdminCard from "@/components/admin/common/AdminCard";
import AdminTable from "@/components/admin/common/AdminTable";
import AdminStatusBadge from "@/components/admin/common/AdminStatusBadge";

export default function CustomerDetailPage() {
     const { id } = useParams();
     const { settings } = useSettings();
     const [loading, setLoading] = useState(true);
     const [activeTab, setActiveTab] = useState("Basic Details");
     const [data, setData] = useState({ profile: {}, orders: [], stats: {} });

     useEffect(() => {
          fetchDetails();
     }, [id]);

     const fetchDetails = async () => {
          setLoading(true);
          try {
               const result = await adminFetch(`/api/admin/customers/${id}`);
               if (result.success) {
                    setData(result.data);
               } else {
                    toast.error(result.error || "Failed to load details");
               }
          } catch (e) {
               if (e.message !== 'Unauthorized - Redirecting to login') {
                    toast.error(e.message || "Network error");
               }
          } finally {
               setLoading(false);
          }
     };

     if (loading) {
          return (
               <div className="space-y-8 animate-pulse">
                    <div className="h-20 bg-gray-100 rounded-3xl w-1/2"></div>
                    <div className="h-12 bg-gray-50 rounded-2xl w-full"></div>
                    <div className="h-96 bg-gray-50 rounded-[2.5rem]"></div>
               </div>
          );
     }

     const tabs = ["Basic Details", "Orders List", "Financials"];

     return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
               <div className="flex items-center gap-4">
                    <Link
                         href="/admin/customers"
                         className="p-3 bg-white text-gray-400 hover:text-purple-600 rounded-xl shadow-sm border border-gray-50 transition-all hover:shadow-md"
                    >
                         <MdArrowBack size={20} />
                    </Link>
                    <AdminPageHeader
                         title={data.profile.name}
                         description={`Patron ID: ${id.slice(-8).toUpperCase()} • Joined ${new Date(data.profile.createdAt).toLocaleDateString()}`}
                    />
               </div>

               <AdminTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

               <div className="animate-in fade-in duration-500">
                    {activeTab === "Basic Details" && (
                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                              <AdminCard className="lg:col-span-2">
                                   <div className="flex items-center gap-4 mb-8">
                                        <div className="w-20 h-20 rounded-full bg-bg-color flex items-center justify-center text-3xl font-bold text-primary mb-4">
                                             <MdPerson size={24} />
                                        </div>
                                        <div>
                                             <h3 className="text-xl font-bold text-gray-900 leading-none">Identity Profile</h3>
                                             <p className="text-sm text-gray-400 mt-1">Core relationship credentials</p>
                                        </div>
                                   </div>

                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <DetailItem icon={MdPerson} label="Full Legal Name" value={data.profile.name} />
                                        <DetailItem icon={MdMail} label="Verified Email Address" value={data.profile.email} />
                                        <DetailItem icon={MdPhone} label="Contact Telephony" value={data.profile.phone || "Not Provided"} />
                                        <DetailItem icon={MdLocationOn} label="Standard Shipping Address" value={data.profile.address || "No primary address recorded"} isFullWidth />
                                   </div>
                              </AdminCard>

                              <AdminCard className="bg-gradient-to-br from-primary to-primary/80 text-white border-none shadow-gray-200">
                                   <div className="space-y-8 h-full flex flex-col justify-between">
                                        <div>
                                             <div className="flex justify-between items-start">
                                                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white">
                                                       <MdTrendingUp size={24} />
                                                  </div>
                                                  <div className="text-right">
                                                       <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">Loyalty Tier</p>
                                                       <p className="text-sm font-light mt-1 text-white">Platinum Patron</p>
                                                  </div>
                                             </div>
                                             <div className="mt-8">
                                                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-none">Lifetime Valuation</p>
                                                  <p className="text-4xl font-light mt-2 tracking-tighter">
                                                       {settings.currency.symbol}{data.stats.totalSpent.toFixed(2)}
                                                  </p>
                                             </div>
                                        </div>
                                        <div className="pt-8 border-t border-white/10 flex justify-between items-center text-[10px] uppercase font-bold tracking-[0.2em] text-white/60">
                                             <span>Consistency: 98%</span>
                                             <span>Ranked #14</span>
                                        </div>
                                   </div>
                              </AdminCard>
                         </div>
                    )}

                    {activeTab === "Orders List" && (
                         <AdminTable
                              headers={[
                                   { label: "Ref" },
                                   { label: "Date" },
                                   { label: "Valuation" },
                                   { label: "Flow State" },
                                   { label: "Payment" },
                                   { label: "Actions", align: "right" }
                              ]}
                              emptyMessage="This patron has not initiated any transactions."
                         >
                              {data.orders.map((order) => (
                                   <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6 font-mono text-xs text-gray-800">{order._id.slice(-8).toUpperCase()}</td>
                                        <td className="px-8 py-6 text-xs text-gray-400 font-light">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="px-8 py-6 font-light">{settings.currency.symbol}{order.totalAmount.toFixed(2)}</td>
                                        <td className="px-8 py-6">
                                             <AdminStatusBadge status={order.status} />
                                        </td>
                                        <td className="px-8 py-6">
                                             <span className={`text-[10px] font-bold uppercase tracking-widest ${order.paymentStatus === 'Paid' ? 'text-emerald-500' : 'text-orange-500'
                                                  }`}>
                                                  {order.paymentStatus}
                                             </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                             <Link
                                                  href={`/admin/orders/all?id=${order._id}`}
                                                  className="p-2 text-gray-300 hover:text-primary transition-colors"
                                             >
                                                  <MdVisibility size={18} />
                                             </Link>
                                        </td>
                                   </tr>
                              ))}
                         </AdminTable>
                    )}

                    {activeTab === "Financials" && (
                         <div className="space-y-8">
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                   <FinancialBox
                                        icon={MdAccountBalanceWallet}
                                        color="bg-bg-color text-primary"
                                        label="Gross Valuation"
                                        value={`${settings.currency.symbol}${data.stats.totalSpent.toFixed(2)}`}
                                   />
                                   <FinancialBox
                                        icon={MdCheckCircle}
                                        color="bg-emerald-50 text-emerald-600"
                                        label="Completed Flows"
                                        value={data.stats.successfulOrders}
                                   />
                                   <FinancialBox
                                        icon={MdSchedule}
                                        color="bg-orange-50 text-orange-600"
                                        label="Active Requests"
                                        value={data.stats.pendingOrders}
                                   />
                                   <FinancialBox
                                        icon={MdHistory}
                                        color="bg-bg-color text-primary"
                                        label="Order Velocity"
                                        value={`${data.stats.totalOrders} Tot`}
                                   />
                              </div>

                              <AdminCard>
                                   <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                                             <MdPayment size={24} />
                                        </div>
                                        <div>
                                             <h3 className="text-xl font-bold text-gray-900 leading-none">Currency Distribution</h3>
                                             <p className="text-sm text-gray-400 mt-1">Breakdown of payment methods and success rates</p>
                                        </div>
                                   </div>

                                   <div className="bg-gray-50/50 rounded-3xl p-12 text-center text-gray-400 border border-dashed border-gray-200">
                                        <p className="text-xs uppercase tracking-[0.2em] font-light">Payment Analytics Integration Coming Soon</p>
                                   </div>
                              </AdminCard>
                         </div>
                    )}
               </div>
          </div>
     );
}

function DetailItem({ icon: Icon, label, value, isFullWidth = false }) {
     return (
          <div className={`${isFullWidth ? 'md:col-span-2' : ''} space-y-2`}>
               <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                    <Icon size={12} className="opacity-50" />
                    {label}
               </label>
               <p className="text-sm font-medium text-gray-800 bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                    {value}
               </p>
          </div>
     );
}

function FinancialBox({ icon: Icon, color, label, value }) {
     return (
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center text-center gap-4">
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
                    <Icon size={24} />
               </div>
               <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-2xl font-light text-gray-900">{value}</p>
               </div>
          </div>
     );
}
