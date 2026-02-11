"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MdLocalShipping } from "react-icons/md";
import { adminFetch } from "@/lib/admin/adminFetch";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import AdminTable from "@/components/admin/common/AdminTable";
import AdminStatusBadge from "@/components/admin/common/AdminStatusBadge";
import AdminSelect from "@/components/admin/common/AdminSelect";
import OrderDetailView from "@/components/admin/orders/OrderDetailView";

export default function VendorOrdersPage() {
     const router = useRouter();
     const [orders, setOrders] = useState([]);
     const [loading, setLoading] = useState(true);
     const [vendors, setVendors] = useState([]);
     const [selectedVendor, setSelectedVendor] = useState("");

     useEffect(() => {
          fetchInitialData();
     }, []);

     useEffect(() => {
          // If vendors loaded (for admin) and selection changes, or initial load
          fetchOrders();
     }, [selectedVendor]);

     const fetchInitialData = async () => {
          try {
               const vendorData = await adminFetch("/api/admin/vendors");
               if (vendorData.success) {
                    setVendors(vendorData.data);
                    // Auto-select if single vendor (Vendor Role)
                    if (vendorData.data.length === 1) {
                         setSelectedVendor(vendorData.data[0]._id);
                    }
               }
          } catch (e) {
               console.error("Init Error", e);
          }
     };

     const fetchOrders = async () => {
          setLoading(true);
          try {
               const query = selectedVendor ? `?vendorId=${selectedVendor}` : "";
               const data = await adminFetch(`/api/vendor/orders${query}`);
               if (data.success) {
                    setOrders(data.orders);
               }
          } catch (e) {
               console.error(e);
          } finally {
               setLoading(false);
          }
     };

     return (
          <div className="space-y-8 animate-in fade-in duration-500 pb-20 relative">
               <AdminPageHeader
                    title="Vendor Orders"
                    description="Manage fulfillment and track logistics"
               />

               {/* Vendor Scope Selection */}
               <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm max-w-sm">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Vendor Scope</h3>
                    <AdminSelect
                         label="Select Vendor"
                         value={selectedVendor}
                         onChange={(e) => setSelectedVendor(e.target.value)}
                         options={vendors.map(v => ({
                              label: v.name,
                              value: v._id
                         }))}
                         placeholder={vendors.length === 1 ? null : "All Vendors"}
                         disabled={vendors.length === 1}
                    />
               </div>

               <AdminTable
                    headers={[
                         { label: "Order ID" },
                         { label: "Customer" },
                         { label: "Status" },
                         { label: "Items" },
                         { label: "Delivery Status" },
                         { label: "Actions", align: "right" }
                    ]}
                    loading={loading}
                    emptyMessage="No orders found."
                    colCount={6}
               >
                    {orders.map(order => (
                         <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-8 py-5 font-mono text-sm text-gray-500">
                                   #{order._id.slice(-6).toUpperCase()}
                              </td>
                              <td className="px-8 py-5">
                                   <div className="font-medium text-gray-900">{order.customer?.name || "Guest"}</div>
                                   <div className="text-xs text-gray-500">{order.customer?.address?.city}</div>
                              </td>
                              <td className="px-8 py-5">
                                   <AdminStatusBadge status={order.status} />
                              </td>
                              <td className="px-8 py-5 text-sm">
                                   {order.items?.length} Items
                              </td>
                              <td className="px-8 py-5">
                                   {order.deliveryDetails?.trackingId ? (
                                        <div className="text-xs">
                                             <span className="font-bold text-gray-700">{order.deliveryDetails.courierName}</span>
                                             <div className="text-primary truncate max-w-[100px]">{order.deliveryDetails.trackingId}</div>
                                        </div>
                                   ) : (
                                        <span className="text-xs text-gray-400 italic">Pending Shipment</span>
                                   )}
                              </td>
                              <td className="px-8 py-5 text-right space-x-2">
                                   <button
                                        onClick={() => router.push(`/admin/orders/vendor/${order._id}`)}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary/90 hover:shadow-md transition-all shadow-sm"
                                   >
                                        View Details
                                   </button>
                              </td>
                         </tr>
                    ))}
               </AdminTable>
          </div>
     );
}
