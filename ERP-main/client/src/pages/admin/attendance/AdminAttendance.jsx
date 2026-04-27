import { useEffect, useState } from "react";
import api from "@/services/api";
import { Users, UserCheck, UserX, BarChart2, RefreshCw, Calendar } from "lucide-react";

export default function AdminAttendance() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    api.get("/admin/attendance")
      .then(res => setData(res.data))
      .catch(err => setError(err?.response?.data?.message || "Failed to load attendance overview"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return <Skeleton />;

  if (error) return (
    <div className="space-y-5 text-gray-100">
      <PageHeader />
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <UserX size={16} className="text-red-400" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-red-400 text-sm">Failed to load overview</p>
          <p className="text-xs text-red-400/70 mt-0.5">{error}</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition">
          <RefreshCw size={13} /> Retry
        </button>
      </div>
    </div>
  );

  if (!data) return null;

  const pct = data.attendancePercent ?? 0;
  const pctColor = pct >= 75 ? "text-emerald-400" : pct >= 50 ? "text-amber-400" : "text-red-400";
  const pctBg    = pct >= 75 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="space-y-5 text-gray-100">
      <PageHeader />

      {/* date badge */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Calendar size={14} />
        <span>Today — <span className="text-gray-300 font-medium">{data.date}</span></span>
        <button onClick={load} className="ml-auto flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<Users size={16} />}     label="Total Students" value={data.totalStudents} color="indigo" />
        <StatCard icon={<UserCheck size={16} />} label="Present"        value={data.present}       color="emerald" />
        <StatCard icon={<UserX size={16} />}     label="Absent"         value={data.absent}        color="red" />
        <StatCard icon={<BarChart2 size={16} />} label="Attendance %"   value={`${pct}%`}          color={pct >= 75 ? "emerald" : pct >= 50 ? "amber" : "red"} />
      </div>

      {/* ATTENDANCE RATE CARD */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#161616] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Overall Attendance Rate</p>
            <p className={`text-4xl font-bold mt-1 ${pctColor}`}>{pct}%</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600">Classes marked today</p>
            <p className="text-2xl font-bold text-white mt-0.5">{data.classesMarked}</p>
          </div>
        </div>

        {/* progress bar */}
        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${pctBg}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-3 pt-1">
          <MiniStat label="Present" value={data.present}       sub={`of ${data.totalStudents}`} color="emerald" />
          <MiniStat label="Absent"  value={data.absent}        sub={`of ${data.totalStudents}`} color="red" />
          <MiniStat label="Unmarked" value={Math.max(0, data.totalStudents - data.present - data.absent)} sub="students" color="gray" />
        </div>
      </div>
    </div>
  );
}

/* ===== COMPONENTS ===== */
function PageHeader() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white tracking-tight">Attendance Overview</h1>
      <p className="text-sm text-gray-500 mt-0.5">Daily attendance snapshot across all classes</p>
    </div>
  );
}

const STAT_COLORS = {
  indigo:  { bg: "bg-indigo-500/10",  text: "text-indigo-400",  border: "border-indigo-500/20"  },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  red:     { bg: "bg-red-500/10",     text: "text-red-400",     border: "border-red-500/20"     },
  amber:   { bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/20"   },
};

function StatCard({ icon, label, value, color }) {
  const c = STAT_COLORS[color] || STAT_COLORS.indigo;
  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
      <div className={`flex items-center gap-2 mb-2 ${c.text}`}>{icon}<span className="text-[11px] uppercase tracking-wider font-medium text-gray-500">{label}</span></div>
      <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
    </div>
  );
}

function MiniStat({ label, value, sub, color }) {
  const colors = { emerald: "text-emerald-400", red: "text-red-400", gray: "text-gray-500" };
  return (
    <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
      <p className="text-[11px] text-gray-600 uppercase tracking-wider">{label}</p>
      <p className={`text-xl font-bold mt-0.5 ${colors[color]}`}>{value}</p>
      <p className="text-[11px] text-gray-700 mt-0.5">{sub}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-7 w-52 bg-white/[0.06] rounded-lg" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-xl bg-white/[0.05]" />)}
      </div>
      <div className="h-48 rounded-2xl bg-white/[0.05]" />
    </div>
  );
}
