"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import "react-quill-new/dist/quill.snow.css";

// Dynamic import to avoid SSR issues with Quill
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function AdminRichText({
  label,
  value,
  onChange,
  placeholder,
  helperText,
  error,
  required = false,
  icon: Icon,
}) {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [3, 4, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "clean"],
      ],
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
  ];

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <div className="flex justify-between items-center ml-1">
          <label className="text-[11px] font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            {Icon && <Icon size={14} className="text-gray-400" />}
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {helperText && (
            <span className="text-[10px] font-medium text-gray-400">
              {helperText}
            </span>
          )}
        </div>
      )}

      <div
        className={`
                relative rounded-2xl overflow-hidden bg-gray-50 border transition-all
                ${
                  error
                    ? "border-red-300 ring-4 ring-red-50/50"
                    : "border-gray-100 focus-within:bg-white focus-within:border-primary/20 focus-within:ring-4 focus-within:ring-primary/5"
                }
            `}
      >
        <style jsx global>{`
          .quill {
            border: none !important;
          }
          .ql-toolbar.ql-snow {
            border: none !important;
            border-bottom: 1px solid #f3f4f6 !important;
            padding: 12px 16px !important;
          }
          .ql-container.ql-snow {
            border: none !important;
            font-family: inherit !important;
            font-size: 14px !important;
          }
          .ql-editor {
            min-height: 120px;
            padding: 16px !important;
            color: #374151;
          }
          .ql-editor.ql-blank::before {
            color: #d1d5db;
            font-style: normal;
          }
        `}</style>
        <ReactQuill
          theme="snow"
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          modules={modules}
          formats={formats}
          className="bg-transparent"
        />
      </div>

      {error && (
        <p className="text-[11px] font-bold text-red-500 flex items-center gap-1.5 ml-1 animate-in slide-in-from-left-1">
          <span className="w-1 h-1 rounded-full bg-red-500" />
          {error}
        </p>
      )}
    </div>
  );
}
