"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const AdminSidebarContext = createContext();

export function AdminSidebarProvider({ children }) {
     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
     const pathname = usePathname();

     // Close sidebar on path change (mobile)
     useEffect(() => {
          setIsSidebarOpen(false);
     }, [pathname]);

     const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
     const closeSidebar = () => setIsSidebarOpen(false);

     return (
          <AdminSidebarContext.Provider value={{ isSidebarOpen, toggleSidebar, closeSidebar }}>
               {children}
          </AdminSidebarContext.Provider>
     );
}

export function useAdminSidebar() {
     const context = useContext(AdminSidebarContext);
     if (context === undefined) {
          throw new Error("useAdminSidebar must be used within an AdminSidebarProvider");
     }
     return context;
}
