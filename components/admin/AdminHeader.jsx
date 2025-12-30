import { MdNotifications, MdSearch, MdPerson, MdMenu } from "react-icons/md";
import AdminProfileDropdown from "./common/AdminProfileDropdown";
import { useAdminSidebar } from "@/context/AdminSidebarContext";

export default function AdminHeader() {
  const { toggleSidebar } = useAdminSidebar();

  return (
    <header className="h-20 bg-white/40 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 transition-all">
      <div className="flex items-center gap-4 flex-1">
        {/* Menu Toggle - Mobile Only */}
        <button
          onClick={toggleSidebar}
          className="p-2.5 text-gray-500 hover:bg-gray-50 rounded-xl lg:hidden transition-all border border-gray-100 shadow-sm"
        >
          <MdMenu size={24} />
        </button>

        {/* Search */}
        <div className="flex items-center gap-3 bg-white/80 px-4 py-2.5 rounded-2xl border border-gray-100 focus-within:border-secondary/30 focus-within:ring-4 focus-within:ring-secondary/5 transition-all w-full lg:w-[32rem] shadow-sm shadow-gray-100/50">
          <MdSearch className="text-gray-400 text-xl flex-shrink-0" />
          <input
            type="text"
            placeholder="Quick search..."
            className="bg-transparent border-none outline-none text-[13px] w-full text-gray-600 placeholder-gray-400 font-light"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 md:gap-8 ml-4">
        <button className="relative p-2.5 text-gray-400 hover:text-secondary bg-white rounded-xl border border-gray-50 shadow-sm transition-all hover:shadow-md hidden sm:block">
          <MdNotifications size={22} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <AdminProfileDropdown />
      </div>
    </header>
  );
}
