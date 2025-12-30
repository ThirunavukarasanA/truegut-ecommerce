"use client";

export default function AdminStatusBadge({ status, type = "default" }) {
     const getStatusStyles = (status) => {
          const s = status?.toLowerCase();
          if (s === "active" || s === "delivered" || s === "success" || s === "paid") {
               return "bg-green-50 text-green-600 border-green-100 dot-bg-green-500";
          }
          if (s === "shipped" || s === "processing" || s === "info") {
               return "bg-blue-50 text-blue-600 border-blue-100 dot-bg-blue-500";
          }
          if (s === "pending" || s === "draft" || s === "warning") {
               return "bg-orange-50 text-orange-600 border-orange-100 dot-bg-orange-500";
          }
          if (s === "cancelled" || s === "out of stock" || s === "error" || s === "failed" || s === "terminated" || s === "inactive" || s === "suspended" || s === "banned") {
               return "bg-red-50 text-red-600 border-red-100 dot-bg-red-500";
          }
          return "bg-gray-100 text-gray-400 border-gray-200 dot-bg-gray-400";
     };

     const styles = getStatusStyles(status);
     const dotColorClass = styles.split(' ').find(c => c.startsWith('dot-bg-'))?.replace('dot-bg-', 'bg-') || 'bg-gray-400';
     const baseStyles = styles.split(' ').filter(c => !c.startsWith('dot-bg-')).join(' ');

     return (
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-normal uppercase tracking-wider border ${baseStyles}`}>
               <span className={`w-1.5 h-1.5 rounded-full ${dotColorClass}`}></span>
               {status}
          </div>
     );
}
