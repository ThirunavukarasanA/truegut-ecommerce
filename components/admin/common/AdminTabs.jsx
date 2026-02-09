"use client";

export default function AdminTabs({ tabs, activeTab, onChange }) {
     return (
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 inline-flex overflow-x-auto max-w-full scrollbar-hide">
               {tabs.map((tab) => {
                    const value = typeof tab === 'object' ? (tab.id || tab.value) : tab;
                    const label = typeof tab === 'object' ? (tab.label || tab.name) : tab;
                    const isActive = activeTab === value;

                    return (
                         <button
                              key={value}
                              onClick={() => onChange(value)}
                              className={`px-6 py-2.5 rounded-xl text-[10px] font-light transition-all whitespace-nowrap uppercase tracking-widest ${isActive
                                   ? "bg-primary text-white shadow-md shadow-gray-200"
                                   : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                                   }`}
                         >
                              {label}
                         </button>
                    );
               })}
          </div>
     );
}
