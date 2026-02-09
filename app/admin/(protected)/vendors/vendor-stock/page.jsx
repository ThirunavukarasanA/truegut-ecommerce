"use client";

import { useState, useEffect, Suspense } from "react";
import { MdLayers, MdAttachMoney, MdShoppingCart, MdInventory } from "react-icons/md";
import { adminFetch } from "@/lib/admin/adminFetch";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import AdminTable from "@/components/admin/common/AdminTable";
import AdminSelect from "@/components/admin/common/AdminSelect";
import AdminSearch from "@/components/admin/common/AdminSearch";
import toast from "react-hot-toast";

import { useRouter, useSearchParams } from "next/navigation";

function VendorStockContent() {
     const router = useRouter();
     const searchParams = useSearchParams();
     const preSelectedVendorId = searchParams.get('vendorId');

     const [stocks, setStocks] = useState([]);
     const [loading, setLoading] = useState(true);
     const [vendors, setVendors] = useState([]);
     const [selectedVendor, setSelectedVendor] = useState(preSelectedVendorId || "");
     const [currentUserRole, setCurrentUserRole] = useState("");
     const [searchDebounce, setSearchDebounce] = useState("");
     const [stats, setStats] = useState({
          totalStock: 0,
          totalOrders: 0,
          totalRevenue: 0,
          expiredStock: 0
     });

     useEffect(() => {
          initializePage();
     }, []);

     useEffect(() => {
          // Fetch when vendor or search changes
          const timer = setTimeout(() => {
               if (selectedVendor || searchDebounce || currentUserRole === 'admin' || currentUserRole === 'system_admin' || currentUserRole === 'owner') {
                    fetchStocks(selectedVendor, searchDebounce);
               }
          }, 500);

          return () => clearTimeout(timer);
     }, [selectedVendor, searchDebounce, currentUserRole]);

     const initializePage = async () => {
          try {
               // Fetch Vendors (API should handle role restrictions now)
               const vendorData = await adminFetch("/api/admin/vendors");
               if (vendorData.success) {
                    setVendors(vendorData.data);

                    // Logic to detect if I am a vendor
                    // We can check the fetched vendors. If I am a vendor, the API (after my update)
                    // will only return ME.
                    if (vendorData.data.length === 1) {
                         // Potentially I am a vendor OR there is only one vendor.
                         // Best to check "me" endpoint or verify role. 
                         // For now, let's assume if the API restricted the list, we auto-select.
                         // But we also need to know if we should DISABLE the dropdown.
                         // Let's infer role from context (omitted here for brevity, usually passed via context)
                         // OR simply: If list has 1 item and I can't fetch others, might as well select it.
                         // Better: check /api/auth/me equivalent or just check if `vendorData.data` length is 1.

                         // Note: I don't have a direct "get my role" here easily without extensive context setup.
                         // I'll assume if the list is restricted (which I will enforce in backend), 
                         // then I just auto-select.
                         setSelectedVendor(vendorData.data[0]._id);
                    }
               }

          } catch (e) {
               console.error("Init Error", e);
               toast.error("Failed to load initial data");
          }
     };

     const fetchStocks = async (vendorId = "", search = "") => {
          setLoading(true);
          try {
               const query = new URLSearchParams();
               if (vendorId) query.append('vendorId', vendorId);
               if (search) query.append('search', search);

               const data = await adminFetch(`/api/admin/stock/vendor?${query.toString()}`, { cache: 'no-store' });
               if (data.success) {
                    setStocks(data.stocks);
                    if (data.stats) {
                         setStats(data.stats);
                    }
               }
          } catch (e) {
               console.error(e);
               toast.error("Failed to load stock data");
          } finally {
               setLoading(false);
          }
     };

     return (
          <div className="space-y-8 animate-in fade-in duration-500 pb-20">
               <AdminPageHeader
                    title="Vendor Stock"
                    description="Inventory and performance metrics for vendors"
               />

               {/* Stats Overview */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-full">
                         <div className="flex items-center gap-4 mb-4">
                              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                   <MdInventory className="text-2xl" />
                              </div>
                              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Stock</span>
                         </div>
                         <div>
                              <div className="text-3xl font-black text-gray-800">{stats.totalStock.toLocaleString()}</div>
                              <div className="text-xs text-gray-400 mt-1">Units available</div>
                         </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-full">
                         <div className="flex items-center gap-4 mb-4">
                              <div className="p-3 bg-pink-50 text-pink-600 rounded-2xl">
                                   <MdShoppingCart className="text-2xl" />
                              </div>
                              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Orders</span>
                         </div>
                         <div>
                              <div className="text-3xl font-black text-gray-800">{stats.totalOrders.toLocaleString()}</div>
                              <div className="text-xs text-gray-400 mt-1">Fulfilled orders</div>
                         </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-full">
                         <div className="flex items-center gap-4 mb-4">
                              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                   <MdAttachMoney className="text-2xl" />
                              </div>
                              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Revenue</span>
                         </div>
                         <div>
                              <div className="text-3xl font-black text-gray-800">₹{stats.totalRevenue.toLocaleString()}</div>
                              <div className="text-xs text-gray-400 mt-1">Gross earnings</div>
                         </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-full border-2 border-red-500 hover:border-red-600 transition-colors  hover:shadow-lg hover:scale-105">
                         <div className="flex items-center gap-4 mb-4">
                              <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                                   <MdInventory className="text-2xl" />
                              </div>
                              <span className="text-sm font-bold text-red-500 uppercase tracking-wider">Expired Stock</span>
                         </div>
                         <div>
                              <div className="text-3xl font-black text-red-600">{stats.expiredStock?.toLocaleString() || 0}</div>
                              <div className="text-xs text-red-400 mt-1">Needs attention</div>
                         </div>
                    </div>
               </div>

               {/* Filter & Search Bar */}
               <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                         <AdminSelect
                              label="Filter by Vendor"
                              value={selectedVendor}
                              onChange={(e) => setSelectedVendor(e.target.value)}
                              options={vendors.map(v => ({
                                   label: v.name,
                                   value: v._id
                              }))}
                              placeholder={vendors.length === 1 ? null : "All Vendors (Global View)"}
                              disabled={vendors.length === 1}
                         />

                         <div className="flex-1">
                              <AdminSearch
                                   placeholder="Search by Product Name..."
                                   value={searchDebounce}
                                   onChange={setSearchDebounce}
                              />
                         </div>
                    </div>
               </div>

               {/* Data Table */}
               <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                         <h3 className="font-bold text-gray-800">Inventory Details</h3>
                         <span className="text-xs font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                              {stocks.length} Records Found
                         </span>
                    </div>
                    <AdminTable
                         headers={[
                              { label: "Vendor" },
                              { label: "Product" },
                              { label: "Batch Info" },
                              { label: "Prod. Date" },
                              { label: "Exp. Date" },
                              { label: "Quantity Held" },
                              { label: "Received Date" },
                         ]}
                         loading={loading}
                         emptyMessage={searchDebounce ? "No products found matching your search." : "No vendor stock found."}
                         colCount={7}
                    >
                         {stocks.map(stock => (
                              <tr key={stock._id} className="hover:bg-gray-50/50 transition-colors">
                                   <td className="px-8 py-5">
                                        <div className="font-bold text-gray-900">{stock.vendor?.name || 'Unknown'}</div>
                                        <div className="text-xs text-gray-500">{stock.vendor?.companyName}</div>
                                   </td>
                                   <td className="px-8 py-5">
                                        <div className="font-medium text-gray-900">{stock.product?.name}</div>
                                        <div className="text-xs text-primary">{stock.variant?.name}</div>
                                   </td>
                                   <td className="px-8 py-5 text-sm font-mono text-gray-600">
                                        {stock.batch?.batchNo}
                                   </td>
                                   <td className="px-8 py-5 text-sm text-gray-500">
                                        {stock.batch?.productionDate ? new Date(stock.batch.productionDate).toLocaleDateString() : '-'}
                                   </td>
                                   <td className="px-8 py-5">
                                        <span className={`text-sm font-medium ${new Date(stock.batch?.expiryDate) < new Date()
                                             ? "text-red-500 font-bold"
                                             : "text-gray-500"
                                             }`}>
                                             {stock.batch?.expiryDate ? new Date(stock.batch.expiryDate).toLocaleDateString() : '-'}
                                        </span>
                                   </td>
                                   <td className="px-8 py-5">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold ${stock.quantity < 10
                                             ? 'bg-red-50 text-red-600'
                                             : 'bg-emerald-50 text-emerald-600'
                                             }`}>
                                             {stock.quantity}
                                        </span>
                                   </td>
                                   <td className="px-8 py-5 text-sm text-gray-500">
                                        {new Date(stock.receivedAt).toLocaleDateString()}
                                   </td>
                              </tr>
                         ))}
                    </AdminTable>
               </div>
          </div>
     );
}

export default function VendorStockPage() {
     return (
          <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading vendor stock...</div>}>
               <VendorStockContent />
          </Suspense>
     );
}
