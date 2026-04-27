import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import TeacherProfileDrawer from "./TeacherProfileDrawer";
import {
  BookOpen, Users, CalendarCheck, Clock,
  ClipboardList, FileText, BarChart2, Send,
  ChevronRight, GraduationCap, CheckCircle,
  Calendar, ArrowRight, User
} from "lucide-react";

/* =====================================================
   HELPERS
===================================================== */
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

/* =====================================================
   MAIN
===================================================== */
export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [teacher, setTeacher]       = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [stats, setStats]           = useState({ classes: 0, students: 0, attendanceToday: "—" });
  const [classes, setClasses]       = useState([]);
  const [now, setNow]               = useState(new Date());

  useEffect(() => {
    api.get("/teacher/me").then(r => setTeacher(r.data)).catch(() => {});
    api.get("/teacher/dashboard-stats").then(r => setStats(r.data)).catch(() => {});
    api.get("/teacher/classes").then(r => setClasses(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const QUICK_ACTIONS = [
    { label: "Mark Attendance", desc: "Daily student attendance",       icon: <CalendarCheck size={18} />, color: "emerald", path: "/teacher/attendance" },
    { label: "Manage Homework", desc: "Create & assign homework",       icon: <ClipboardList size={18} />, color: "sky",     path: "/teacher/homework"   },
    { label: "Upload Notes",    desc: "PDFs, slides & materials",       icon: <FileText size={18} />,      color: "violet",  path: "/teacher/notes"      },
    { label: "Exam Centre",     desc: "Create & manage exams",          icon: <BookOpen size={18} />,      color: "amber",   path: "/teacher/exams"      },
    { label: "Enter Marks",     desc: "Marks entry & evaluation",       icon: <BarChart2 size={18} />,     color: "rose",    path: "/teacher/exams"      },
    { label: "Publish Results", desc: "Share results with students",    icon: <Send size={18} />,          color: "teal",    path: "/teacher/exams"      },
  ];

  const COLORS = {
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", hover: "hover:bg-emerald-500/15" },
    sky:     { bg: "bg-sky-500/10",     text: "text-sky-400",     border: "border-sky-500/20",     hover: "hover:bg-sky-500/15"     },
    violet:  { bg: "bg-violet-500/10",  text: "text-violet-400",  border: "border-violet-500/20",  hover: "hover:bg-violet-500/15"  },
    amber:   { bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/20",   hover: "hover:bg-amber-500/15"   },
    rose:    { bg: "bg-rose-500/10",    text: "text-rose-400",    border: "border-rose-500/20",    hover: "hover:bg-rose-500/15"    },
    teal:    { bg: "bg-teal-500/10",    text: "text-teal-400",    border: "border-teal-500/20",    hover: "hover:bg-teal-500/15"    },
    indigo:  { bg: "bg-indigo-500/10",  text: "text-indigo-400",  border: "border-indigo-500/20",  hover: "hover:bg-indigo-500/15"  },
  };

  return (
    <div className="text-gray-100">
      <div className="space-y-6">

        {/* ===== HEADER ===== */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">{greeting},</p>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
              {teacher?.name || localStorage.getItem("name") || "Teacher"} 👋
            </h1>
            <p className="text-xs text-gray-600 mt-1.5 flex items-center gap-3">
              <span>{now.toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}</span>
              <span className="flex items-center gap-1 text-indigo-400 font-mono">
                <Clock size={11} />
                {now.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", second:"2-digit" })}
              </span>
            </p>
          </div>
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 text-sm font-medium transition flex-shrink-0"
          >
            <User size={14} />
            {teacher?.name?.split(" ")[0] || "Profile"}
          </button>
        </div>

        {/* ===== STATS ===== */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={<BookOpen size={16} />}      label="My Classes"  value={stats.classes}         hint="Assigned & teaching" color="indigo" onClick={() => navigate("/teacher/classes")} />
          <StatCard icon={<Users size={16} />}         label="Students"    value={stats.students}        hint="Active enrollments"  color="sky"    onClick={() => navigate("/teacher/classes")} />
          <StatCard icon={<CalendarCheck size={16} />} label="Attendance"  value={stats.attendanceToday} hint="Today's status"       color="emerald" onClick={() => navigate("/teacher/attendance")} />
        </div>

        {/* ===== MY CLASSES ===== */}
        {classes.length > 0 && (
          <div className="rounded-2xl border border-white/[0.08] bg-[#161616] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <GraduationCap size={13} className="text-indigo-400" /> My Classes
              </div>
              <button onClick={() => navigate("/teacher/classes")}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition">
                View all <ChevronRight size={13} />
              </button>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {classes.slice(0, 4).map(cls => (
                <div key={cls._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center text-xs font-bold text-indigo-400">
                      {cls.name}
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">Class {cls.name} – Section {cls.section}</p>
                      <p className={`text-xs mt-0.5 ${cls.role === "CLASS_TEACHER" ? "text-emerald-400" : "text-amber-400"}`}>
                        {cls.role === "CLASS_TEACHER" ? "🏅 Class Teacher" : `📘 ${cls.subject || "Subject Teacher"}`}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => navigate("/teacher/classes")}
                    className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/10 transition">
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== QUICK ACTIONS ===== */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {QUICK_ACTIONS.map(a => {
              const c = COLORS[a.color];
              return (
                <button key={a.label} onClick={() => navigate(a.path)}
                  className={`group flex items-start gap-3 p-4 rounded-2xl border ${c.border} ${c.bg} ${c.hover} text-left transition-all hover:scale-[1.02] hover:shadow-lg`}>
                  <div className={`p-2 rounded-xl bg-white/[0.06] ${c.text} flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    {a.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm">{a.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{a.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ===== BOTTOM ROW: TIMETABLE + CALENDAR ===== */}
        <div className="grid sm:grid-cols-2 gap-4">

          {/* Timetable CTA */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#161616] p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={15} className="text-indigo-400" />
                <p className="text-sm font-semibold text-white">My Timetable</p>
              </div>
              <p className="text-xs text-gray-500">View your weekly teaching schedule and period timings</p>
            </div>
            <button onClick={() => navigate("/teacher/timetable")}
              className="mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition">
              <Calendar size={14} /> View Timetable
            </button>
          </div>

          {/* Mini Calendar */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#161616] p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-white">
                {now.toLocaleDateString("en-IN", { month:"long", year:"numeric" })}
              </p>
              <span className="text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                {now.getDate()} {now.toLocaleDateString("en-IN", { month:"short" })}
              </span>
            </div>

            {/* day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map(d => (
                <div key={d} className="text-center text-[10px] text-gray-600 font-semibold py-1">{d}</div>
              ))}
            </div>

            {/* date grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {/* empty cells for first day offset */}
              {Array.from({ length: getFirstDayOfMonth(now.getFullYear(), now.getMonth()) }).map((_, i) => (
                <div key={`e-${i}`} />
              ))}
              {Array.from({ length: getDaysInMonth(now.getFullYear(), now.getMonth()) }, (_, i) => i + 1).map(day => {
                const isToday = day === now.getDate();
                const isWeekend = (() => {
                  const d = new Date(now.getFullYear(), now.getMonth(), day).getDay();
                  return d === 0 || d === 6;
                })();
                return (
                  <div key={day}
                    className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition
                      ${isToday
                        ? "bg-indigo-600 text-white font-bold"
                        : isWeekend
                        ? "text-gray-700"
                        : "text-gray-400 hover:bg-white/[0.06] hover:text-white cursor-pointer"
                      }`}>
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ===== STATUS STRIP ===== */}
        <div className="flex flex-wrap gap-3">
          <StatusPill icon={<CheckCircle size={12} />} label="Session Active"    color="emerald" />
          <StatusPill icon={<Clock size={12} />}       label="Attendance Open"   color="indigo"  />
          <StatusPill icon={<BookOpen size={12} />}    label="Exams Scheduled"   color="amber"   />
        </div>

      </div>

      {/* PROFILE DRAWER */}
      <TeacherProfileDrawer open={showProfile} onClose={() => setShowProfile(false)} teacher={teacher} />
    </div>
  );
}

/* =====================================================
   SMALL COMPONENTS
===================================================== */
const STAT_COLORS = {
  indigo:  { bg: "bg-indigo-500/10",  text: "text-indigo-400",  border: "border-indigo-500/20"  },
  sky:     { bg: "bg-sky-500/10",     text: "text-sky-400",     border: "border-sky-500/20"     },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
};

function StatCard({ icon, label, value, hint, color, onClick }) {
  const c = STAT_COLORS[color];
  return (
    <button onClick={onClick}
      className={`group rounded-2xl border ${c.border} ${c.bg} p-4 text-left hover:scale-[1.02] hover:shadow-lg transition-all duration-200`}>
      <div className="flex items-start justify-between mb-3">
        <span className={c.text}>{icon}</span>
        <ArrowRight size={13} className="text-gray-700 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
      </div>
      <p className={`text-2xl font-bold ${c.text} leading-none`}>{value}</p>
      <p className="text-xs font-semibold text-white mt-2">{label}</p>
      <p className="text-[11px] text-gray-600 mt-0.5">{hint}</p>
    </button>
  );
}

function StatusPill({ icon, label, color }) {
  const colors = {
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    indigo:  "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
    amber:   "bg-amber-500/10 border-amber-500/20 text-amber-400",
  };
  return (
    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${colors[color]}`}>
      {icon} {label}
    </span>
  );
}
