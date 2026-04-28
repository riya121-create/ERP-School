import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, ClipboardList, CalendarDays, GraduationCap,
  Wallet, User, LogOut, ChevronUp, KeyRound, Menu, BookOpen, Megaphone,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "overview",      label: "Overview",      icon: <LayoutDashboard size={16} /> },
  { id: "attendance",    label: "Attendance",    icon: <ClipboardList size={16} /> },
  { id: "timetable",     label: "Timetable",     icon: <CalendarDays size={16} /> },
  { id: "results",       label: "Results",       icon: <GraduationCap size={16} /> },
  { id: "homework",      label: "Homework",      icon: <BookOpen size={16} /> },
  { id: "fees",          label: "Fees",          icon: <Wallet size={16} /> },
  { id: "announcements", label: "Announcements", icon: <Megaphone size={16} /> },
  { id: "profile",       label: "Profile",       icon: <User size={16} /> },
];

export default function ParentSidebar({
  parent, students, activeStudentId, setActiveStudentId,
  tab, setTab, collapsed, isMobile, onToggle, navigate,
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const h = e => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleLogout = () => { localStorage.clear(); navigate("/", { replace: true }); };
  const initials = parent?.name?.charAt(0).toUpperCase() || "P";

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 flex flex-col
      bg-[#111111] border-r border-white/[0.06]
      transition-all duration-300 ease-in-out
      ${collapsed ? (isMobile ? "-translate-x-full" : "w-20") : "w-72 translate-x-0"}
    `}>

      {/* BRAND */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-white/[0.06]">
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-indigo-500/30 border border-indigo-500/40 flex items-center justify-center text-sm font-bold text-indigo-300 flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate leading-tight">{parent?.name || "Parent"}</p>
              <p className="text-[10px] text-gray-600 truncate">Parent Portal</p>
            </div>
          </div>
        )}
        <button onClick={onToggle}
          className="text-gray-500 hover:text-white transition p-1.5 rounded-lg hover:bg-white/10 flex-shrink-0">
          <Menu size={18} />
        </button>
      </div>

      {/* CHILD SWITCHER */}
      {!collapsed && students.length > 0 && (
        <div className="px-3 pt-4 pb-2 border-b border-white/[0.06]">
          <p className="px-1 mb-2 text-[10px] font-semibold tracking-widest text-gray-600 uppercase">Child</p>
          <div className="space-y-1">
            {students.map(s => (
              <button key={s._id} onClick={() => setActiveStudentId(s._id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all
                  ${s._id === activeStudentId
                    ? "bg-indigo-500/15 text-indigo-400 font-semibold"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.06]"}`}>
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300 flex-shrink-0">
                  {s.name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-left min-w-0">
                  <p className="truncate leading-tight text-sm">{s.name}</p>
                  {s.classId && (
                    <p className="text-[10px] text-gray-600">
                      Class {s.classId.name}-{s.classId.section}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* NAV */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {!collapsed && (
          <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest text-gray-600 uppercase">Navigation</p>
        )}
        <div className="space-y-0.5">
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-all
                ${tab === item.id
                  ? "bg-indigo-500/15 text-indigo-400 font-semibold"
                  : "text-gray-400 hover:text-white hover:bg-white/[0.06]"}
                ${collapsed ? "justify-center" : ""}`}>
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </div>
      </nav>

      {/* FOOTER */}
      <div className="px-3 py-3 border-t border-white/[0.06]" ref={profileRef}>
        {profileOpen && !collapsed && (
          <div className="mb-2 rounded-xl border border-white/10 bg-[#1a1a1a] overflow-hidden shadow-2xl">
            <button onClick={() => { setProfileOpen(false); setTab("profile"); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/[0.06] hover:text-white transition">
              <User size={14} className="text-indigo-400" /> Profile
            </button>
            <button onClick={() => { setProfileOpen(false); navigate("/change-password"); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/[0.06] hover:text-white transition">
              <KeyRound size={14} className="text-amber-400" /> Change Password
            </button>
            <div className="border-t border-white/[0.06]" />
            <button onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition">
              <LogOut size={14} /> Log out
            </button>
          </div>
        )}
        <button onClick={() => !collapsed && setProfileOpen(o => !o)}
          className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/[0.06] transition ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-full bg-indigo-500/30 border border-indigo-500/40 flex items-center justify-center text-sm font-bold text-indigo-300 flex-shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs font-semibold text-gray-200 truncate">{parent?.name}</p>
                <p className="text-[11px] text-gray-600 truncate">Parent</p>
              </div>
              <ChevronUp size={14} className={`text-gray-600 transition-transform flex-shrink-0 ${profileOpen ? "" : "rotate-180"}`} />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
