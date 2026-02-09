"use client";

import { useState, useEffect, useMemo } from "react";
import { MdMap, MdCheckCircle, MdCancel, MdWarning, MdSearch, MdFilterList } from "react-icons/md";
import { adminFetchWithToast, adminFetch } from "@/lib/admin/adminFetch";
import toast from "react-hot-toast";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import AdminSelect from "@/components/admin/common/AdminSelect";
import AdminSearch from "@/components/admin/common/AdminSearch";
import AdminConfirmModal from "@/components/admin/common/AdminConfirmModal";

export default function PincodeMappingPage() {
     const [vendors, setVendors] = useState([]);
     const [states, setStates] = useState([]);

     // Master Data for the selected state
     const [allPincodes, setAllPincodes] = useState([]);

     const [selectedVendor, setSelectedVendor] = useState("");
     const [selectedStateCode, setSelectedStateCode] = useState("");

     // Local Filters
     const [filterStatus, setFilterStatus] = useState("all"); // unassigned, assigned, all
     const [searchQuery, setSearchQuery] = useState("");

     const [selectedPincodes, setSelectedPincodes] = useState([]);
     const [loading, setLoading] = useState(false);

     // Conflict Detection
     const [conflictData, setConflictData] = useState(null);

     useEffect(() => {
          fetchVendors();
          fetchStates();
     }, []);

     useEffect(() => {
          if (selectedStateCode) {
               fetchPincodes();
          } else {
               setAllPincodes([]);
          }
     }, [selectedStateCode]);

     const fetchVendors = async () => {
          try {
               const data = await adminFetch("/api/admin/vendors");
               if (data.success) {
                    setVendors(Array.isArray(data.data) ? data.data : []);
               }
          } catch (e) {
               console.error(e);
          }
     };

     const fetchStates = async () => {
          try {
               const data = await adminFetch("/api/admin/states");
               if (Array.isArray(data)) {
                    setStates(data);
               }
          } catch (e) {
               console.error("Failed to fetch states", e);
          }
     };

     const fetchPincodes = async () => {
          setLoading(true);
          try {
               // Fetch ALL pincodes for the state (no search/status filter sent to API)
               const query = new URLSearchParams({
                    stateCode: selectedStateCode
               });
               const data = await adminFetch(`/api/admin/pincodes/mapping?${query.toString()}`);
               if (data.success) {
                    setAllPincodes(data.pincodes);
                    setSelectedPincodes([]);
               }
          } catch (e) {
               toast.error("Failed to fetch pincodes");
          } finally {
               setLoading(false);
          }
     };

     // Optimized Local Filtering
     const filteredPincodes = useMemo(() => {
          return allPincodes.filter(pin => {
               // 1. Search Filter
               if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    const matchesPincode = pin.pincode.toLowerCase().includes(q);
                    const matchesDistrict = pin.district?.toLowerCase().includes(q);
                    const matchesVendor = pin.assignedToVendor?.name?.toLowerCase().includes(q);
                    if (!matchesPincode && !matchesDistrict && !matchesVendor) return false;
               }

               // 2. Status Filter
               if (filterStatus === 'assigned' && !pin.assignedToVendor) return false;
               if (filterStatus === 'unassigned' && pin.assignedToVendor) return false;

               return true;
          });
     }, [allPincodes, searchQuery, filterStatus]);

     const togglePincode = (id) => {
          setSelectedPincodes(prev =>
               prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
          );
     };

     // Selects only from the FILTERED list (UX Best Practice)
     const toggleAll = () => {
          const visibleIds = filteredPincodes.map(p => p._id);

          // Check if all visible are already selected
          const allVisibleSelected = visibleIds.every(id => selectedPincodes.includes(id));

          if (allVisibleSelected) {
               // Deselect visible ones
               setSelectedPincodes(prev => prev.filter(id => !visibleIds.includes(id)));
          } else {
               // Select all visible (merge unique)
               setSelectedPincodes(prev => [...new Set([...prev, ...visibleIds])]);
          }
     };

     const handleAssignClick = () => {
          if (!selectedVendor) return toast.error("Select a vendor first");
          if (selectedPincodes.length === 0) return toast.error("Select pincodes to assign");

          // Conflict Check driven by Master Data (allPincodes) to ensure accuracy
          // We look up full objects for selected IDs
          const selectedObjects = allPincodes.filter(p => selectedPincodes.includes(p._id));

          const conflictingPincodes = selectedObjects.filter(p =>
               p.assignedToVendor &&
               p.assignedToVendor._id !== selectedVendor
          );

          if (conflictingPincodes.length > 0) {
               const uniqueConflictingVendors = [...new Set(conflictingPincodes.map(p => p.assignedToVendor?.name))];

               setConflictData({
                    count: conflictingPincodes.length,
                    vendors: uniqueConflictingVendors.join(", "),
                    totalSelected: selectedPincodes.length
               });
          } else {
               executeAssign();
          }
     };

     const executeAssign = async () => {
          try {
               await adminFetchWithToast(
                    "/api/admin/pincodes/mapping",
                    {
                         method: "POST",
                         body: JSON.stringify({
                              vendorId: selectedVendor,
                              pincodeIds: selectedPincodes
                         })
                    },
                    {
                         loading: "Assigning pincodes...",
                         success: "Pincodes assigned!",
                         error: "Assignment failed"
                    },
                    toast
               );
               setConflictData(null);
               fetchPincodes(); // Refresh data
          } catch (e) {
               console.error(e);
          }
     };

     const handleUnassign = async () => {
          if (selectedPincodes.length === 0) return toast.error("Select pincodes to unassign");

          try {
               await adminFetchWithToast(
                    "/api/admin/pincodes/mapping",
                    {
                         method: "POST",
                         body: JSON.stringify({
                              unassign: true,
                              pincodeIds: selectedPincodes
                         })
                    },
                    {
                         loading: "Unassigning...",
                         success: "Pincodes unassigned!",
                         error: "Failed to unassign"
                    },
                    toast
               );
               fetchPincodes();
          } catch (e) {
               console.error(e);
          }
     };

     return (
          <div className="space-y-6 animate-in fade-in duration-500 pb-20">
               <AdminPageHeader
                    title="Pincode Mapping"
                    description="Assign territorial exclusivity to vendors"
               />

               {/* Main Control Panel */}
               <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 border-b border-gray-100">
                         {/* Scope Selection */}
                         <div className="md:col-span-1">
                              <AdminSelect
                                   label="Select State (Required)"
                                   value={selectedStateCode}
                                   onChange={(e) => setSelectedStateCode(e.target.value)}
                                   options={states.map(state => ({
                                        label: state.name,
                                        value: state.code
                                   }))}
                                   placeholder="-- Choose State --"
                              />
                         </div>
                         <div className="md:col-span-1">
                              <AdminSelect
                                   label="Target Vendor (For Assignment)"
                                   value={selectedVendor}
                                   onChange={(e) => setSelectedVendor(e.target.value)}
                                   options={vendors.map(v => ({
                                        label: `${v.name} (${v.companyName || 'No Company'})`,
                                        value: v._id
                                   }))}
                                   placeholder="-- Choose Vendor --"
                              />
                         </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                         {/* Search - Larger Area */}
                         <div className="md:col-span-8">
                              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Search Pincodes</label>
                              <AdminSearch
                                   value={searchQuery}
                                   onChange={setSearchQuery}
                                   placeholder="Search by Pincode, District, or Vendor..."
                                   className="w-full shadow-sm"
                              />
                         </div>

                         {/* Status Toggles */}
                         <div className="md:col-span-4">
                              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Filter Status</label>
                              <div className="flex bg-gray-100/80 rounded-2xl p-1.5 ring-1 ring-gray-200">
                                   {['all', 'unassigned', 'assigned'].map(status => (
                                        <button
                                             key={status}
                                             onClick={() => setFilterStatus(status)}
                                             className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${filterStatus === status
                                                  ? 'bg-white text-primary shadow-sm ring-1 ring-black/5'
                                                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200/50'
                                                  }`}
                                        >
                                             {status}
                                        </button>
                                   ))}
                              </div>
                         </div>
                    </div>
               </div>

               {/* Results & Actions */}
               {selectedStateCode && (
                    <>
                         {/* Sticky Stats Bar */}
                         <div className="sticky top-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-gray-200/50 shadow-lg shadow-gray-200/20 flex flex-col md:flex-row items-center justify-between gap-4 transition-all">
                              <div className="flex items-center gap-6">
                                   <div className="text-sm text-gray-500">
                                        <span className="font-bold text-gray-900 text-lg mr-1">{filteredPincodes.length}</span>
                                        {searchQuery ? 'Matches' : 'Pincodes'}
                                   </div>

                                   {/* Selection Count */}
                                   <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${selectedPincodes.length > 0 ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                        {selectedPincodes.length} Selected
                                   </div>
                              </div>

                              <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                                   <button
                                        onClick={toggleAll}
                                        className="whitespace-nowrap px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                   >
                                        {filteredPincodes.length > 0 && selectedPincodes.length >= filteredPincodes.length ? 'Deselect All' : 'Select All'}
                                   </button>

                                   <div className="h-6 w-px bg-gray-200 mx-2 hidden md:block"></div>

                                   <button
                                        onClick={handleUnassign}
                                        disabled={selectedPincodes.length === 0}
                                        className="whitespace-nowrap px-5 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                   >
                                        <MdCancel className="text-lg" /> Unassign
                                   </button>

                                   <button
                                        onClick={handleAssignClick}
                                        disabled={!selectedVendor || selectedPincodes.length === 0}
                                        className="whitespace-nowrap px-6 py-2.5 bg-primary text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-primary-dark shadow-xl shadow-primary/20 hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 transform active:scale-95"
                                   >
                                        <MdCheckCircle className="text-lg" /> Save
                                   </button>
                              </div>
                         </div>

                         {/* Grid */}
                         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                              {loading ? (
                                   <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                                        <p className="text-xs font-bold uppercase tracking-wider animate-pulse">Loading Pincodes...</p>
                                   </div>
                              ) : filteredPincodes.length === 0 ? (
                                   <div className="col-span-full py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                                        <MdSearch className="text-4xl mb-4 opacity-50" />
                                        <p>No pincodes found matching your filters.</p>
                                   </div>
                              ) : (
                                   filteredPincodes.map(pin => {
                                        const isSelected = selectedPincodes.includes(pin._id);
                                        const isAssigned = !!pin.assignedToVendor;
                                        const isConflict = isSelected && isAssigned && pin.assignedToVendor?._id !== selectedVendor;

                                        return (
                                             <div
                                                  key={pin._id}
                                                  onClick={() => togglePincode(pin._id)}
                                                  className={`p-4 rounded-3xl border cursor-pointer transition-all relative group overflow-hidden select-none
                                                       ${isSelected
                                                            ? isConflict
                                                                 ? 'border-orange-500/50 bg-orange-50 ring-4 ring-orange-500/10'
                                                                 : 'border-primary bg-primary/5 ring-4 ring-primary/10'
                                                            : 'border-gray-100 bg-white hover:border-primary/30 hover:shadow-lg hover:shadow-gray-200/50'
                                                       }
                                                  `}
                                             >
                                                  <div className="flex justify-between items-start mb-1">
                                                       <h4 className={`font-black text-xl tracking-tight transition-colors ${isSelected ? 'text-primary' : 'text-gray-900'}`}>{pin.pincode}</h4>
                                                       {isSelected && (
                                                            <div className={`${isConflict ? 'text-orange-500' : 'text-primary'} animate-in zoom-in spin-in-90 duration-300`}>
                                                                 {isConflict ? <MdWarning className="text-xl" /> : <MdCheckCircle className="text-xl" />}
                                                            </div>
                                                       )}
                                                  </div>

                                                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide truncate mb-3">{pin.district}</p>

                                                  {isAssigned ? (
                                                       <div className={`text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 rounded-lg inline-flex items-center gap-1 max-w-full
                                                            ${isConflict ? 'text-orange-700 bg-orange-100' : 'text-emerald-700 bg-emerald-50'}
                                                       `}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${isConflict ? 'bg-orange-500' : 'bg-emerald-500'}`}></div>
                                                            <span className="truncate">{pin.assignedToVendor?.name}</span>
                                                       </div>
                                                  ) : (
                                                       <div className="text-[10px] font-bold uppercase tracking-wider text-gray-300 py-1.5 px-3 bg-gray-50 rounded-lg inline-block">
                                                            Available
                                                       </div>
                                                  )}
                                             </div>
                                        )
                                   })
                              )}
                         </div>
                    </>
               )}

               <AdminConfirmModal
                    isOpen={!!conflictData}
                    title="Assignment Conflict"
                    message={`
                         ${conflictData?.count} of your ${conflictData?.totalSelected} selected pincodes are currently owned by:
                         \n${conflictData?.vendors}
                         \nDo you want to FORCE REASSIGN them to the new vendor?
                    `}
                    confirmLabel="Yes, Overwrite"
                    cancelLabel="Cancel"
                    onConfirm={executeAssign}
                    onCancel={() => setConflictData(null)}
                    variant="danger"
               />
          </div>
     );
}
