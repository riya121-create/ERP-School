import { useEffect, useState, useMemo } from "react";
import api from "@/services/api";
import { Search, UserCheck, UserX, Calendar, TrendingUp, ChevronDown } from "lucide-react";

const STATUS_COLORS = {
  present: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/25", dot: "bg-emerald-400" },
  absent:  { bg: "bg-red-500/15",     text: "text-red-400",     border: "border-red-500/25",     dot: "bg-red-400"     },
  late:    { bg: "bg-amber-500/15",   text: "text-amber-400",   border: "border-amber-500/25",   dot: "bg-amber-400"   },
};

export default function AdminAttendanceByStudent() {
  const [students, setStudents]   = useState([]);
  const [search, setSearch]       = useState("");
  const [showDrop, setShowDrop]   = useState(false);
  const [selected, setSelected]   = useState(null); // { _id, name, admissionNo }
  const [records, setRecords]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  /* load student list once */
  useEffect(() => {
    api.get("/admin/students?status=active")
      .then(res => setStudents(res.data || []))
      .catch(() => {});
  }, []);

  /* filtered dropdown */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter(s =>
      s.name?.toLowerCase().includes(q) ||
      s.admissionNo?.toLowerCase().includes(q) ||
      s.rollNo?.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [students, search]);

  /* load attendance when student selected */
  const loadAttendance = (student) => {
    setSelected(student);
    setShowDrop(false);
    setSearch(student.name);
    setLoading(true);
    setError("");
    // correct endpoint: /admin/attendance/students?studentId=xxx
    api.get(`/admin/attendance/students?studentId=${student._id}`)
      .then(res => setRecords(res.data || []))
      .catch(err => setError(err?.response?.data?.message || "Failed to load attendance"))
      .finally(() => setLoading(false));
  };

  /* stats */
  const stats = useMemo(() => {
    const present = records.filter(r => r.status === "present").length;
    const absent  = records.filter(r => r.status === "absent").length;
    const total   = records.length;
    const pct     = total === 0 ? 0 : Math.round((present / total) * 100);
    return { present, absent, total, pct };
  }, [records]);

  /* group by month */
  const byMonth = useMemo(() => {
    const map = {};
    records.forEach(r => {
      const month = r.date?.slice(0, 7) || "Unknown";
      if (!map[month]) map[month] = [];
      map[month].push(r);
    });
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  }, [records]);

  return (
    <div className="space-y-5 text-gray-100">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Attendance by Student</h1>
        <p className="text-sm text-gray-500 mt-0.5">View full attendance history for any student</p>
      </div>

      {/* STUDENT SEARCH */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
        <input
          placeholder="Search student name / admission no…"
          value={search}
          onChange={e => { setSearch(e.target.value); setShowDrop(true); }}
          onFocus={() => setShowDrop(true)}
          className="w-full bg-white/[0.05] border border-white/10 text-gray-200 placeholder-gray-600 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500/60 transition"
        />
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600" />

        {showDrop && search && filtered.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-[#1c1c1c] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
            {filtered.map(s => (
              <button
                key={s._id}
                onClick={() => loadAttendance(s)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.06] transition text-left"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-[11px] font-bold text-indigo-400 flex-shrink-0">
                  {s.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-200">{s.name}</p>
                  <p className="text-xs text-gray-600">{s.admissionNo}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SELECTED STUDENT STATS */}
      {selected && !loading && !error && records.length > 0 && (
        <>
          {/* student info */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.04] border border-white/[0.07]">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-sm font-bold text-indigo-400">
              {selected.name?.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-white">{selected.name}</p>
              <p className="text-xs text-gray-500">{selected.admissionNo}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-gray-600">Total Records</p>
              <p className="font-bold text-white">{stats.total}</p>
            </div>
          </div>

          {/* stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MiniCard icon={<UserCheck size={14} />} label="Present" value={stats.present} color="emerald" />
            <MiniCard icon={<UserX size={14} />}     label="Absent"  value={stats.absent}  color="red" />
            <MiniCard icon={<Calendar size={14} />}  label="Total"   value={stats.total}   color="indigo" />
            <MiniCard icon={<TrendingUp size={14} />} label="Rate"   value={`${stats.pct}%`} color={stats.pct >= 75 ? "emerald" : stats.pct >= 50 ? "amber" : "red"} />
          </div>

          {/* progress bar */}
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] p-4">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Attendance Rate</span>
              <span className={stats.pct >= 75 ? "text-emerald-400" : stats.pct >= 50 ? "text-amber-400" : "text-red-400"}>{stats.pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${stats.pct >= 75 ? "bg-emerald-500" : stats.pct >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                style={{ width: `${stats.pct}%` }}
              />
            </div>
          </div>

          {/* RECORDS BY MONTH */}
          <div className="space-y-3">
            {byMonth.map(([month, recs]) => {
              const mp = recs.filter(r => r.status === "present").length;
              const mpct = Math.round((mp / recs.length) * 100);
              return (
                <div key={month} className="rounded-xl border border-white/[0.07] bg-[#161616] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.05]">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {new Date(month + "-01").toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                    </span>
                    <span className="text-xs text-gray-600">{mp}/{recs.length} present · {mpct}%</span>
                  </div>
                  <div className="p-3 flex flex-wrap gap-2">
                    {recs.map(r => {
                      const c = STATUS_COLORS[r.status] || STATUS_COLORS.absent;
                      return (
                        <div key={r._id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${c.bg} ${c.text} ${c.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                          {new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {loading && (
        <div className="py-16 text-center text-gray-600 text-sm">Loading attendance…</div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">{error}</div>
      )}

      {selected && !loading && !error && records.length === 0 && (
        <div className="py-16 text-center text-gray-600 text-sm">No attendance records found for this student</div>
      )}

      {!selected && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-3">
            <Search size={20} className="text-gray-600" />
          </div>
          <p className="text-sm text-gray-600">Search and select a student to view their attendance</p>
        </div>
      )}
    </div>
  );
}

function MiniCard({ icon, label, value, color }) {
  const colors = {
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
    red:     { bg: "bg-red-500/10",     text: "text-red-400",     border: "border-red-500/20"     },
    indigo:  { bg: "bg-indigo-500/10",  text: "text-indigo-400",  border: "border-indigo-500/20"  },
    amber:   { bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/20"   },
  };
  const c = colors[color] || colors.indigo;
  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-3`}>
      <div className={`flex items-center gap-1.5 mb-1 ${c.text}`}>{icon}<span className="text-[11px] text-gray-600 uppercase tracking-wider">{label}</span></div>
      <p className={`text-xl font-bold ${c.text}`}>{value}</p>
    </div>
  );
}
