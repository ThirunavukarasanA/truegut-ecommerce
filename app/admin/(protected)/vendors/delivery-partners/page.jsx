"use client";

import { useState, useEffect } from "react";
import { MdAdd, MdLocalShipping, MdEdit, MdDelete } from "react-icons/md";
import { adminFetch } from "@/lib/admin/adminFetch";
import toast from "react-hot-toast";
import DeliveryPartnerModal from "./DeliveryPartnerModal";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import AdminTable from "@/components/admin/common/AdminTable";
import AdminStatusBadge from "@/components/admin/common/AdminStatusBadge";

export default function DeliveryPartnersPage() {
     const [partners, setPartners] = useState([]);
     const [loading, setLoading] = useState(true);

     // Modal State
     const [isModalOpen, setIsModalOpen] = useState(false);
     const [selectedPartner, setSelectedPartner] = useState(null);

     useEffect(() => {
          fetchPartners();
     }, []);

     const fetchPartners = async () => {
          try {
               const data = await adminFetch("/api/admin/delivery-partners");
               if (data.success) {
                    setPartners(data.partners);
               }
          } catch (e) {
               toast.error("Failed to load delivery partners");
          } finally {
               setLoading(false);
          }
     };

     const handleCreate = () => {
          setSelectedPartner(null);
          setIsModalOpen(true);
     };

     const handleEdit = (partner) => {
          setSelectedPartner(partner);
          setIsModalOpen(true);
     };

     // Placeholder for delete logic
     const handleDelete = async (id) => {
          // Implement delete confirm and API call
          // For now just toast
          toast.error("Delete functionality requires API update");
     };

     return (
          <div className="space-y-10 animate-in fade-in duration-500">
               <AdminPageHeader
                    title="Delivery Partners"
                    description="Manage courier services and delivery fleets"
                    primaryAction={{
                         label: "Add Partner",
                         onClick: handleCreate,
                         icon: MdAdd
                    }}
               />

               <AdminTable
                    headers={[
                         { label: "Partner Name" },
                         { label: "Type" },
                         { label: "Actions", align: "right" }
                    ]}
                    loading={loading}
                    emptyMessage="No delivery partners found."
                    colCount={3}
               >
                    {partners.map(partner => (
                         <tr key={partner._id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-8 py-5">
                                   <div className="font-medium text-gray-900">{partner.name}</div>
                              </td>
                              <td className="px-8 py-5">
                                   <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-bg-color text-gray-600 rounded-lg text-xs font-medium">
                                        <MdLocalShipping size={14} /> {partner.type}
                                   </span>
                              </td>
                              <td className="px-8 py-5 text-right">
                                   <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEdit(partner)} className="p-2 text-gray-400 hover:text-primary transition-colors">
                                             <MdEdit size={18} />
                                        </button>
                                   </div>
                              </td>
                         </tr>
                    ))}
               </AdminTable>

               <DeliveryPartnerModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={fetchPartners}
                    initialData={selectedPartner}
               />
          </div>
     );
}
