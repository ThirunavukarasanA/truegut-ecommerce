"use client";

import AdminPageHeader from "@/components/admin/common/AdminPageHeader";

export default function ReturnsPage() {
     return (
          <div className="space-y-8 animate-in fade-in duration-500">
               <AdminPageHeader
                    title="Order Returns"
                    description="Manage customer returns and refunds"
               />

               <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                         <span className="text-2xl">📦</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Returns Management coming soon</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                         The returns module is currently under development. You will be able to process refunds and track return shipments here.
                    </p>
               </div>
          </div>
     );
}
