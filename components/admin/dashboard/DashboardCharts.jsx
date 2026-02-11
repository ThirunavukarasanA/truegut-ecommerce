"use client";

import {
     LineChart,
     Line,
     XAxis,
     YAxis,
     CartesianGrid,
     Tooltip,
     ResponsiveContainer,
     BarChart,
     Bar,
     Cell,
     PieChart,
     Pie,
     AreaChart,
     Area
} from "recharts";
import AdminCard from "@/components/admin/common/AdminCard";
import { useSettings } from "@/context/SettingsContext";
import { MdOutlineAnalytics, MdInventory2, MdDonutSmall } from "react-icons/md";

const CHART_COLORS = ["#7C3AED", "#10B981", "#F59E0B", "#EF4444", "#3B82F6"];

const CustomTooltip = ({ active, payload, label, currencySymbol = "₹" }) => {
     if (active && payload && payload.length) {
          return (
               <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 animate-in fade-in zoom-in-95 duration-200">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-2">{label}</p>
                    {payload.map((entry, index) => (
                         <div key={index} className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                              <p className="text-sm font-light text-gray-800">
                                   {entry.name}: <span className="font-normal">{currencySymbol}{entry.value.toLocaleString()}</span>
                              </p>
                         </div>
                    ))}
               </div>
          );
     }
     return null;
};

const EmptyState = ({ icon: Icon, title, message }) => (
     <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in duration-700">
          <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-300">
               <Icon size={32} />
          </div>
          <div>
               <p className="text-gray-400 text-sm font-light">{message}</p>
          </div>
     </div>
);

export default function DashboardCharts({ historyData = [], topProducts = [], orderDistribution = [] }) {
     const { settings } = useSettings();
     const hasHistory = historyData.length > 0;
     const hasTopProducts = topProducts.length > 0;
     const hasOrderDist = orderDistribution.some(item => item.value > 0);

     return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* Sales & Orders Line Chart */}
               <AdminCard noPadding className="overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100">
                         <h3 className="text-[11px] font-light text-gray-400 uppercase tracking-[0.2em]">Sales & Orders Trends</h3>
                    </div>
                    <div className="p-8 h-[350px]">
                         {hasHistory ? (
                              <ResponsiveContainer width="100%" height="100%">
                                   <AreaChart data={historyData}>
                                        <defs>
                                             <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.1} />
                                                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                                             </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                        <XAxis
                                             dataKey="_id"
                                             axisLine={false}
                                             tickLine={false}
                                             tick={{ fontSize: 10, fill: '#94A3B8' }}
                                             dy={10}
                                        />
                                        <YAxis
                                             axisLine={false}
                                             tickLine={false}
                                             tick={{ fontSize: 10, fill: '#94A3B8' }}
                                        />
                                        <Tooltip content={<CustomTooltip currencySymbol={settings.currency.symbol} />} />
                                        <Area
                                             type="monotone"
                                             dataKey="sales"
                                             name="Revenue"
                                             stroke="#7C3AED"
                                             strokeWidth={3}
                                             fillOpacity={1}
                                             fill="url(#colorSales)"
                                        />
                                   </AreaChart>
                              </ResponsiveContainer>
                         ) : (
                              <EmptyState
                                   icon={MdOutlineAnalytics}
                                   message="No sales activity found for the last 30 days."
                              />
                         )}
                    </div>
               </AdminCard>

               {/* Top Products Bar Chart */}
               <AdminCard noPadding>
                    <div className="px-8 py-6 border-b border-gray-100">
                         <h3 className="text-[11px] font-light text-gray-400 uppercase tracking-[0.2em]">Top Selling Products</h3>
                    </div>
                    <div className="p-8 h-[350px]">
                         {hasTopProducts ? (
                              <ResponsiveContainer width="100%" height="100%">
                                   <BarChart data={topProducts} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                                        <XAxis type="number" hide />
                                        <YAxis
                                             dataKey="name"
                                             type="category"
                                             axisLine={false}
                                             tickLine={false}
                                             width={120}
                                             tick={{ fontSize: 11, fill: '#475569' }}
                                        />
                                        <Tooltip
                                             cursor={{ fill: 'transparent' }}
                                             content={({ active, payload }) => {
                                                  if (active && payload && payload.length) {
                                                       return (
                                                            <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100">
                                                                 <p className="text-sm font-light text-gray-800">{payload[0].payload.name}</p>
                                                                 <p className="text-xs text-purple-600 font-normal mt-1">{payload[0].value} sold</p>
                                                            </div>
                                                       );
                                                  }
                                                  return null;
                                             }}
                                        />
                                        <Bar dataKey="totalQuantity" radius={[0, 10, 10, 0]} barSize={20}>
                                             {topProducts.map((entry, index) => (
                                                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                             ))}
                                        </Bar>
                                   </BarChart>
                              </ResponsiveContainer>
                         ) : (
                              <EmptyState
                                   icon={MdInventory2}
                                   message="No product sales data available."
                              />
                         )}
                    </div>
               </AdminCard>

               {/* Order Distribution Donut Chart */}
               <AdminCard noPadding className="lg:col-span-2">
                    <div className="px-8 py-6 border-b border-gray-100">
                         <h3 className="text-[11px] font-light text-gray-400 uppercase tracking-[0.2em]">Order Status Distribution</h3>
                    </div>
                    <div className="p-8 h-[300px] flex items-center justify-around flex-wrap">
                         {hasOrderDist ? (
                              <>
                                   <div className="w-full md:w-1/2 h-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                             <PieChart>
                                                  <Pie
                                                       data={orderDistribution}
                                                       cx="50%"
                                                       cy="50%"
                                                       innerRadius={70}
                                                       outerRadius={100}
                                                       paddingAngle={5}
                                                       dataKey="value"
                                                  >
                                                       {orderDistribution.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                       ))}
                                                  </Pie>
                                                  <Tooltip />
                                             </PieChart>
                                        </ResponsiveContainer>
                                   </div>
                                   <div className="w-full md:w-1/2 flex flex-col gap-4">
                                        {orderDistribution.map((item, index) => (
                                             <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 hover:bg-white transition-all cursor-default group border border-transparent hover:border-gray-100">
                                                  <div className="flex items-center gap-3">
                                                       <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}></div>
                                                       <span className="text-sm font-light text-gray-600 group-hover:text-gray-900 transition-colors">{item.name}</span>
                                                  </div>
                                                  <span className="font-normal text-gray-900">{item.value}</span>
                                             </div>
                                        ))}
                                   </div>
                              </>
                         ) : (
                              <EmptyState
                                   icon={MdDonutSmall}
                                   message="No orders to display distribution."
                              />
                         )}
                    </div>
               </AdminCard>
          </div>
     );
}
