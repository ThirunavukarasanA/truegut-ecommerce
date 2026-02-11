"use client";

import { useState, useEffect, useCallback } from "react";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import AdminTable from "@/components/admin/common/AdminTable";
import AdminSearch from "@/components/admin/common/AdminSearch";
import AdminSelect from "@/components/admin/common/AdminSelect";
import AdminStatusBadge from "@/components/admin/common/AdminStatusBadge";
import PincodeModal from "@/components/admin/pincodes/PincodeModal";
import SubPlacesModal from "@/components/admin/pincodes/SubPlacesModal";

import { adminFetch, adminFetchWithToast } from "@/lib/admin/adminFetch";
import toast from "react-hot-toast";
import { MdAdd, MdSync, MdDelete, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";
import useDebounce from "@/hooks/useDebounce";

export default function PincodesPage() {
     const [pincodes, setPincodes] = useState([]);
     const [states, setStates] = useState([]);
     const [loading, setLoading] = useState(true);
     const [search, setSearch] = useState("");
     const debouncedSearch = useDebounce(search, 500); // 500ms debounce
     const [selectedState, setSelectedState] = useState("");
     const [page, setPage] = useState(1);
     const [totalPages, setTotalPages] = useState(1);
     const [isModalOpen, setIsModalOpen] = useState(false);
     const [syncing, setSyncing] = useState(false);
     const [selectedRows, setSelectedRows] = useState([]);

     // Sub-places Modal
     const [selectedPincodeForDetails, setSelectedPincodeForDetails] = useState(null);

     const fetchPincodes = useCallback(async () => {
          setLoading(true);
          try {
               const queryParams = new URLSearchParams({
                    page,
                    limit: 20,
                    search: debouncedSearch,
                    ...(selectedState && { state: selectedState }),
               });
               const res = await adminFetch(`/api/admin/pincodes?${queryParams}`);
               if (res.error) throw new Error(res.error);

               setPincodes(res.pincodes || []);
               setTotalPages(res.pagination?.pages || 1);
               // Reset selection on page change
               setSelectedRows([]);
          } catch (error) {
               console.error("Error fetching pincodes:", error);
               toast.error("Failed to load pincodes");
          } finally {
               setLoading(false);
          }
     }, [page, debouncedSearch, selectedState]);

     const fetchStates = useCallback(async () => {
          try {
               const res = await adminFetch('/api/admin/states');
               if (res.error) throw new Error(res.error);
               setStates(res || []);
          } catch (error) {
               console.error(error);
          }
     }, []);

     useEffect(() => {
          fetchStates();
     }, []);

     useEffect(() => {
          fetchPincodes();
     }, [fetchPincodes]);

     const handleSyncStates = async () => {
          setSyncing(true);
          try {
               const res = await adminFetchWithToast(
                    '/api/admin/states',
                    { method: 'POST' },
                    {
                         loading: 'Syncing states from library...',
                         success: 'States synced successfully!',
                         error: 'Failed to sync states'
                    },
                    toast
               );
               if (res.message) {
                    fetchStates();
               }
          } catch (error) {
               console.error(error);
          } finally {
               setSyncing(false);
          }
     };

     const handleDelete = async (ids) => {
          if (!confirm("Are you sure you want to delete selected pincodes?")) return;

          try {
               await adminFetchWithToast(
                    '/api/admin/pincodes',
                    {
                         method: 'DELETE',
                         body: JSON.stringify({ ids })
                    },
                    {
                         loading: 'Deleting...',
                         success: 'Deleted successfully',
                         error: 'Delete failed'
                    },
                    toast
               );
               fetchPincodes();
               setSelectedRows([]);
          } catch (error) {
               console.error(error);
          }
     };

     const handleToggleServiceable = async (pincodeId, currentStatus) => {
          const newStatus = !currentStatus;
          // Optimistic UI Update
          setPincodes(prev => prev.map(p =>
               p._id === pincodeId ? { ...p, isServiceable: newStatus } : p
          ));

          try {
               const res = await adminFetch('/api/admin/pincodes', {
                    method: 'PUT',
                    body: JSON.stringify({ id: pincodeId, isServiceable: newStatus })
               });

               if (res.error) {
                    throw new Error(res.error);
               }
               toast.success(`Serviceability ${newStatus ? 'Enabled' : 'Disabled'}`);
          } catch (error) {
               console.error("Update failed:", error);
               toast.error("Failed to update status");
               // Revert on failure
               setPincodes(prev => prev.map(p =>
                    p._id === pincodeId ? { ...p, isServiceable: currentStatus } : p
               ));
          }
     };

     // Table Headers
     const headers = [
          { label: 'S.no' },
          { label: "Pincode" },
          { label: "District" },
          { label: "State" },
          { label: "Sub-places" }, // Added
          { label: "Status" },
          { label: "Actions" }, // Added
     ];



     // ... existing fetch functions ...

     return (
          <div className="space-y-6">
               <AdminPageHeader
                    title="Pincode Management"
                    description="Manage serviceable areas and states"
                    primaryAction={{
                         label: "Generate Pincodes",
                         onClick: () => setIsModalOpen(true),
                         icon: MdAdd
                    }}
                    secondaryAction={{
                         label: syncing ? 'Syncing...' : 'Update States',
                         onClick: handleSyncStates,
                         icon: MdSync
                    }}
               >

               </AdminPageHeader>




               {/* Filters */}
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="md:col-span-2">
                         <AdminSearch
                              value={search}
                              onChange={(val) => { setSearch(val); setPage(1); }}
                              placeholder="Search pincode or district..."
                         />
                    </div>
                    <div className="md:col-span-1">
                         <AdminSelect
                              value={selectedState}
                              onChange={(e) => {
                                   setSelectedState(e.target.value);
                                   setPage(1);
                              }}
                              options={[
                                   { value: "", label: "All States" },
                                   ...states.map(s => ({ value: s.name, label: s.name }))
                              ]}
                              placeholder="Filter by State"
                         />
                    </div>
                    {/* Bulk Actions */}
                    {selectedRows.length > 0 && (
                         <div className="md:col-span-1 flex items-center justify-end">
                              <button
                                   onClick={() => handleDelete(selectedRows)}
                                   className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                              >
                                   <MdDelete /> Delete ({selectedRows.length})
                              </button>
                         </div>
                    )}
               </div>

               {/* Table */}
               <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                    <AdminTable
                         headers={headers}
                         loading={loading}
                         colCount={headers.length}
                         emptyMessage="No pincodes found."
                    >
                         {pincodes.map((pincode, index) => (
                              <tr key={pincode._id} className="hover:bg-gray-50/50 transition-colors">
                                   <td className="px-8 py-4 font-mono font-medium text-gray-700">
                                        {(page - 1) * 20 + index + 1}
                                   </td>
                                   <td className="px-8 py-4 font-mono font-medium text-gray-700">
                                        {pincode.pincode}
                                   </td>
                                   <td className="px-8 py-4 text-gray-600 font-light">
                                        {pincode.district || '-'}
                                   </td>
                                   <td className="px-8 py-4 text-gray-600 font-light">
                                        {pincode.state}
                                   </td>
                                   <td className="px-8 py-4 text-gray-600 font-light">
                                        <button
                                             onClick={() => setSelectedPincodeForDetails(pincode)}
                                             className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1 rounded-full transition-colors font-medium text-xs"
                                        >
                                             <IoLocationOutline size={14} />
                                             {pincode.postOffices?.length || 0} Places
                                        </button>
                                   </td>
                                   <td className="px-8 py-4">
                                        <AdminStatusBadge
                                             status={pincode.isServiceable ? 'active' : 'inactive'}
                                             label={pincode.isServiceable ? 'Serviceable' : 'Inactive'}
                                        />
                                   </td>
                                   <td className="px-8 py-4">
                                        <div className="flex items-center gap-2">
                                             <button
                                                  onClick={() => handleToggleServiceable(pincode._id, pincode.isServiceable)}
                                                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${pincode.isServiceable
                                                       ? "border-red-200 text-red-600 hover:bg-red-50"
                                                       : "border-green-200 text-green-600 hover:bg-green-50"
                                                       }`}
                                             >
                                                  {pincode.isServiceable ? "Disable" : "Enable"}
                                             </button>
                                        </div>
                                   </td>
                              </tr>
                         ))}
                    </AdminTable>

                    {/* Pagination */}
                    {totalPages > 1 && (
                         <div className="px-8 py-4 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
                              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                                   Page {page} of {totalPages}
                              </span>
                              <div className="flex gap-2">
                                   <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="p-2 bg-white border border-gray-100 rounded-lg text-gray-500 hover:text-gray-800 disabled:opacity-50 transition-colors"
                                   >
                                        <MdChevronLeft size={20} />
                                   </button>
                                   <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="p-2 bg-white border border-gray-100 rounded-lg text-gray-500 hover:text-gray-800 disabled:opacity-50 transition-colors"
                                   >
                                        <MdChevronRight size={20} />
                                   </button>
                              </div>
                         </div>
                    )}
               </div>

               <PincodeModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchPincodes}
               />

               <SubPlacesModal
                    isOpen={!!selectedPincodeForDetails}
                    onClose={() => setSelectedPincodeForDetails(null)}
                    pincodeData={selectedPincodeForDetails}
               />
          </div>
     );
}
