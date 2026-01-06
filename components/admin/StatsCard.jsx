export default function StatsCard({
     title,
     value,
     change,
     icon: Icon,
     trend = "up",
     variant = "purple",
     className = ""
}) {
     const isPositive = trend === "up";

     const variants = {
          purple: {
               bg: "bg-purple-50",
               text: "text-purple-600",
               highlight: "bg-purple-600",
               glow: "bg-purple-400",
               border: "border-purple-100/50",
               hoverShadow: "hover:shadow-[0_20px_50px_rgba(124,58,237,0.08)]"
          },
          emerald: {
               bg: "bg-emerald-50",
               text: "text-emerald-600",
               highlight: "bg-emerald-600",
               glow: "bg-emerald-400",
               border: "border-emerald-100/50",
               hoverShadow: "hover:shadow-[0_20px_50px_rgba(16,185,129,0.08)]"
          },
          blue: {
               bg: "bg-blue-50",
               text: "text-blue-600",
               highlight: "bg-blue-600",
               glow: "bg-blue-400",
               border: "border-blue-100/50",
               hoverShadow: "hover:shadow-[0_20px_50px_rgba(59,130,246,0.08)]"
          },
          amber: {
               bg: "bg-amber-50",
               text: "text-amber-600",
               highlight: "bg-amber-600",
               glow: "bg-amber-400",
               border: "border-amber-100/50",
               hoverShadow: "hover:shadow-[0_20px_50px_rgba(245,158,11,0.08)]"
          },
          rose: {
               bg: "bg-rose-50",
               text: "text-rose-600",
               highlight: "bg-rose-600",
               glow: "bg-rose-400",
               border: "border-rose-100/50",
               hoverShadow: "hover:shadow-[0_20px_50px_rgba(244,63,94,0.08)]"
          },
          indigo: {
               bg: "bg-indigo-50",
               text: "text-indigo-600",
               highlight: "bg-indigo-600",
               glow: "bg-indigo-400",
               border: "border-indigo-100/50",
               hoverShadow: "hover:shadow-[0_20px_50px_rgba(99,102,241,0.08)]"
          },
          cyan: {
               bg: "bg-cyan-50",
               text: "text-cyan-600",
               highlight: "bg-cyan-600",
               glow: "bg-cyan-400",
               border: "border-cyan-100/50",
               hoverShadow: "hover:shadow-[0_20px_50px_rgba(6,182,212,0.08)]"
          }
     };

     const style = variants[variant] || variants.purple;

     return (
          <div className={`bg-white p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border ${style.border} ${style.hoverShadow} transition-all duration-500 group relative overflow-hidden ${className}`}>
               {/* Decorative Gradient Background */}
               <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] rounded-full opacity-10 transition-opacity duration-500 pointer-events-none ${style.glow}`}></div>

               <div className="flex justify-between items-start relative z-10">
                    <div>
                         <p className="text-gray-400 text-[10px] uppercase tracking-[0.25em] font-semibold mb-4">{title}</p>
                         <h3 className={`text-4xl font-light text-gray-900 group-hover:${style.text} transition-colors tracking-tight`}>{value}</h3>
                    </div>
                    <div className={`p-4 rounded-2xl transition-all duration-500 ${style.bg} ${style.text} group-hover:${style.highlight} group-hover:text-white`}>
                         {Icon && <Icon size={28} />}
                    </div>
               </div>

               <div className="mt-8 flex items-center gap-3 relative z-10">
                    <span className={`text-[11px] font-normal px-3 py-1.5 rounded-xl uppercase tracking-wider ${change === "Live" || change === "Growth" || change === "Items" || change === "Processing" || change === "Urgent"
                         ? `${style.bg} ${style.text} ${change === "Live" ? "animate-pulse" : ""}`
                         : (isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")
                         }`}>
                         {(change !== "Live" && change !== "Growth" && change !== "Items" && change !== "Processing" && change !== "Urgent" && !isNaN(parseFloat(change)))
                              ? (isPositive ? "↑ " : "↓ ") + change + "%"
                              : change}
                    </span>
                    <span className="text-[10px] text-gray-400 font-light uppercase tracking-widest opacity-60">
                         {change === "Live" ? "Real-time Activity" :
                              change === "Growth" ? "New signups" :
                                   change === "Items" ? "In Warehouse" :
                                        change === "Processing" ? "Orders in queue" :
                                             change === "Urgent" ? "Needs attention" :
                                                  "vs last month"}
                    </span>
               </div>
          </div>
     );
}
