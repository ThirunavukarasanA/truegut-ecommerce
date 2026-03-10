import React, { useState } from "react";

export default function ProductTabs({ product }) {
     const [activeTab, setActiveTab] = useState("description");

     const tabs = [
          { id: "description", label: "Description", content: product.detailedDescription || product.description },
          { id: "nutrition", label: "Nutrition", content: product.nutrition },
          { id: "history", label: "History", content: product.history },
          { id: "microbial profile", label: "Microbial Profile", content: product.microbialProfile },
     ];

     return (
          <div className="border-t border-gray-200 pt-12">
               {/* Tab Headers */}
               <div className="flex justify-center mb-12 overflow-x-auto scrollbar-hide">
                    <div className="flex items-center gap-8 min-w-max px-4">
                         {tabs.map((tab) => (
                              <button
                                   key={tab.id}
                                   onClick={() => setActiveTab(tab.id)}
                                   className={`pb-4 text-lg font-bold uppercase tracking-wide transition-colors relative ${activeTab === tab.id ? "text-gray-800" : "text-gray-400 hover:text-gray-600"
                                        }`}
                              >
                                   {tab.label}
                                   {activeTab === tab.id && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600"></span>}
                              </button>
                         ))}
                    </div>
               </div>

               {/* Tab Content */}
               <div className="max-w-4xl mx-auto min-h-[200px] px-4">
                    {tabs.map(
                         (tab) =>
                              activeTab === tab.id && (
                                   <div key={tab.id} className="animate-fadeIn">
                                        <h4 className="text-lg font-bold text-gray-800 mb-6 underline underline-offset-4 decoration-2 decoration-secondary">
                                             {tab.label}
                                        </h4>
                                        <div
                                             className="text-gray-600 leading-relaxed tracking-wide rich-text-content wrap-break-word w-full"
                                             dangerouslySetInnerHTML={{ __html: tab.content || "Information not available at the moment." }}
                                        />

                                        {tab.id === "description" && product.specs && product.specs.length > 0 && (
                                             <div className="mt-8">
                                                  <h4 className="text-lg font-bold text-gray-800 mb-4">Key Specification</h4>
                                                  <ul className="list-disc list-outside pl-5 space-y-2 text-gray-600 marker:text-gray-400">
                                                       {product.specs.map((item, i) => (
                                                            <li key={i}>{item}</li>
                                                       ))}
                                                  </ul>
                                             </div>
                                        )}
                                   </div>
                              )
                    )}
               </div>

               <style jsx global>{`
        .rich-text-content {
          word-break: break-word;
          overflow-wrap: break-word;
          overflow-wrap: anywhere;
          max-width: 100%;
          counter-reset: item;
        }
        .rich-text-content h1,
        .rich-text-content h2,
        .rich-text-content h3 {
          font-weight: 700;
          margin-bottom: 0.75rem;
          margin-top: 1.5rem;
          color: #1f2937;
        }
        .rich-text-content p {
          margin-bottom: 1rem;
          line-height: 1.75;
        }
        .rich-text-content ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .rich-text-content ol {
          list-style-type: none;
          padding-left: 0;
          margin-bottom: 1rem;
          counter-reset: item;
        }
        .rich-text-content ol > li {
          counter-increment: item;
          position: relative;
          padding-left: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .rich-text-content ol > li::before {
          content: counter(item) ".";
          position: absolute;
          left: 0;
          font-weight: bold;
          color: #1f2937;
        }
        .rich-text-content a {
          color: #ea580c;
          text-decoration: underline;
        }
        .rich-text-content blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          font-style: italic;
          color: #4b5563;
          margin-bottom: 1rem;
        }
      `}</style>
          </div>
     );
}
