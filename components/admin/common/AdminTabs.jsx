"use client";

export default function AdminTabs({ tabs, activeTab, onChange }) {
     return (
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 inline-flex overflow-x-auto max-w-full scrollbar-hide">
               {tabs.map((tab) => (
                    <button
                         key={tab}
                         onClick={() => onChange(tab)}
                         className={`px-6 py-2.5 rounded-xl text-[10px] font-light transition-all whitespace-nowrap uppercase tracking-widest ${activeTab === tab
                              ? "bg-purple-600 text-white shadow-md shadow-purple-100"
                              : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                              }`}
                    >
                         {tab}
                    </button>
               ))}
          </div>
     );
}
