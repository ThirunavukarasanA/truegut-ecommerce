export default function StatsCard({ title, value, change, icon: Icon, trend = "up", className = "" }) {
     const isPositive = trend === "up";

     return (
          <div className={`bg-white p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-50/50 hover:shadow-[0_20px_50px_rgba(124,58,237,0.08)] transition-all duration-500 group relative overflow-hidden ${className}`}>
               {/* Decorative Gradient Background */}
               <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] rounded-full opacity-10 transition-opacity duration-500 pointer-events-none ${isPositive ? 'bg-[#4b9634]' : 'bg-secondary'}`}></div>

               <div className="flex justify-between items-start relative z-10">
                    <div>
                         <p className="text-gray-400 text-[10px] uppercase tracking-[0.25em] font-light mb-4">{title}</p>
                         <h3 className="text-4xl font-light text-gray-900 group-hover:text-secondary transition-colors tracking-tight">{value}</h3>
                    </div>
                    <div className={`p-4 rounded-2xl transition-all duration-500 ${isPositive ? 'bg-[#4b9634]/5 text-[#4b9634] group-hover:bg-[#4b9634] group-hover:text-white' : 'bg-secondary/5 text-secondary group-hover:bg-secondary group-hover:text-white'}`}>
                         {Icon && <Icon size={28} />}
                    </div>
               </div>

               <div className="mt-8 flex items-center gap-3 relative z-10">
                    <span className={`text-[11px] font-normal px-3 py-1.5 rounded-xl uppercase tracking-wider ${change === "Live" ? "bg-secondary/5 text-secondary animate-pulse" : (isPositive ? "bg-[#4b9634]/10 text-[#4b9634]" : "bg-red-50 text-red-600")
                         }`}>
                         {change === "Live" ? "" : (isPositive ? "↑" : "↓")}{change}{change === "Live" ? "" : "%"}
                    </span>
                    <span className="text-[10px] text-gray-400 font-light uppercase tracking-widest opacity-60">
                         {change === "Live" ? "Real-time Activity" : "vs last month"}
                    </span>
               </div>
          </div>
     );
}
