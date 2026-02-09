"use client";

import { useState, useEffect } from "react";
import { adminFetch } from "@/lib/admin/adminFetch";
import toast from "react-hot-toast";
import { MdArrowBack, MdLocalShipping, MdPerson, MdPayment, MdDateRange, MdInventory2, MdCheckCircle, MdCancel } from "react-icons/md";
import AdminStatusBadge from "@/components/admin/common/AdminStatusBadge";
import { useSettings } from "@/context/SettingsContext";
import Loader from "@/components/admin/common/Loader";

export default function OrderDetailView({ orderId, onBack, refreshList }) {
     const { settings } = useSettings();
     const [order, setOrder] = useState(null);
     const [loading, setLoading] = useState(true);

     // Shipment Modal State
     const [isShipModalOpen, setIsShipModalOpen] = useState(false);
     const [shipMode, setShipMode] = useState("Local"); // Local | Shiprocket

     // Local Shipment Form
     const [localDetails, setLocalDetails] = useState({
          courierName: "",
          courierPhone: "",
          trackingId: "",
          trackingUrl: ""
     });

     useEffect(() => {
          if (orderId) fetchOrder();
     }, [orderId]);

     const fetchOrder = async () => {
          setLoading(true);
          try {
               const res = await adminFetch(`/api/admin/orders?orderId=${orderId}`);
               if (res.success && res.data && res.data.length > 0) {
                    setOrder(res.data[0]);
               } else {
                    toast.error("Order not found");
                    if (onBack) onBack();
               }
          } catch (error) {
               toast.error("Failed to load order");
          } finally {
               setLoading(false);
          }
     };

     const handleStatusUpdate = async (newStatus) => {
          const toastId = toast.loading(`Updating order status...`);
          try {
               const res = await adminFetch(`/api/admin/orders?orderId=${orderId}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ status: newStatus })
               });
               if (res.success) {
                    toast.success(`Order marked as ${newStatus}`, { id: toastId });
                    fetchOrder();
                    if (refreshList) refreshList();
               } else {
                    toast.error(res.error || "Update failed", { id: toastId });
               }
          } catch (error) {
               toast.error("Failed to update status", { id: toastId });
          }
     };

     const handleCancelOrder = async () => {
          if (!confirm("Are you sure you want to cancel this order? Stock will be restored.")) return;

          const toastId = toast.loading("Cancelling order...");
          try {
               const res = await adminFetch(`/api/admin/orders?orderId=${orderId}`, {
                    method: 'DELETE'
               });
               if (res.success) {
                    toast.success("Order cancelled", { id: toastId });
                    if (onBack) onBack();
                    if (refreshList) refreshList();
               } else {
                    toast.error(res.error || "Cancellation failed", { id: toastId });
               }
          } catch (error) {
               toast.error("Failed to cancel", { id: toastId });
          }
     };

     const handleShipOrder = async () => {
          if (shipMode === "Local") {
               if (!localDetails.courierName) return toast.error("Courier Name is required");
          }

          const toastId = toast.loading("Creating Shipment...");
          try {
               const payload = {
                    mode: shipMode,
                    ...localDetails
               };

               const res = await adminFetch(`/api/admin/orders/${orderId}/ship`, {
                    method: "POST",
                    body: JSON.stringify(payload)
               });

               if (res.success) {
                    toast.success("Order Shipped!", { id: toastId });
                    setIsShipModalOpen(false);
                    fetchOrder();
                    if (refreshList) refreshList();
                    setLocalDetails({
                         courierName: "",
                         courierPhone: "",
                         trackingId: "",
                         trackingUrl: ""
                    });
                    setShipMode("Local");
               } else {
                    toast.error(res.error || "Shipment failed", { id: toastId });
                    setIsShipModalOpen(false);
               }
          } catch (error) {
               toast.error("An error occurred", { id: toastId });
               setIsShipModalOpen(false);
          }
     };

     if (loading) return (
          <div className="p-20 text-center flex flex-col items-center justify-center">
               <Loader size="large" />
               <p className="mt-4 text-gray-500 font-medium">Loading Order Details...</p>
          </div>
     );
     if (!order) return null;

     return (
          <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10 px-4 md:px-0">
               {/* Top Navigation & Title */}
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                         {onBack && (
                              <button
                                   onClick={onBack}
                                   className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-sm font-medium mb-2"
                              >
                                   <MdArrowBack /> Back
                              </button>
                         )}
                         <div className="flex items-center gap-3">
                              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                                   Order #{order._id.slice(-8).toUpperCase()}
                              </h1>
                              <AdminStatusBadge status={order.status} />
                         </div>
                         <p className="text-gray-500 text-sm">
                              Placed on {new Date(order.createdAt).toLocaleString()}
                         </p>
                    </div>

                    {/* Primary Actions */}
                    <div className="flex flex-wrap gap-3">
                         {order.status === 'Pending' && (
                              <>
                                   <button
                                        onClick={() => handleStatusUpdate('Processing')}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all font-medium"
                                   >
                                        <MdInventory2 size={18} /> Mark Processing
                                   </button>
                                   <button
                                        onClick={handleCancelOrder}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-all font-medium hover:border-red-300"
                                   >
                                        <MdCancel size={18} /> Cancel
                                   </button>
                              </>
                         )}
                         {['Processing', 'Shipped'].includes(order.status) && (
                              <button
                                   onClick={() => {
                                        setIsShipModalOpen(true);
                                        if (order.deliveryDetails) {
                                             setShipMode(order.deliveryDetails.mode || "Local");
                                             setLocalDetails({
                                                  courierName: order.deliveryDetails.courierName || "",
                                                  courierPhone: order.deliveryDetails.courierPhone || "",
                                                  trackingId: order.deliveryDetails.trackingId || "",
                                                  trackingUrl: order.deliveryDetails.trackingUrl || ""
                                             });
                                        }
                                   }}
                                   className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all font-medium"
                              >
                                   <MdLocalShipping size={20} /> {order.status === 'Shipped' ? 'Update Shipment' : 'Ship Order'}
                              </button>
                         )}
                         {order.status === 'Shipped' && (
                              <button
                                   onClick={() => handleStatusUpdate('Delivered')}
                                   className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all font-medium"
                              >
                                   <MdCheckCircle size={20} /> Mark Delivered
                              </button>
                         )}
                    </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Items & Financials */}
                    <div className="lg:col-span-2 space-y-6">
                         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                              <div className="px-6 py-5 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                                   <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                        <MdInventory2 className="text-gray-400" /> Order Items
                                   </h3>
                                   <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                                        {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}
                                   </span>
                              </div>
                              <div className="divide-y divide-gray-50">
                                   {order.items.map((item, idx) => (
                                        <div key={idx} className="p-6 flex flex-col sm:flex-row gap-6 hover:bg-gray-50/30 transition-colors">
                                             <div className="w-24 h-24 bg-gray-100 rounded-xl flex-shrink-0 border border-gray-100 overflow-hidden relative group self-center sm:self-auto">
                                                  {item.productSnapshot?.image ? (
                                                       <img
                                                            src={item.productSnapshot.image}
                                                            alt={item.productSnapshot.name}
                                                            className="w-full h-full object-contain p-2 mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                                                       />
                                                  ) : (
                                                       <div className="flex items-center justify-center h-full text-gray-300">
                                                            <MdInventory2 size={24} />
                                                       </div>
                                                  )}
                                             </div>
                                             <div className="flex-1 min-w-0 py-1">
                                                  <div className="flex justify-between items-start mb-2">
                                                       <div>
                                                            <h4 className="font-semibold text-gray-900 text-lg leading-tight mb-1">
                                                                 {item.productSnapshot?.name || "Unknown Product"}
                                                            </h4>
                                                            <p className="text-sm text-gray-500 flex items-center gap-2">
                                                                 <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">
                                                                      {item.productSnapshot?.variantName || "Standard"}
                                                                 </span>
                                                                 {item.productSnapshot?.sku && (
                                                                      <span className="text-xs text-gray-400 font-mono">
                                                                           SKU: {item.productSnapshot.sku}
                                                                      </span>
                                                                 )}
                                                            </p>
                                                       </div>
                                                       <div className="text-right">
                                                            <p className="font-bold text-gray-900 text-lg">
                                                                 {settings.currency.symbol}{(item.price * item.quantity).toFixed(2)}
                                                            </p>
                                                       </div>
                                                  </div>
                                                  <div className="flex items-center justify-between mt-4">
                                                       <div className="text-sm text-gray-500 font-medium">
                                                            {item.quantity} x {settings.currency.symbol}{item.price.toFixed(2)}
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>
                                   ))}
                              </div>

                              {/* Order Financials Footer */}
                              <div className="bg-gray-50/50 p-6 space-y-3 border-t border-gray-100">
                                   <div className="flex justify-between text-sm text-gray-600">
                                        <span>Subtotal</span>
                                        <span className="font-medium">{settings.currency.symbol}{order.totalAmount?.toFixed(2)}</span>
                                   </div>
                                   <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-200">
                                        <span>Grand Total</span>
                                        <span className="text-xl text-primary">{settings.currency.symbol}{order.totalAmount?.toFixed(2)}</span>
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Sidebar - Customer & Logistics */}
                    <div className="space-y-6">
                         {/* Customer Card */}
                         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                              <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
                                   <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                        <MdPerson className="text-primary" /> Customer Details
                                   </h3>
                              </div>
                              <div className="p-6 space-y-4">
                                   <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                                             {order.customer?.name?.charAt(0) || <MdPerson />}
                                        </div>
                                        <div>
                                             <p className="font-semibold text-gray-900">{order.customer?.name || "Guest User"}</p>
                                             <p className="text-sm text-gray-500 mt-0.5">{order.customer?.email}</p>
                                             <p className="text-sm text-gray-500">{order.customer?.phone}</p>
                                        </div>
                                   </div>

                                   <div className="pt-4 border-t border-gray-50 mt-2">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Shipping Address</p>
                                        <div className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                                             {order.customer?.address?.street}<br />
                                             {order.customer?.address?.city}, {order.customer?.address?.state}<br />
                                             <span className="font-medium text-gray-900">{order.customer?.address?.pincode}</span>
                                        </div>
                                   </div>
                              </div>
                         </div>

                         {/* Logistics & Payment Card */}
                         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                              <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
                                   <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                        <MdLocalShipping className="text-primary" /> Logistics & Payment
                                   </h3>
                              </div>
                              <div className="p-6 space-y-5">
                                   <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                             <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Payment</p>
                                             <div className="font-medium text-gray-900 flex items-center gap-2">
                                                  <span className={`w-2 h-2 rounded-full ${order.paymentStatus === 'Paid' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                                                  {order.paymentStatus}
                                             </div>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                             <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Method</p>
                                             <p className="font-medium text-gray-900 text-xs sm:text-sm">{order.paymentDetails?.method}</p>
                                        </div>
                                   </div>

                                   {order.deliveryDetails?.mode ? (
                                        <div className="pt-2">
                                             <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Delivery Information</p>
                                             <div className="relative pl-4 border-l-2 border-primary/20 space-y-4">
                                                  <div>
                                                       <p className="text-xs text-gray-400 mb-0.5">Mode</p>
                                                       <p className="text-sm font-medium text-gray-900">{order.deliveryDetails.mode}</p>
                                                  </div>
                                                  {order.deliveryDetails.courierName && (
                                                       <div>
                                                            <p className="text-xs text-gray-400 mb-0.5">Courier / Partner</p>
                                                            <p className="text-sm font-medium text-gray-900">{order.deliveryDetails.courierName}</p>
                                                       </div>
                                                  )}
                                                  {order.deliveryDetails.trackingId && (
                                                       <div>
                                                            <p className="text-xs text-gray-400 mb-0.5">Tracking ID</p>
                                                            <p className="text-sm font-mono font-medium text-primary select-all bg-primary/5 inline-block px-1 rounded">
                                                                 {order.deliveryDetails.trackingId}
                                                            </p>
                                                       </div>
                                                  )}
                                             </div>
                                        </div>
                                   ) : (
                                        <div className="text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                             <p className="text-sm text-gray-400 italic">No delivery information yet.</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               {/* Shipping Modal */}
               {isShipModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                         <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsShipModalOpen(false)} />
                         <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-0 animate-in zoom-in-95 duration-200 overflow-hidden">
                              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                   <h2 className="text-lg font-bold text-gray-900">Ship Order</h2>
                                   <button onClick={() => setIsShipModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                        <MdCancel size={22} />
                                   </button>
                              </div>

                              <div className="p-6 space-y-5">
                                   <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Mode</label>
                                        <div className="flex gap-3">
                                             <button
                                                  onClick={() => setShipMode("Local")}
                                                  className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${shipMode === "Local"
                                                       ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                                                       : "bg-white text-gray-600 border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                                                       }`}
                                             >
                                                  <MdLocalShipping /> Local Courier
                                             </button>
                                             <button
                                                  onClick={() => setShipMode("Shiprocket")}
                                                  className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${shipMode === "Shiprocket"
                                                       ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                                                       : "bg-white text-gray-600 border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                                                       }`}
                                             >
                                                  <MdCheckCircle /> Shiprocket
                                             </button>
                                        </div>
                                   </div>

                                   {shipMode === "Local" && (
                                        <div className="space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-100 animate-in slide-in-from-top-2 duration-200">
                                             <div>
                                                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Courier Name <span className="text-red-500">*</span></label>
                                                  <input
                                                       type="text"
                                                       className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm shadow-sm"
                                                       value={localDetails.courierName}
                                                       onChange={(e) => setLocalDetails({ ...localDetails, courierName: e.target.value })}
                                                       placeholder="e.g. Dunzo / Uber / In-house"
                                                  />
                                             </div>
                                             <div>
                                                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                                                  <input
                                                       type="text"
                                                       className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm shadow-sm"
                                                       value={localDetails.courierPhone}
                                                       onChange={(e) => setLocalDetails({ ...localDetails, courierPhone: e.target.value })}
                                                       placeholder="Driver Contact"
                                                  />
                                             </div>
                                             <div className="grid grid-cols-2 gap-4">
                                                  <div>
                                                       <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tracking ID</label>
                                                       <input
                                                            type="text"
                                                            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm shadow-sm"
                                                            value={localDetails.trackingId}
                                                            onChange={(e) => setLocalDetails({ ...localDetails, trackingId: e.target.value })}
                                                            placeholder="Reference #"
                                                       />
                                                  </div>
                                                  <div>
                                                       <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tracking URL</label>
                                                       <input
                                                            type="text"
                                                            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm shadow-sm"
                                                            value={localDetails.trackingUrl}
                                                            onChange={(e) => setLocalDetails({ ...localDetails, trackingUrl: e.target.value })}
                                                            placeholder="https://..."
                                                       />
                                                  </div>
                                             </div>
                                        </div>
                                   )}

                                   {shipMode === "Shiprocket" && (
                                        <div className="p-5 rounded-xl bg-orange-50 border border-orange-100 text-orange-800 text-sm flex gap-3 items-start animate-in slide-in-from-top-2 duration-200">
                                             <MdInventory2 className="flex-shrink-0 mt-0.5" size={18} />
                                             <div>
                                                  <p className="font-bold mb-1">Coming Soon: Shiprocket Integration</p>
                                                  <p className="text-xs opacity-90 leading-relaxed">
                                                       Direct AWB generation and pickup scheduling will be available here. Ensure your API keys are configured in settings.
                                                  </p>
                                             </div>
                                        </div>
                                   )}
                              </div>

                              <div className="flex gap-3 justify-end px-6 py-4 bg-gray-50 border-t border-gray-100">
                                   <button
                                        onClick={() => setIsShipModalOpen(false)}
                                        className="px-5 py-2.5 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors text-sm font-semibold"
                                   >
                                        Cancel
                                   </button>
                                   <button
                                        onClick={handleShipOrder}
                                        className="px-6 py-2.5 rounded-lg bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all text-sm font-semibold transform hover:-translate-y-0.5"
                                   >
                                        Confirm & Ship
                                   </button>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
}
