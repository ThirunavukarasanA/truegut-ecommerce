"use client";

import { useState, useEffect } from "react";
import { MdShoppingCart, MdDevices, MdHistory, MdLocationOn ,MdDeleteForever} from "react-icons/md";
import toast from "react-hot-toast";
import { useSettings } from "@/context/SettingsContext";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import AdminTable from "@/components/admin/common/AdminTable";
import AdminStatusBadge from "@/components/admin/common/AdminStatusBadge";

import AdminConfirmModal from "@/components/admin/common/AdminConfirmModal";

export default function TempCartsPage() {
     const { settings } = useSettings();
     const [tempCarts, setTempCarts] = useState([]);
     const [loading, setLoading] = useState(true);
     const [deleteModal, setDeleteModal] = useState({ isOpen: false, cartId: null });

     useEffect(() => {
          fetchTempCarts();
     }, []);

     const fetchTempCarts = async () => {
          try {
               const res = await fetch("/api/admin/temp-carts");
               const data = await res.json();
               if (data.tempCarts) {
                    setTempCarts(data.tempCarts);
               } else {
                    toast.error(data.error || "Failed to load temporary carts");
               }
          } catch (error) {
               toast.error("An error occurred while fetching data");
          } finally {
               setLoading(false);
          }
     };

     const handleConfirmDelete = async () => {
          if (!deleteModal.cartId) return;

          try {
               const res = await fetch(`/api/admin/temp-carts/${deleteModal.cartId}`, { method: "DELETE" });
               const data = await res.json();
               if (data.success) {
                    toast.success("Cart deleted");
                    fetchTempCarts();
               } else {
                    toast.error(data.error);
               }
          } catch (err) {
               toast.error("Failed to delete");
          } finally {
               setDeleteModal({ isOpen: false, cartId: null });
          }
     };

     const tableHeaders = [
          { label: "Session ID" },
          { label: "Items" },
          { label: "Device Info" },
          { label: "IP Address" },
          { label: "Last Activity" },
          { label: "Action" }
     ];

     return (
          <div className="space-y-6 animate-in fade-in duration-500">
               <AdminPageHeader
                    title="Temporary Carts"
                    description="Monitor active guest shopping sessions and abandoned carts in real-time"
               />

               <AdminTable
                    headers={tableHeaders}
                    loading={loading}
                    loadingMessage="Loading temporary carts..."
                    emptyMessage="No temporary carts found."
                    colCount={7}
               >
                    {tempCarts.map((cart) => (
                         <tr key={cart._id} className="hover:bg-gray-50/50 transition-colors group border-b border-gray-100 last:border-b-0">
                              <td className="px-8 py-5 align-top">
                                   <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2.5 bg-bg-color text-primary rounded-xl border border-gray-100">
                                             <MdShoppingCart size={18} />
                                        </div>
                                        <div>
                                             <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">
                                                  {cart.sessionId?.slice(0, 8)}...{cart.sessionId?.slice(-4)}
                                             </p>
                                        </div>
                                   </div>
                              </td>
                              <td className="px-8 py-5 align-top">
                                   <div className="space-y-3">
                                        {cart.items.map((item, idx) => {
                                             const product = item.productId || {};
                                             const variant = item.variantId || {};
                                             // Robust Image Logic
                                             const image = (() => {
                                                  const raw = item.image || product.image || (product.images && product.images[0]);
                                                  if (!raw) return null;
                                                  return typeof raw === "string" ? raw : raw.url;
                                             })();
                                             // Price/Rate Logic
                                             const rate = item.price || variant.price || product.price || 0;

                                             return (
                                                  <div key={idx} className="flex gap-3 items-start p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-100 transition-all">
                                                       <div className="w-10 h-10 bg-gray-50 rounded border border-gray-100 shrink-0 relative overflow-hidden">
                                                            {image ? (
                                                                 <img src={image} alt={product.name || "Product"} className="w-full h-full object-contain" />
                                                            ) : (
                                                                 <div className="w-full h-full bg-gray-200" />
                                                            )}
                                                       </div>
                                                       <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium text-gray-800 truncate" title={product.name}>
                                                                 {product.name || "Unknown Product"}
                                                            </p>
                                                            <div className="flex flex-wrap gap-x-2 text-[10px] text-gray-500 mt-0.5">
                                                                 {variant.name && <span>Var: {variant.name}</span>}
                                                                 <span className="font-mono">Qty: {item.quantity}</span>
                                                            </div>
                                                       </div>
                                                       <div className="text-right shrink-0">
                                                            <p className="text-xs font-bold text-gray-700">
                                                                 {settings.currency.symbol}{rate.toFixed(2)}
                                                            </p>
                                                            <p className="text-[9px] text-gray-400">/unit</p>
                                                       </div>
                                                  </div>
                                             );
                                        })}
                                   </div>
                                  
                              </td>
                              <td className="px-8 py-5 align-top">
                                   <div className="flex items-center gap-3">
                                        <MdDevices className="text-gray-300" size={18} />
                                        <div className="text-xs">
                                             <p className="font-light text-gray-700 uppercase tracking-tight">{cart.metadata?.deviceType || "Unknown"}</p>
                                             <p className="text-[10px] text-gray-400 font-light truncate max-w-[150px] uppercase tracking-widest" title={cart.metadata?.userAgent}>
                                                  {cart.metadata?.userAgent || "No user agent"}
                                             </p>
                                        </div>
                                   </div>
                              </td>
                              <td className="px-8 py-5 align-top">
                                   <div className="flex items-center gap-2">
                                        <MdLocationOn className="text-gray-300" size={18} />
                                        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">{cart.metadata?.ipAddress || "Unknown"}</span>
                                   </div>
                              </td>
                              <td className="px-8 py-5 align-top">
                                   <div className="flex items-center gap-2 text-[10px] text-gray-400 font-light uppercase tracking-widest">
                                        <MdHistory className="text-gray-300" size={18} />
                                        {new Date(cart.updatedAt).toLocaleString()}
                                   </div>
                              </td>
                              <td className="px-8 py-5 align-top">
                                   <div className="flex items-center justify-center">
                                        <button
                                             onClick={() => setDeleteModal({ isOpen: true, cartId: cart._id })}
                                             className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                             title="Delete Cart"
                                        >
                                             <MdDeleteForever size={20} />
                                        </button>
                                   </div>
                              </td>
                         </tr>
                    ))}
               </AdminTable>

               <AdminConfirmModal
                    isOpen={deleteModal.isOpen}
                    onClose={() => setDeleteModal({ isOpen: false, cartId: null })}
                    onConfirm={handleConfirmDelete}
                    title="Delete Temporary Cart?"
                    message="This action will permanently remove this shopping session data. This cannot be undone."
                    confirmLabel="Delete Cart"
                    type="danger"
                    action="delete"
               />
          </div>
     );
}
