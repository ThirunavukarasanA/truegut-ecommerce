"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { IconContext } from "react-icons";
import {
     MdDashboard,
     MdShoppingCart,
     MdPeople,
     MdInventory,
     MdSettings,
     MdLogout,
     MdStore,
     MdLocationOn,
     MdBarChart,
     MdKeyboardArrowDown,
     MdKeyboardArrowRight,
     MdCategory,
     MdLayers,
     MdAssignment,
     MdLocalShipping,
     MdNotifications,
     MdMap
} from "react-icons/md";
import toast from "react-hot-toast";

import { useAdminSidebar } from "@/context/AdminSidebarContext";
import { adminFetchWithToast, adminFetch } from "@/lib/admin/adminFetch";

export default function AdminSidebar() {
     const pathname = usePathname();
     const router = useRouter();
     const [openMenus, setOpenMenus] = useState({});
     const [loggingOut, setLoggingOut] = useState(false);
     const { isSidebarOpen, closeSidebar } = useAdminSidebar();
     const [userRole, setUserRole] = useState(null);
     const [menuItems, setMenuItems] = useState([]);

     useEffect(() => {
          const fetchUser = async () => {
               try {
                    const res = await adminFetch("/api/auth/me");
                    if (res && res.user) {
                         setUserRole(res.user.role);
                         generateMenu(res.user.role);
                    }
               } catch (error) {
                    console.error("Failed to fetch user role", error);
               }
          };
          fetchUser();
     }, []);

     const generateMenu = (role) => {
          if (role === 'vendor') {
               setMenuItems([
                    {
                         name: "My Orders",
                         icon: <MdShoppingCart />,
                         path: "/admin/orders/vendor"
                    },
                    {
                         name: "Settings", // Maybe profile?
                         icon: <MdSettings />,
                         path: "/admin/settings" // Or profile page
                    }
               ]);
               return;
          }

          // Admin Menu
          setMenuItems([
               {
                    name: "Dashboard",
                    icon: <MdDashboard />,
                    path: "/admin/dashboard"
               },
               {
                    name: "Catalog",
                    icon: <MdInventory />,
                    submenu: [
                         { name: "Categories", path: "/admin/catalog/categories", icon: <MdCategory /> },
                         { name: "Products", path: "/admin/catalog/products", icon: <MdLayers /> },
                         { name: "Variants", path: "/admin/catalog/variants", icon: <MdLayers /> },
                    ]
               },
               {
                    name: "Stock Management",
                    icon: <MdLayers />,
                    submenu: [
                         { name: "Add Batch", path: "/admin/stockmanagement" }, // Keeping existing path as main/add
                         { name: "Allocate Stock", path: "/admin/stockmanagement/allocate" }, // New
                    ]
               },
               {
                    name: "Vendors",
                    icon: <MdStore />,
                    submenu: [
                         { name: "Vendor List", path: "/admin/vendors/list" },
                         { name: "Pincode Mapping", path: "/admin/pincodes/mapping" }, // New
                         { name: "Vendor Stock", path: "/admin/vendors/vendor-stock" },

                    ]
               },
               {
                    name: "Orders",
                    icon: <MdShoppingCart />,
                    submenu: [
                         { name: "All Orders", path: "/admin/orders/all" },
                         { name: "Returns", path: "/admin/orders/returns" },
                         { name: "Temp Carts", path: "/admin/temp-carts", icon: <MdShoppingCart /> },
                         { name: "Vendor Orders", path: "/admin/orders/vendor" }, // Admin view of vendor orders
                    ]
               },
               {
                    name: "Pincodes",
                    icon: <MdLocationOn />,
                    path: "/admin/pincodes"
               },
               {
                    name: "Customers",
                    icon: <MdPeople />,
                    path: "/admin/customers"
               },
               {
                    name: "Restock Requests",
                    icon: <MdNotifications />,
                    path: "/admin/restock-requests"
               },
               {
                    name: "Reports",
                    icon: <MdBarChart />,
                    path: "/admin/reports"
               },
               {
                    name: "Settings",
                    icon: <MdSettings />,
                    path: "/admin/settings"
               },
          ]);
     };

     const toggleMenu = (name, isActive) => {
          setOpenMenus(prev => {
               const currentState = prev[name] !== undefined ? prev[name] : isActive;
               return { ...prev, [name]: !currentState };
          });
     };

     const handleLogout = async () => {
          setLoggingOut(true);

          try {
               await adminFetchWithToast(
                    "/api/auth/logout",
                    { method: "POST" },
                    {
                         loading: "Signing out...",
                         success: "Logged out successfully",
                         error: "Logout failed"
                    },
                    toast
               );
               router.push("/admin");
          } catch (error) {
               console.error(error);
               setLoggingOut(false);
          }
     };

     return (
          <>
               {/* Mobile Backdrop */}
               {isSidebarOpen && (
                    <div
                         className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[45] lg:hidden transition-opacity duration-300"
                         onClick={closeSidebar}
                    />
               )}


               <aside className={`w-64 h-screen bg-white text-font-title fixed left-0 top-0 flex flex-col shadow-xl z-50 transition-all duration-300 overflow-hidden border-r border-gray-100 
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
                    <div className="h-16 flex items-center justify-center border-b border-gray-100 bg-white/80 backdrop-blur-sm shrink-0">
                         <h1 className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                              TRUEGUT
                              <span className="text-xs ml-1 font-light text-primary">ADMIN</span>
                         </h1>
                    </div>

                    <nav className="flex-1 overflow-y-auto py-6 space-y-1 px-3 custom-scrollbar">
                         <IconContext.Provider value={{ size: "1.2rem" }}>
                              {menuItems.map((item) => {
                                   const isActive = item.path === pathname || (item.submenu && item.submenu.some(sub => sub.path === pathname));
                                   const isOpen = openMenus[item.name] || (isActive && openMenus[item.name] === undefined);

                                   if (item.submenu) {
                                        return (
                                             <div key={item.name} className="mb-1">
                                                  <button
                                                       onClick={() => toggleMenu(item.name, isActive)}
                                                       className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 group
                          ${isActive ? "text-primary bg-bg-color font-normal" : "text-gray-500 hover:bg-bg-color hover:text-primary font-light"}`}
                                                  >
                                                       <div className="flex items-center gap-4">
                                                            <span className={`${isActive ? "text-primary" : "text-gray-400 group-hover:text-primary"}`}>
                                                                 {item.icon}
                                                            </span>
                                                            <span className="text-sm font-light uppercase tracking-wider text-[11px]">{item.name}</span>
                                                       </div>
                                                       <span className="text-gray-400">
                                                            {isOpen ? <MdKeyboardArrowDown /> : <MdKeyboardArrowRight />}
                                                       </span>
                                                  </button>

                                                  {/* Submenu */}
                                                  <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                                                       <div className="pl-12 pr-2 space-y-1 relative">
                                                            {/* Line guide */}
                                                            <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-100"></div>

                                                            {item.submenu.map(subItem => {
                                                                 const isSubActive = pathname === subItem.path;
                                                                 return (
                                                                      <Link
                                                                           key={subItem.path}
                                                                           href={subItem.path}
                                                                           className={`block py-2 px-3 rounded-lg text-xs font-light transition-colors relative
                                  ${isSubActive
                                                                                     ? "text-primary bg-bg-color font-medium"
                                                                                     : "text-gray-400 hover:text-primary hover:bg-bg-color"}`}
                                                                      >
                                                                           {subItem.name}
                                                                      </Link>
                                                                 );
                                                            })}
                                                       </div>
                                                  </div>
                                             </div>
                                        );
                                   }

                                   return (
                                        <Link
                                             key={item.path}
                                             href={item.path}
                                             className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group mb-1
                       ${isActive
                                                       ? "bg-primary text-white shadow-lg shadow-gray-200 font-normal"
                                                       : "text-gray-500 hover:bg-bg-color hover:text-primary font-light"
                                                  }`}
                                        >
                                             <span className={`${isActive ? "text-white" : "text-gray-400 group-hover:text-primary"}`}>
                                                  {item.icon}
                                             </span>
                                             <span className="font-light text-sm uppercase tracking-wider text-[11px]">{item.name}</span>
                                        </Link>
                                   );
                              })}
                         </IconContext.Provider>
                    </nav>

                    <div className="p-4 border-t border-gray-100 bg-bg-color/50">
                         <button
                              onClick={handleLogout}
                              disabled={loggingOut}
                              className="flex items-center gap-4 w-full px-4 py-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                              <MdLogout size="1.2rem" className="group-hover:translate-x-1 transition-transform" />
                              <span className="text-[11px] font-light uppercase tracking-widest text-sm">
                                   {loggingOut ? "Logging out..." : "Logout"}
                              </span>
                         </button>
                    </div>
               </aside>
          </>
     );
}