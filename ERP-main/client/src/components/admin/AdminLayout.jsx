import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import useSidebarStore from "../../store/useSidebarStore";

export default function AdminLayout() {
  const { collapsed } = useSidebarStore();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">

      {/* SIDEBAR (fixed) */}
      <AdminSidebar />

      {/* MAIN CONTENT */}
      <main
        className={`
          min-h-screen
          p-6 md:p-8
          overflow-y-auto
          transition-all duration-300

          /* 🔑 IMPORTANT: exact match with sidebar width */
          ${collapsed ? "md:ml-20" : "md:ml-72"}
        `}
      >
        <Outlet />
      </main>

    </div>
  );
}
