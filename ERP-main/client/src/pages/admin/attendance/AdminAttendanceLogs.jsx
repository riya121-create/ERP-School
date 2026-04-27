import { useEffect, useState, useMemo } from "react";
import api from "@/services/api";
import { Calendar, Search, RefreshCw, UserCheck, UserX, Filter } from "lucide-react";

const today = new Date().toISOString().slice(0, 10);
const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

export default function AdminAttendanceLogs() {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [from, setFrom]       = useState(weekAgo);
  const [to, setTo]           = useState(today);
  const [search, setSearch]   = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = () => {
    setLoading(true);
    setError("");
    // correct endpoint: /admin/attendance/logs?from=&to=
    api.get(`/admin/attendance/logs?from=${from}&to=${to}`)
      .then(res => setLogs(res.data || []))
      .catch(err => setError(err?.response?.data?.message || "Failed to load logs"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  /* filter */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return logs.filter(l => {
      const matchSearch =
        l.studentId?.name?.toLowerCase().includes(q) ||
        l.studentId?.rollNo?.toLowerCase().includes(q) ||
        l.classId?.name?.toLowerCase().includes(q) ||
        l.teacherId?.name?.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || l.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [logs, search, statusFilter]);

  /* stats */
  const presentCount = filtered.filter(l => l.status === "present").length;
  const absentCount  = filtered.filter(l => l.status === "absent").length;

  return (
    <div className="space-y-5 text-gray-100">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Attendance Audit Logs</h1>
          <p className="text-sm text-gray-500 mt-0.5">Full attendance history with date range filter</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition self-start sm:self-auto">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-[11px] text-gray-600 uppercase tracking-wider block mb-1">From</label>
          <div className="relative">
            <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="date"
              value={from}
              onChange={e => setFrom(e.target.value)}
              className="bg-white/[0.05] border border-white/10 text-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition"
            />
          </div>
        </div>
        <div>
          <label className="text-[11px] text-gray-600 uppercase tracking-wider block mb-1">To</label>
          <div className="relative">
            <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="date"
              value={to}
              onChange={e => setTo(e.target.value)}
              className="bg-white/[0.05] border border-white/10 text-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition"
            />
          </div>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition self-end"
        >
          <Filter size={13} /> Apply
        </button>
      </div>

      {/* SEARCH + STATUS FILTER */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            placeholder="Search student, class, teacher…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/[0.05] border border-white/10 text-gray-200 placeholder-gray-600 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition"
          />
        </div>
        <div className="flex gap-1.5">
          {["all", "present", "absent"].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition capitalize
                ${statusFilter === s
                  ? s === "present" ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                    : s === "absent" ? "bg-red-500/20 border-red-500/40 text-red-400"
                    : "bg-indigo-500/20 border-indigo-500/40 text-indigo-400"
                  : "bg-white/[0.04] border-white/[0.08] text-gray-500 hover:bg-white/[0.08]"
                }`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      {/* STATS ROW */}
      {!loading && filtered.length > 0 && (
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.07] px-3 py-1.5 rounded-lg text-gray-400">
            Total: <strong className="text-white">{filtered.length}</strong>
          </span>
          <span className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-emerald-400">
            <UserCheck size={12} /> Present: <strong>{presentCount}</strong>
          </span>
          <span className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg text-red-400">
            <UserX size={12} /> Absent: <strong>{absentCount}</strong>
          </span>
        </div>
      )}

      {/* TABLE */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#161616] overflow-hidden">
        {/* header */}
        <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1.5fr] gap-3 px-5 py-3 bg-white/[0.03] border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-gray-600">
          <div>Student</div>
          <div>Class</div>
          <div className="text-center">Status</div>
          <div>Teacher</div>
          <div>Date & Time</div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-600 text-sm">Loading logs…</div>
        ) : error ? (
          <div className="py-10 px-5">
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">{error}</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Calendar size={24} className="text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-600">No logs found for the selected range</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04] max-h-[60vh] overflow-y-auto">
            {filtered.map(l => {
              const isPresent = l.status === "present";
              return (
                <div key={l._id} className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1.5fr] gap-3 px-5 py-3 items-center hover:bg-white/[0.02] transition text-sm">
                  {/* student */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-[11px] font-bold text-indigo-400 flex-shrink-0">
                      {l.studentId?.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-200 text-sm">{l.studentId?.name || "—"}</p>
                      <p className="text-[11px] text-gray-600">{l.studentId?.rollNo || ""}</p>
                    </div>
                  </div>

                  {/* class */}
                  <div className="text-gray-400 text-sm">
                    {l.classId ? `${l.classId.name} – ${l.classId.section}` : "—"}
                  </div>

                  {/* status */}
                  <div className="flex justify-center">
                    <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border
                      ${isPresent
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                        : "bg-red-500/15 text-red-400 border-red-500/25"
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isPresent ? "bg-emerald-400" : "bg-red-400"}`} />
                      {l.status?.toUpperCase()}
                    </span>
                  </div>

                  {/* teacher */}
                  <div className="text-gray-500 text-sm truncate">{l.teacherId?.name || "—"}</div>

                  {/* date */}
                  <div>
                    <p className="text-gray-300 text-sm">{l.date}</p>
                    {l.markedAt && (
                      <p className="text-[11px] text-gray-600">
                        {new Date(l.markedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
