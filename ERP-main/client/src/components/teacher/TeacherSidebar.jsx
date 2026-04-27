import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { teacherSidebarConfig } from "@/config/teacherSidebarConfig";
import { ChevronUp, User, KeyRound, LogOut } from "lucide-react";

export default function TeacherSidebar({ collapsed, isMobile, onToggle }) {
  const [openMenus, setOpenMenus] = useState({});
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate   = useNavigate();
  const location   = useLocation();

  const [teacherName, setTeacherName] = useState(
    localStorage.getItem("name") ||
    (() => {
      const e = localStorage.getItem("email") || "";
      return e ? e.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "Teacher";
    })()
  );
  const [teacherEmail, setTeacherEmail] = useState(localStorage.getItem("email") || "");

  /* re-read from localStorage when TeacherLayout fetches and stores the name */
  useEffect(() => {
    const onStorage = () => {
      const n = localStorage.getItem("name");
      const e = localStorage.getItem("email");
      if (n) setTeacherName(n);
      if (e) setTeacherEmail(e);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /* auto-open parent menu if child is active */
  useEffect(() => {
    teacherSidebarConfig.forEach(section => {
      section.items.forEach(item => {
        if (item.children) {
          const childActive = item.children.some(c => location.pathname.startsWith(c.to));
          if (childActive) setOpenMenus(p => ({ ...p, [item.label]: true }));
        }
      });
    });
  }, [location.pathname]);

  /* close profile on outside click */
  useEffect(() => {
    const handler = e => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  const toggleMenu = label =>
    setOpenMenus(p => ({ ...p, [label]: !p[label] }));

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 flex flex-col
        bg-[#111111] border-r border-white/[0.06]
        transition-all duration-300 ease-in-out
        ${collapsed
          ? isMobile ? "-translate-x-full" : "w-20"
          : "w-72 translate-x-0"
        }
      `}
    >
      {/* BRAND */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-white/[0.06]">
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-indigo-500/30 border border-indigo-500/40 flex items-center justify-center text-sm font-bold text-indigo-300 flex-shrink-0">
              {teacherName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate leading-tight">{teacherName}</p>
              <p className="text-[10px] text-gray-600 truncate">Teacher</p>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="text-gray-500 hover:text-white transition p-1.5 rounded-lg hover:bg-white/10 flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* NAV */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-5">
        {teacherSidebarConfig.map(section => (
          <div key={section.section}>
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest text-gray-600 uppercase">
                {section.section}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map(item =>
                item.children ? (
                  <div key={item.label}>
                    <button
                      onClick={() => toggleMenu(item.label)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/[0.06] transition"
                    >
                      <span className="text-base">{item.icon}</span>
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          <span className="text-xs opacity-40">
                            {openMenus[item.label] ? "▾" : "▸"}
                          </span>
                        </>
                      )}
                    </button>
                    {!collapsed && openMenus[item.label] && (
                      <div className="ml-6 mt-1 space-y-0.5 border-l border-white/[0.08] pl-3">
                        {item.children.map(child => (
                          <SidebarItem key={child.to} {...child} collapsed={collapsed} />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <SidebarItem key={item.to} {...item} collapsed={collapsed} />
                )
              )}
            </div>
          </div>
        ))}
      </nav>

      {/* FOOTER — PROFILE */}
      <div className="px-3 py-3 border-t border-white/[0.06]" ref={profileRef}>
        {profileOpen && !collapsed && (
          <div className="mb-2 rounded-xl border border-white/10 bg-[#1a1a1a] overflow-hidden shadow-2xl">
            <button
              onClick={() => { setProfileOpen(false); navigate("/teacher/profile"); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/[0.06] hover:text-white transition"
            >
              <User size={14} className="text-indigo-400" /> Profile
            </button>
            <button
              onClick={() => { setProfileOpen(false); navigate("/change-password"); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/[0.06] hover:text-white transition"
            >
              <KeyRound size={14} className="text-amber-400" /> Change Password
            </button>
            <div className="border-t border-white/[0.06]" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
            >
              <LogOut size={14} /> Log out
            </button>
          </div>
        )}

        <button
          onClick={() => !collapsed && setProfileOpen(o => !o)}
          className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/[0.06] transition ${collapsed ? "justify-center" : ""}`}
        >
          <div className="w-8 h-8 rounded-full bg-indigo-500/30 border border-indigo-500/40 flex items-center justify-center text-sm font-bold text-indigo-300 flex-shrink-0">
            {teacherEmail.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs font-semibold text-gray-200 truncate">{teacherName}</p>
                <p className="text-[11px] text-gray-600 truncate">{teacherEmail}</p>
              </div>
              <ChevronUp size={14} className={`text-gray-600 transition-transform flex-shrink-0 ${profileOpen ? "" : "rotate-180"}`} />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

/* SIDEBAR ITEM */
function SidebarItem({ to, label, icon, collapsed }) {
  return (
    <NavLink
      to={to}
      end={to === "/teacher"}
      className={({ isActive }) => `
        group relative flex items-center gap-3
        px-3 py-2.5 rounded-xl text-sm transition-all
        ${isActive
          ? "bg-indigo-500/15 text-indigo-400 font-semibold"
          : "text-gray-400 hover:text-white hover:bg-white/[0.06]"
        }
      `}
    >
      <span className="text-base">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}
