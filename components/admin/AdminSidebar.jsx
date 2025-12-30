"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
} from "react-icons/md";

const menuItems = [
  {
    name: "Dashboard",
    icon: <MdDashboard />,
    path: "/admin/dashboard",
  },
  {
    name: "Catalog",
    icon: <MdInventory />,
    submenu: [
      {
        name: "Categories",
        path: "/admin/catalog/categories",
        icon: <MdCategory />,
      },
      { name: "Products", path: "/admin/catalog/products", icon: <MdLayers /> },
      {
        name: "Stock Mgmt",
        path: "/admin/catalog/stock",
        icon: <MdAssignment />,
      },
    ],
  },
  {
    name: "Vendors",
    icon: <MdStore />,
    submenu: [
      { name: "Vendor List", path: "/admin/vendors/list" },
      { name: "Assignment", path: "/admin/vendors/assignment" },
      { name: "Vendor Stock", path: "/admin/vendors/stock" },
    ],
  },
  {
    name: "Orders",
    icon: <MdShoppingCart />,
    submenu: [
      { name: "All Orders", path: "/admin/orders/all" },
      { name: "Returns", path: "/admin/orders/returns" },
      {
        name: "Temp Carts",
        path: "/admin/temp-carts",
        icon: <MdShoppingCart />,
      },
    ],
  },
  {
    name: "Hyperlocal",
    icon: <MdLocationOn />,
    submenu: [
      { name: "Pincodes", path: "/admin/hyperlocal/pincodes" },
      { name: "Serviceability", path: "/admin/hyperlocal/serviceability" },
      { name: "Area Products", path: "/admin/hyperlocal/area-products" },
    ],
  },
  {
    name: "Customers",
    icon: <MdPeople />,
    path: "/admin/customers",
  },
  {
    name: "Reports",
    icon: <MdBarChart />,
    path: "/admin/reports",
  },
  {
    name: "Settings",
    icon: <MdSettings />,
    path: "/admin/settings",
  },
];

import { useAdminSidebar } from "@/context/AdminSidebarContext";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState({});
  const { isSidebarOpen, closeSidebar } = useAdminSidebar();

  const toggleMenu = (name) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
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

      <aside
        className={`w-64 h-screen bg-white text-gray-800 fixed left-0 top-0 flex flex-col shadow-xl z-50 transition-all duration-300 overflow-hidden border-r border-gray-100 
                    ${
                      isSidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0"
                    }`}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-100 bg-white/80 backdrop-blur-sm shrink-0">
          <h1 className="text-xl font-light tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            FERMENTAA
            <span className="text-xs ml-1 font-light text-gray-400">ADMIN</span>
          </h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 space-y-1 px-3 custom-scrollbar">
          <IconContext.Provider value={{ size: "1.2rem" }}>
            {menuItems.map((item) => {
              const isActive =
                item.path === pathname ||
                (item.submenu &&
                  item.submenu.some((sub) => sub.path === pathname));
              const isOpen =
                openMenus[item.name] ||
                (isActive && openMenus[item.name] === undefined);

              if (item.submenu) {
                return (
                  <div key={item.name} className="mb-1">
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 group
                          ${
                            isActive
                              ? "text-primary bg-primary/10 font-normal"
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-light"
                          }`}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={`${
                            isActive
                              ? "text-primary"
                              : "text-gray-400 group-hover:text-gray-600"
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span className="text-sm font-light uppercase tracking-wider text-[11px]">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-gray-400">
                        {isOpen ? (
                          <MdKeyboardArrowDown />
                        ) : (
                          <MdKeyboardArrowRight />
                        )}
                      </span>
                    </button>

                    {/* Submenu */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        isOpen
                          ? "max-h-96 opacity-100 mt-1"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="pl-12 pr-2 space-y-1 relative">
                        {/* Line guide */}
                        <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-100"></div>

                        {item.submenu.map((subItem) => {
                          const isSubActive = pathname === subItem.path;
                          return (
                            <Link
                              key={subItem.path}
                              href={subItem.path}
                              className={`block py-2 px-3 rounded-lg text-xs font-light transition-colors relative
                                  ${
                                    isSubActive
                                      ? "text-primary bg-secondary/20"
                                      : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                                  }`}
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
                       ${
                         isActive
                           ? "bg-secondary text-white shadow-lg shadow-secondary/20 font-normal"
                           : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-light"
                       }`}
                >
                  <span
                    className={`${
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-600"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="font-light text-sm uppercase tracking-wider text-[11px]">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </IconContext.Provider>
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button className="flex items-center gap-4 w-full px-4 py-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group">
            <MdLogout
              size="1.2rem"
              className="group-hover:translate-x-1 transition-transform"
            />
            <span className="text-[11px] font-light uppercase tracking-widest text-sm">
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
