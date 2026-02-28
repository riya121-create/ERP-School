import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import useSidebarStore from "@/store/useSidebarStore";
import { adminSidebarConfig } from "@/config/adminSidebarConfig";
import { useLocation } from "react-router-dom";

function AdminSidebar() {
  const { collapsed, toggle } = useSidebarStore();
  const [openMenus, setOpenMenus] = useState({});
  const navigate = useNavigate();

  // 📱 MOBILE DETECTOR
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
const location = useLocation();

useEffect(() => {
  // 💻 Desktop: route change pe sidebar hamesha open
  if (!isMobile) {
    useSidebarStore.getState().open();
  }
}, [location.pathname, isMobile]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = () => {
    useSidebarStore.getState().close();
    localStorage.clear();
    navigate("/", { replace: true });
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40
        flex flex-col
        bg-white/80 dark:bg-gray-900/80
        backdrop-blur-xl
        border-r border-gray-200 dark:border-gray-800
        transition-all duration-300 ease-in-out

        ${
          collapsed
            ? isMobile
              ? "-translate-x-full" // 📱 mobile = hide
              : "w-20"              // 💻 desktop = mini
            : "w-72 translate-x-0" // open
        }
      `}
    >
      {/* ===== BRAND ===== */}
      <div className="h-16 px-4 flex items-center justify-between border-b dark:border-gray-800">
        {!collapsed && (
          <h1 className="text-lg font-bold tracking-tight">
            Echelon<span className="text-blue-600">.</span>
          </h1>
        )}
        <button
          onClick={toggle}
          className="text-gray-500 hover:text-black dark:hover:text-white"
        >
          ☰
        </button>
      </div>

      {/* ===== NAV ===== */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
        {adminSidebarConfig.map((section) => (
          <div key={section.section}>
            {!collapsed && (
              <p className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                {section.section}
              </p>
            )}

            <div className="space-y-1">
              {section.items.map((item) =>
                item.children ? (
                  <div key={item.label}>
                    <button
                      onClick={() => toggleMenu(item.label)}
                      className="
                        w-full flex items-center gap-3
                        px-3 py-2.5 rounded-xl text-sm
                        text-gray-700 dark:text-gray-300
                        hover:bg-black/5 dark:hover:bg-white/5
                        transition
                      "
                    >
                      <span className="text-lg">{item.icon}</span>
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">
                            {item.label}
                          </span>
                          <span className="text-xs opacity-60">
                            {openMenus[item.label] ? "▾" : "▸"}
                          </span>
                        </>
                      )}
                    </button>

                    {!collapsed && openMenus[item.label] && (
                      <div className="ml-6 mt-1 space-y-1 border-l border-gray-200 dark:border-gray-700 pl-3">
                        {item.children.map((child) => (
                          <SidebarItem
                            key={child.to}
                            {...child}
                            collapsed={collapsed}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <SidebarItem
                    key={item.to}
                    {...item}
                    collapsed={collapsed}
                  />
                )
              )}
            </div>
          </div>
        ))}
      </nav>

      {/* ===== FOOTER ===== */}
      <div className="px-3 py-3 border-t dark:border-gray-800">
        <button
          onClick={handleLogout}
          className="
            w-full flex items-center gap-3
            px-3 py-2.5 rounded-xl text-sm
            text-red-600
            hover:bg-red-50 dark:hover:bg-white/5
            transition
          "
        >
          <span className="text-lg">🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

/* =========================
   SIDEBAR ITEM
========================= */
function SidebarItem({ to, label, icon, collapsed }) {
  return (
    <NavLink
      to={to}
      end={to === "/admin"}
      className={({ isActive }) =>
        `
        group relative flex items-center gap-3
        px-3 py-2.5 rounded-xl text-sm
        transition-all
        ${
          isActive
            ? "bg-blue-50 text-blue-600 font-semibold dark:bg-white/10"
            : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"
        }
        `
      }
    >
      {/* ACTIVE INDICATOR */}
      <span
        className={`
          absolute left-0 top-1/2 -translate-y-1/2
          h-6 w-1 rounded-r
          bg-blue-600
          ${collapsed ? "hidden" : ""}
        `}
      />

      <span className="text-lg">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

export default AdminSidebar;
