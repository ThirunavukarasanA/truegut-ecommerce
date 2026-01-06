"use client";

import { useState, useEffect } from "react";
import { MdInventory2 } from "react-icons/md";
import { adminFetch } from "@/lib/adminFetch";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import AdminSearch from "@/components/admin/common/AdminSearch";
import AdminTable from "@/components/admin/common/AdminTable";
import { useRouter } from "next/navigation";

export default function VariantCatalogPage() {
     const [products, setProducts] = useState([]);
     const [loading, setLoading] = useState(true);
     const [search, setSearch] = useState("");
     const router = useRouter();

     const fetchProducts = async () => {
          try {
               const data = await adminFetch(`/api/admin/catalog/products?search=${search}`);
               if (data.success) {
                    setProducts(data.data);
               }
          } catch (error) {
               console.error(error);
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          fetchProducts();
     }, [search]);

     return (
          <div className="space-y-6 animate-in fade-in duration-500">
               <AdminPageHeader
                    title="Variant Catalog"
                    description="Select a product to manage its variants and SKUs"
               />

               {/* Search */}
               <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                    <AdminSearch
                         value={search}
                         onChange={setSearch}
                         placeholder="Search products to manage variants..."
                         className="w-full lg:w-96"
                    />
               </div>

               <AdminTable
                    headers={[
                         { label: "Product" },
                         { label: "Category" },
                         { label: "Current Variants" },
                         { label: "Action", align: "right" }
                    ]}
                    loading={loading}
                    colCount={4}
               >
                    {products.map((product) => (
                         <tr key={product._id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-8 py-5">
                                   <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                                             {product.images?.[0] ? (
                                                  <img src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url} className="w-full h-full object-cover rounded-xl" />
                                             ) : <MdInventory2 />}
                                        </div>
                                        <div>
                                             <p className="font-bold text-gray-800">{product.name}</p>
                                             <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">CODE: {product.productCode || product._id.slice(-6)}</p>
                                        </div>
                                   </div>
                              </td>
                              <td className="px-8 py-5">
                                   <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg uppercase tracking-wider">{product.category?.name || "N/A"}</span>
                              </td>
                              <td className="px-8 py-5">
                                   <span className="text-xs text-gray-400 font-medium">Click manage to view</span>
                              </td>
                              <td className="px-8 py-5 text-right">
                                   <button
                                        onClick={() => router.push(`/admin/catalog/variants/${product._id}`)}
                                        className="px-5 py-2.5 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-gray-200"
                                   >
                                        Manage Variants
                                   </button>
                              </td>
                         </tr>
                    ))}
               </AdminTable>
          </div>
     );
}
