import React, { useState } from "react";
import { MdDownload } from "react-icons/md";

export default function ProductTabs({ product }) {
  console.log("product : ", product);
  const [activeTab, setActiveTab] = useState("description");
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async (tab) => {
    if (typeof window === "undefined" || !tab.content) return;
    setIsDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = document.createElement("div");

      // Wrapping content in a styled container for neat PDF output
      element.innerHTML = `
      <style>
          .pdf-content { color: #374151; }
          .pdf-content h1, .pdf-content h2, .pdf-content h3 { font-weight: 700; margin-bottom: 0.75rem; margin-top: 1.5rem; color: #1f2937; }
          .pdf-content p { margin-bottom: 1rem; line-height: 1.75; }
          .pdf-content ul { list-style-type: disc !important; padding-left: 2rem !important; margin-bottom: 1rem; display: block; }
          .pdf-content ol { list-style-type: decimal !important; padding-left: 2rem !important; margin-bottom: 1rem; display: block; }
          .pdf-content li { margin-bottom: 0.5rem; display: list-item; }
          .pdf-content strong { font-weight: bold; color: #1f2937; }
        </style>
        <div style="padding: 40px; font-family: sans-serif; color: #374151; position: relative; min-height: 1000px;">
          <!-- Watermark -->
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; z-index: -1;">
            <img src="${window.location.origin}/logos/truegut.png" style="width: 400px; max-width: 80%; opacity: 0.1;" />
          </div>
          
          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; z-index: 10;">
            <img src="${window.location.origin}/logos/truegut.png" style="height: 60px; object-fit: contain;" />
            <div style="display: flex; align-items: center; gap: 8px; font-size: 16px; color: #1f2937; font-weight: 500;">
              <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" style="color: #60a5fa; font-size: 20px; margin-right: 6px; position: relative; top: 5px;" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 00-1.38-3.56A8.03 8.03 0 0118.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.987 7.987 0 015.08 16zm2.95-8H5.08a7.987 7.987 0 013.9-3.56C8.38 5.55 7.92 6.75 7.6 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 01-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"></path></svg>
              <span>: www.truegut.in</span>
            </div>
          </div>
          
          <!-- Orange Divider -->
          <div style="height: 3px; background-color: #f97316; width: 100%; margin-bottom: 30px;"></div>

          <div class="pdf-content" style="line-height: 1.8; font-size: 15px; position: relative; z-index: 10;">
            <h2 style="font-size: 26px; border-bottom: 2px solid #ea580c; display: inline-block; padding-bottom: 8px; margin-bottom: 25px;">${product.name} Product Usage</h2>
            ${tab.content}
          </div>

        </div>
      `;

      const opt = {
        margin: 10,
        filename: `${product.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-usage-guide.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const tabs = [
    {
      id: "description",
      label: "Description",
      content: product.detailedDescription || product.description,
    },
    { id: "nutrition", label: "Nutrition", content: product.nutrition },
    { id: "history", label: "History", content: product.history },
    { id: "product usage", label: "Product Usage", content: product.usage },
    {
      id: "microbial profile",
      label: "Microbial Profile",
      content: product.microbialProfile,
    },
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
              className={`pb-4 text-lg font-bold uppercase tracking-wide transition-colors relative ${
                activeTab === tab.id
                  ? "text-gray-800"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600"></span>
              )}
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
                  dangerouslySetInnerHTML={{
                    __html:
                      tab.content || "Information not available at the moment.",
                  }}
                />

                {tab.id === "product usage" && tab.content && (
                  <div className="mt-10 flex justify-start border-t border-gray-100 pt-6">
                    <button
                      onClick={() => handleDownloadPdf(tab)}
                      disabled={isDownloading}
                      className="flex items-center gap-2 bg-secondary text-white px-6 py-3 rounded-xl font-medium shadow-md shadow-orange-500/20 hover:bg-[#c2410c] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MdDownload
                        size={20}
                        className={isDownloading ? "animate-bounce" : ""}
                      />
                      <span>
                        {isDownloading
                          ? "Generating PDF..."
                          : "Download Product Usage"}
                      </span>
                    </button>
                  </div>
                )}

                {tab.id === "description" &&
                  product.specs &&
                  product.specs.length > 0 && (
                    <div className="mt-8">
                      <h4 className="text-lg font-bold text-gray-800 mb-4">
                        Key Specification
                      </h4>
                      <ul className="list-disc list-outside pl-5 space-y-2 text-gray-600 marker:text-gray-400">
                        {product.specs.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            ),
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
