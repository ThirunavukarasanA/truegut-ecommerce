"use client";

import { use } from "react";
import VariantManager from "@/components/admin/catalog/VariantManager";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import { useRouter } from "next/navigation";
import { MdArrowBack } from "react-icons/md";

export default function ProductVariantsPage({ params }) {
     const { productId } = use(params);
     const router = useRouter();

     return (
          <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
               <div className="flex items-center gap-4">
                    <button
                         onClick={() => router.back()}
                         className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all shadow-sm border border-gray-100"
                    >
                         <MdArrowBack size={20} />
                    </button>
                    <div className="flex-1">
                         <AdminPageHeader
                              title="Manage Variants"
                              description="Configure sales options like size, weight, and price"
                         />
                    </div>
               </div>

               <div className="flex-1 min-h-0">
                    <VariantManager productId={productId} />
               </div>
          </div>
     );
}
