"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MdAdd, MdEdit, MdDelete, MdInventory2 } from "react-icons/md";
import toast from "react-hot-toast";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import AdminSearch from "@/components/admin/common/AdminSearch";
import AdminTable from "@/components/admin/common/AdminTable";
import AdminStatusBadge from "@/components/admin/common/AdminStatusBadge";

import AdminConfirmModal from "@/components/admin/common/AdminConfirmModal";

export default function ProductsPage() {
     const router = useRouter();
     const [products, setProducts] = useState([]);
     const [loading, setLoading] = useState(true);
     const [filterStatus, setFilterStatus] = useState("All");
     const [search, setSearch] = useState("");

     // Confirmation States
     const [isConfirmOpen, setIsConfirmOpen] = useState(false);
     const [productToDelete, setProductToDelete] = useState(null);

     useEffect(() => {
          fetchProducts();
     }, [search, filterStatus]);

     const fetchProducts = async () => {
          try {
               let url = `/api/admin/catalog/products?search=${search}`;
               if (filterStatus !== 'All') url += `&status=${filterStatus}`;

               const res = await fetch(url);
               const data = await res.json();
               if (data.success) {
                    setProducts(data.data);
               }
          } catch (error) {
               toast.error("Failed to load products");
          } finally {
               setLoading(false);
          }
     };

     const handleCreate = () => {
          router.push("/admin/catalog/products/create");
     };

     const handleEdit = (productId) => {
          router.push(`/admin/catalog/products/${productId}`);
     };

     const handleDelete = (id) => {
          setProductToDelete(id);
          setIsConfirmOpen(true);
     };

     const confirmDelete = async () => {
          if (!productToDelete) return;
          const toastId = toast.loading("Deleting product...");
          try {
               const res = await fetch(`/api/admin/catalog/products/${productToDelete}`, {
                    method: "DELETE",
               });
               const data = await res.json();
               if (data.success) {
                    setProducts(products.filter(p => p._id !== productToDelete));
                    toast.success("Product removed", { id: toastId });
               } else {
                    toast.error(data.error || "Delete failed", { id: toastId });
               }
          } catch (error) {
               toast.error("Failed to delete product", { id: toastId });
          } finally {
               setProductToDelete(null);
          }
     };

     const filteredProducts = products || [];

     const tableHeaders = [
          { label: "ProductDetails" },
          { label: "CatalogCategory" },
          { label: "UnitValuation" },
          { label: "StockInventory" },
          { label: "LifeCycleStatus" },
          { label: "Operations", align: "right" }
     ];

     return (
          <div className="space-y-6 animate-in fade-in duration-500">
               {/* Page Header */}
               <AdminPageHeader
                    title="Products"
                    description="Manage your product catalog and inventory"
                    primaryAction={{
                         label: "AddProduct",
                         onClick: handleCreate,
                         icon: MdAdd
                    }}
               />

               {/* Filters & Search */}
               <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-6 items-center justify-between">
                    <AdminSearch
                         value={search}
                         onChange={setSearch}
                         placeholder="Search products by name..."
                         className="w-full lg:w-96"
                    />
                    <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                         {["All", "Active", "Draft", "Out of Stock"].map(status => (
                              <button
                                   key={status}
                                   onClick={() => setFilterStatus(status)}
                                   className={`px-5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${filterStatus === status
                                        ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-100"
                                        : "bg-white border-gray-100 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                        }`}
                              >
                                   {status}
                              </button>
                         ))}
                    </div>
               </div>

               {/* Products Table */}
               <AdminTable
                    headers={tableHeaders}
                    loading={loading}
                    loadingMessage="Loading catalog..."
                    emptyMessage="No products found."
                    colCount={6}
               >
                    {filteredProducts.map((product) => (
                         <tr key={product._id} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-8 py-5">
                                   <div className="flex items-center gap-4">
                                        {product.images && product.images.length > 0 ? (
                                             <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-purple-100 bg-white flex-shrink-0">
                                                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                             </div>
                                        ) : (
                                             <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-100 flex items-center justify-center text-purple-400 flex-shrink-0">
                                                  <MdInventory2 size={24} />
                                             </div>
                                        )}
                                        <div>
                                             <p className="font-light text-gray-800 group-hover:text-purple-600 transition-colors uppercase tracking-tight">{product.name}</p>
                                             <div className="flex items-center gap-2 mt-0.5">
                                                  <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">SKU-{product._id ? product._id.slice(-6).toUpperCase() : "LOST"}</p>
                                                  {product.fermentationType && (
                                                       <span className="text-[9px] bg-purple-50 text-purple-400 px-1.5 py-0.5 rounded font-light uppercase tracking-widest border border-purple-100/50">{product.fermentationType}</span>
                                                  )}
                                                  {product.fermentationDuration && (
                                                       <span className="text-[9px] text-gray-400 font-light uppercase tracking-widest">• {product.fermentationDuration}</span>
                                                  )}
                                             </div>
                                             {product.variants && product.variants.length > 0 && (
                                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                                       {product.variants.map((v, i) => (
                                                            <span key={i} className="text-[8px] bg-purple-50/50 text-purple-400 px-1.5 py-0.5 rounded border border-purple-100/30 uppercase tracking-wider font-medium">
                                                                 {v.name}: {v.options.length}
                                                            </span>
                                                       ))}
                                                  </div>
                                             )}
                                        </div>
                                   </div>
                              </td>
                              <td className="px-8 py-5">
                                   <span className="text-[10px] font-light text-gray-400 uppercase tracking-widest bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg">
                                        {product.category?.name || "Uncategorized"}
                                   </span>
                              </td>
                              <td className="px-8 py-5">
                                   <span className="text-[15px] font-light text-gray-800">₹{product.price.toFixed(2)}</span>
                              </td>
                              <td className="px-8 py-5">
                                   <div className="flex flex-col gap-1.5">
                                        <span className={`text-[11px] font-light uppercase tracking-widest ${product.stock < 10 ? 'text-orange-500' : 'text-gray-400'}`}>{product.stock} units</span>
                                        <div className="w-16 h-1 bg-gray-50 rounded-full overflow-hidden border border-gray-100/50">
                                             <div className={`h-full rounded-full ${product.stock < 10 ? 'bg-orange-500' : 'bg-[#4b9634]'}`} style={{ width: `${Math.min(product.stock, 100)}%` }}></div>
                                        </div>
                                   </div>
                              </td>
                              <td className="px-8 py-5">
                                   <AdminStatusBadge status={product.status} />
                              </td>
                              <td className="px-8 py-5 text-right">
                                   <div className="flex items-center justify-end gap-2 pr-2">
                                        <button
                                             onClick={() => handleEdit(product._id)}
                                             className="p-2.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all border border-transparent hover:border-purple-100/50"
                                             title="Edit"
                                        >
                                             <MdEdit size={18} />
                                        </button>
                                        <button
                                             onClick={() => handleDelete(product._id)}
                                             className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100/50"
                                             title="Delete"
                                        >
                                             <MdDelete size={18} />
                                        </button>
                                   </div>
                              </td>
                         </tr>
                    ))}
               </AdminTable>

               {/* Confirmation Modal */}
               <AdminConfirmModal
                    isOpen={isConfirmOpen}
                    onClose={() => setIsConfirmOpen(false)}
                    onConfirm={confirmDelete}
                    title="RemoveProduct"
                    message="Are you certain you want to remove this product from the catalog? This action cannot be reversed."
                    type="danger"
                    action="delete"
                    confirmLabel="Remove"
               />
          </div>
     );
}
