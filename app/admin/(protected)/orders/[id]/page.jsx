"use client";

import { useParams, useRouter } from "next/navigation";
import OrderDetailView from "@/components/admin/orders/OrderDetailView";

export default function OrderDetailsPage() {
     const { id } = useParams();
     const router = useRouter();

     if (!id) return null;

     return (
          <div className="p-4 md:p-8">
               <OrderDetailView
                    orderId={id}
                    onBack={() => router.back()}
               />
          </div>
     );
}
