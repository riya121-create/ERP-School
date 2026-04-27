import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import CreateClass from "./CreateClass";
import AssignTeacher from "./AssignTeacher";
import {
  Users, GraduationCap, BookOpen, CalendarCheck,
  ArrowRight, TrendingUp, ShieldCheck, AlertTriangle,
  CheckCircle, Plus, UserPlus
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ teachers: "—", students: "—", classes: "—", attendance: "—" });
  const [loading, setLoading] = useState(true);

  const adminEmail = localStorage.getItem("email") || "admin@school.com";
  const adminName  = adminEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    api.get("/admin/dashboard-stats")
      .then(res => setStats({
        teachers:   res.data.teachers       ?? "—",
        students:   res.data.students       ?? "—",
        classes:    res.data.classes        ?? "—",
        attendance: res.data.attendanceToday ?? "—",
      }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 text-gray-100">

      {/* ===== HERO HEADER ===== */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#161616] overflow-hidden">
        {/* gradient top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500" />
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">{greeting},</p>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">{adminName} 👋</h1>
            <p className="text-sm text-gray-500 mt-1">
              {new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <QuickBtn icon={<Users size={13} />}         label="Students" onClick={() => navigate("/admin/students")} />
            <QuickBtn icon={<GraduationCap size={13} />} label="Teachers" onClick={() => navigate("/admin/teachers")} />
            <QuickBtn icon={<BookOpen size={13} />}      label="Classes"  onClick={() => navigate("/admin/classes")} />
          </div>
        </div>
      </div>

      {/* ===== STATS ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<Users size={18} />}
          label="Students"
          value={stats.students}
          hint="Active enrolments"
          color="indigo"
          loading={loading}
          onClick={() => navigate("/admin/students")}
        />
        <StatCard
          icon={<GraduationCap size={18} />}
          label="Teachers"
          value={stats.teachers}
          hint="Faculty members"
          color="sky"
          loading={loading}
          onClick={() => navigate("/admin/teachers")}
        />
        <StatCard
          icon={<BookOpen size={18} />}
          label="Classes"
          value={stats.classes}
          hint="Running sections"
          color="violet"
          loading={loading}
          onClick={() => navigate("/admin/classes")}
        />
        <StatCard
          icon={<CalendarCheck size={18} />}
          label="Attendance"
          value={stats.attendance}
          hint="Today"
          color="emerald"
          loading={loading}
          onClick={() => navigate("/admin/attendance")}
        />
      </div>

      {/* ===== QUICK ACTIONS ===== */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <ActionCard icon={<Plus size={15} />}        label="Add Student"  color="indigo"  onClick={() => navigate("/admin/students")} />
        <ActionCard icon={<UserPlus size={15} />}    label="Add Teacher"  color="sky"     onClick={() => navigate("/admin/teachers/add")} />
        <ActionCard icon={<BookOpen size={15} />}    label="Timetable"    color="violet"  onClick={() => navigate("/admin/timetable/list")} />
        <ActionCard icon={<TrendingUp size={15} />}  label="Fee Reports"  color="emerald" onClick={() => navigate("/admin/fees/structure")} />
      </div>

      {/* ===== ACTION PANELS ===== */}
      <div className="grid lg:grid-cols-2 gap-4">
        <ActionPanel
          title="Create Class"
          desc="Define a new academic class & section"
          icon={<BookOpen size={15} className="text-indigo-400" />}
        >
          <CreateClass />
        </ActionPanel>

        <ActionPanel
          title="Assign Class Teacher"
          desc="Map a teacher as class in-charge"
          icon={<GraduationCap size={15} className="text-sky-400" />}
        >
          <AssignTeacher />
        </ActionPanel>
      </div>

      {/* ===== SYSTEM STATUS ===== */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#161616] p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">System Status</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <HealthCard status="ok"   title="Authentication"  text="RBAC active" />
          <HealthCard status="warn" title="Teacher Mapping" text="Pending classes" />
          <HealthCard status="ok"   title="Academic Data"   text="Tracking enabled" />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   COMPONENTS
===================================================== */
const COLORS = {
  indigo:  { bg: "bg-indigo-500/10",  text: "text-indigo-400",  border: "border-indigo-500/20",  glow: "hover:shadow-indigo-500/10"  },
  sky:     { bg: "bg-sky-500/10",     text: "text-sky-400",     border: "border-sky-500/20",     glow: "hover:shadow-sky-500/10"     },
  violet:  { bg: "bg-violet-500/10",  text: "text-violet-400",  border: "border-violet-500/20",  glow: "hover:shadow-violet-500/10"  },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", glow: "hover:shadow-emerald-500/10" },
};

function StatCard({ icon, label, value, hint, color, loading, onClick }) {
  const c = COLORS[color];
  return (
    <button onClick={onClick}
      className={`group rounded-2xl border ${c.border} ${c.bg} p-5 text-left hover:shadow-lg ${c.glow} transition-all duration-200 hover:scale-[1.02]`}>
      <div className="flex items-start justify-between mb-3">
        <span className={`${c.text}`}>{icon}</span>
        <ArrowRight size={14} className="text-gray-700 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
      </div>
      {loading ? (
        <div className="h-8 w-16 bg-white/[0.06] rounded-lg animate-pulse mb-1" />
      ) : (
        <p className={`text-3xl font-bold ${c.text} leading-none`}>{value}</p>
      )}
      <p className="text-xs font-semibold text-white mt-2">{label}</p>
      <p className="text-[11px] text-gray-600 mt-0.5">{hint}</p>
    </button>
  );
}

function ActionCard({ icon, label, color, onClick }) {
  const c = COLORS[color];
  return (
    <button onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border ${c.border} bg-white/[0.03] hover:${c.bg} px-4 py-3 text-sm font-medium text-gray-400 hover:text-white transition-all group`}>
      <span className={`p-2 rounded-lg ${c.bg} ${c.text} group-hover:scale-110 transition-transform`}>{icon}</span>
      {label}
      <ArrowRight size={13} className="ml-auto text-gray-700 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all" />
    </button>
  );
}

function ActionPanel({ title, desc, icon, children }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#161616] p-5">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <h3 className="font-semibold text-white text-sm">{title}</h3>
      </div>
      <p className="text-xs text-gray-600 mb-4">{desc}</p>
      {children}
    </div>
  );
}

function QuickBtn({ icon, label, onClick }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-medium transition">
      {icon} {label}
    </button>
  );
}

function HealthCard({ status, title, text }) {
  const ok = status === "ok";
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-3.5
      ${ok ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20"}`}>
      <div className={`mt-0.5 flex-shrink-0 ${ok ? "text-emerald-400" : "text-amber-400"}`}>
        {ok ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
      </div>
      <div>
        <p className={`text-sm font-semibold ${ok ? "text-emerald-400" : "text-amber-400"}`}>{title}</p>
        <p className="text-xs text-gray-600 mt-0.5">{text}</p>
      </div>
    </div>
  );
}
