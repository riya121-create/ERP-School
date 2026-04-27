import { useEffect, useState, useMemo } from "react";
import api from "../../services/api";
import {
  Search, RefreshCw, Users, Wifi, WifiOff,
  Calendar, Clock, Globe, Activity
} from "lucide-react";

/* =====================================================
   HELPERS
===================================================== */
const fmtDate = d => d
  ? new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"2-digit" })
  : "—";

const fmtTime = d => d
  ? new Date(d).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" })
  : "";

const duration = (start, end) => {
  if (!start) return "—";
  const mins = Math.floor((new Date(end || Date.now()) - new Date(start)) / 60000);
  if (mins < 1) return "<1m";
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

const STATUS_MAP = {
  ACTIVE:     { label: "Online",     bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/25", dot: "bg-emerald-400" },
  INACTIVE:   { label: "Inactive",   bg: "bg-amber-500/15",   text: "text-amber-400",   border: "border-amber-500/25",   dot: "bg-amber-400"   },
  LOGGED_OUT: { label: "Logged Out", bg: "bg-gray-500/15",    text: "text-gray-400",    border: "border-gray-500/25",    dot: "bg-gray-500"    },
  EXPIRED:    { label: "Expired",    bg: "bg-red-500/15",     text: "text-red-400",     border: "border-red-500/25",     dot: "bg-red-400"     },
};

/* =====================================================
   MAIN
===================================================== */
export default function AdminTeacherActivity() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [todayOnly, setTodayOnly]       = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/teacher-login-history");
      setSessions(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  /* stats */
  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      online:  sessions.filter(s => s.status === "ACTIVE").length,
      offline: sessions.filter(s => s.status !== "ACTIVE").length,
      today:   sessions.filter(s => s.loginAt?.startsWith(today) || new Date(s.loginAt).toISOString().startsWith(today)).length,
      unique:  new Set(sessions.map(s => s.teacherId?._id)).size,
    };
  }, [sessions]);

  /* filtered */
  const filtered = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return sessions.filter(s => {
      if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
      if (todayOnly && !new Date(s.loginAt).toISOString().startsWith(today)) return false;
      const q = search.toLowerCase();
      if (q && !`${s.teacherId?.name} ${s.teacherId?.email}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [sessions, statusFilter, search, todayOnly]);

  return (
    <div className="space-y-5 text-gray-100">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Teacher Activity</h1>
          <p className="text-sm text-gray-500 mt-0.5">Login sessions & real-time presence monitor</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-400 transition self-start sm:self-auto"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<Wifi size={15} />}      label="Online Now"  value={stats.online}  color="emerald" pulse />
        <StatCard icon={<WifiOff size={15} />}   label="Offline"     value={stats.offline} color="gray"   />
        <StatCard icon={<Calendar size={15} />}  label="Today"       value={stats.today}   color="indigo" />
        <StatCard icon={<Users size={15} />}     label="Teachers"    value={stats.unique}  color="sky"    />
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            placeholder="Search teacher…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-white/[0.05] border border-white/10 text-gray-200 placeholder-gray-600 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition w-52"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-white/[0.05] border border-white/10 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition"
        >
          <option value="ALL"        className="bg-[#1a1a1a]">All Status</option>
          <option value="ACTIVE"     className="bg-[#1a1a1a]">Online</option>
          <option value="LOGGED_OUT" className="bg-[#1a1a1a]">Logged Out</option>
          <option value="INACTIVE"   className="bg-[#1a1a1a]">Inactive</option>
          <option value="EXPIRED"    className="bg-[#1a1a1a]">Expired</option>
        </select>

        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer select-none">
          <div
            onClick={() => setTodayOnly(v => !v)}
            className={`w-9 h-5 rounded-full transition-colors relative ${todayOnly ? "bg-indigo-600" : "bg-white/10"}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${todayOnly ? "left-4" : "left-0.5"}`} />
          </div>
          Today only
        </label>

        {filtered.length !== sessions.length && (
          <span className="text-xs text-gray-600 bg-white/[0.04] border border-white/[0.07] px-3 py-1.5 rounded-lg">
            {filtered.length} of {sessions.length}
          </span>
        )}
      </div>

      {/* TABLE */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#161616] overflow-hidden">

        {/* header */}
        <div className="grid grid-cols-[2fr_1.4fr_1.4fr_0.8fr_0.9fr_0.9fr] gap-3 px-5 py-3 bg-white/[0.03] border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-gray-600">
          <div>Teacher</div>
          <div>Login</div>
          <div>Last Seen</div>
          <div className="text-center">Duration</div>
          <div className="text-center">IP</div>
          <div className="text-center">Status</div>
        </div>

        {/* body */}
        <div className="divide-y divide-white/[0.04] max-h-[62vh] overflow-y-auto">
          {loading ? (
            <div className="py-16 text-center text-gray-600 text-sm">Loading sessions…</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Activity size={24} className="text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-600">No sessions found</p>
            </div>
          ) : (
            filtered.map(s => {
              const st = STATUS_MAP[s.status] || STATUS_MAP.LOGGED_OUT;
              const isOnline = s.status === "ACTIVE";
              return (
                <div
                  key={s._id}
                  className="grid grid-cols-[2fr_1.4fr_1.4fr_0.8fr_0.9fr_0.9fr] gap-3 px-5 py-3.5 items-center hover:bg-white/[0.02] transition"
                >
                  {/* teacher */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 relative
                      ${isOnline ? "bg-emerald-500/20 text-emerald-400" : "bg-white/[0.06] text-gray-500"}`}>
                      {s.teacherId?.name?.charAt(0).toUpperCase() || "?"}
                      {isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#161616]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-200 text-sm truncate">{s.teacherId?.name || "—"}</p>
                      <p className="text-[11px] text-gray-600 truncate">{s.teacherId?.email || ""}</p>
                    </div>
                  </div>

                  {/* login */}
                  <div className="min-w-0">
                    <p className="text-xs text-gray-300">{fmtDate(s.loginAt)}</p>
                    <p className="text-[11px] text-gray-600">{fmtTime(s.loginAt)}</p>
                  </div>

                  {/* last seen */}
                  <div className="min-w-0">
                    <p className="text-xs text-gray-300">{fmtDate(s.lastSeenAt)}</p>
                    <p className="text-[11px] text-gray-600">{fmtTime(s.lastSeenAt)}</p>
                  </div>

                  {/* duration */}
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                    <Clock size={11} className="flex-shrink-0" />
                    <span>{duration(s.loginAt, s.logoutAt)}</span>
                  </div>

                  {/* ip */}
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                    <Globe size={11} className="flex-shrink-0" />
                    <span className="truncate max-w-[60px]" title={s.ipAddress}>{s.ipAddress || "—"}</span>
                  </div>

                  {/* status */}
                  <div className="flex justify-center">
                    <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${st.bg} ${st.text} ${st.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${st.dot} ${isOnline ? "animate-pulse" : ""}`} />
                      {st.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   STAT CARD
===================================================== */
const STAT_COLORS = {
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  gray:    { bg: "bg-white/[0.04]",   text: "text-gray-400",    border: "border-white/[0.08]"   },
  indigo:  { bg: "bg-indigo-500/10",  text: "text-indigo-400",  border: "border-indigo-500/20"  },
  sky:     { bg: "bg-sky-500/10",     text: "text-sky-400",     border: "border-sky-500/20"     },
};

function StatCard({ icon, label, value, color, pulse }) {
  const c = STAT_COLORS[color];
  return (
    <div className={`flex items-center gap-3 rounded-xl border ${c.border} ${c.bg} px-4 py-3`}>
      <div className={`relative ${c.text}`}>
        {icon}
        {pulse && value > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        )}
      </div>
      <div>
        <p className="text-[11px] text-gray-600 uppercase tracking-wider font-medium">{label}</p>
        <p className="text-xl font-bold text-white leading-none mt-0.5">{value}</p>
      </div>
    </div>
  );
}
