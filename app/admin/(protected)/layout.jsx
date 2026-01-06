"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { AdminSidebarProvider, useAdminSidebar } from "@/context/AdminSidebarContext";
import { SettingsProvider } from "@/context/SettingsContext";
import "@/app/globals.css";

function AdminLayoutContent({ children }) {
     const { isSidebarOpen } = useAdminSidebar();

     return (
          <div className="min-h-screen bg-bg-color">
               <AdminSidebar />

               {/* Main Content Area */}
               <div className={`transition-all duration-300 min-h-screen flex flex-col lg:ml-64 ${isSidebarOpen ? 'ml-0' : 'ml-0'}`}>
                    <AdminHeader />
                    <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-full">
                         {children}
                    </main>
               </div>
          </div>
     );
}

export default function AdminLayout({ children }) {
     return (
          <SettingsProvider>
               <AdminSidebarProvider>
                    <AdminLayoutContent>{children}</AdminLayoutContent>
               </AdminSidebarProvider>
          </SettingsProvider>
     );
}
