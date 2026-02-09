"use client";

import React from 'react';
import Loader from './Loader';

export default function AdminTable({
     headers,
     children,
     loading,
     loadingMessage = "Loading...",
     emptyMessage = "No records found.",
     colCount = 6
}) {
     return (
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
               <div className="overflow-x-auto">
                    <table className="w-full text-left">
                         <thead className="bg-gray-50/50 text-gray-500 text-[11px] uppercase tracking-[0.1em] font-light border-b border-gray-50">
                              <tr>
                                   {headers.map((header, index) => (
                                        <th
                                             key={index}
                                             className={`px-8 py-5 ${header.align === 'right' ? 'text-right' : ''}`}
                                        >
                                             {header.label}
                                        </th>
                                   ))}
                              </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-50">
                              {loading ? (
                                   <tr>
                                        <td colSpan={colCount} className="px-8 py-20 text-center">
                                             <div className="flex flex-col items-center gap-4">
                                                  <Loader size="large" />
                                                  <p className="text-gray-400 font-light text-xs animate-pulse tracking-widest uppercase">{loadingMessage}</p>
                                             </div>
                                        </td>
                                   </tr>
                              ) : !children || (Array.isArray(children) && children.length === 0) ? (
                                   <tr>
                                        <td colSpan={colCount} className="px-8 py-20 text-center">
                                             <div className="text-gray-400 font-medium text-sm italic">{emptyMessage}</div>
                                        </td>
                                   </tr>
                              ) : (
                                   children
                              )}
                         </tbody>
                    </table>
               </div>
          </div>
     );
}
