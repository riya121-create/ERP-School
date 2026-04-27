import { useEffect, useState } from "react";
import api from "@/services/api";
import { Calendar, Users, UserCheck, UserX, RefreshCw, TrendingUp } from "lucide-react";

export default function AdminAttendanceByClass() {
  const [date, setDate]       = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const load = (d = date) => {
    setLoading(true);
    setError("");
    // correct endpoint: /admin/attendance/classes?date=YYYY-MM-DD
    api.get(`/admin/attendance/classes?date=${d}`)
      .then(res => setRows(res.data || []))
      .catch(err => setError(err?.response?.data?.message || "Failed to load class attendance"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDateChange = (e) => {
    setDate(e.target.value);
    load(e.target.value);
  };

  /* summary */
  const totalPresent = rows.reduce((s, r) => s + r.present, 0);
  const totalAbsent  = rows.reduce((s, r) => s + r.absent, 0);
  const totalAll     = totalPresent + totalAbsent;
  const overallPct   = totalAll === 0 ? 0 : Math.round((totalPresent / totalAll) * 100);

  return (
    <div className="space-y-5 text-gray-100">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Attendance by Class</h1>
          <p className="text-sm text-gray-500 mt-0.5">Class-wise attendance breakdown for a selected date</p>
        </div>
        <button onClick={() => load()} className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition self-start sm:self-auto">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* DATE PICKER */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            className="bg-white/[0.05] border border-white/10 text-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition"
          />
        </div>
        {rows.length > 0 && (
          <span className="text-xs text-gray-600 bg-white/[0.04] border border-white/[0.07] px-3 py-1.5 rounded-lg">
            {rows.length} class{rows.length !== 1 ? "es" : ""} marked
          </span>
        )}
      </div>

      {/* SUMMARY STRIP */}
      {rows.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
            <div className="flex items-center gap-2 mb-1"><UserCheck size={13} className="text-emerald-400" /><span className="text-[11px] text-gray-500 uppercase tracking-wider">Present</span></div>
            <p className="text-xl font-bold text-emerald-400">{totalPresent}</p>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
            <div className="flex items-center gap-2 mb-1"><UserX size={13} className="text-red-400" /><span className="text-[11px] text-gray-500 uppercase tracking-wider">Absent</span></div>
            <p className="text-xl font-bold text-red-400">{totalAbsent}</p>
          </div>
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3">
            <div className="flex items-center gap-2 mb-1"><TrendingUp size={13} className="text-indigo-400" /><span className="text-[11px] text-gray-500 uppercase tracking-wider">Overall</span></div>
            <p className="text-xl font-bold text-indigo-400">{overallPct}%</p>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#161616] overflow-hidden">
        {/* header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1.5fr] gap-3 px-5 py-3 bg-white/[0.03] border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-gray-600">
          <div>Class</div>
          <div className="text-center">Present</div>
          <div className="text-center">Absent</div>
          <div className="text-center">Total</div>
          <div className="text-center">Rate</div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-600 text-sm">Loading…</div>
        ) : error ? (
          <div className="py-10 px-5">
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">{error}</div>
          </div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={24} className="text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-600">No attendance data for this date</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {rows.map(r => {
              const total = r.present + r.absent;
              const pct   = total === 0 ? 0 : Math.round((r.present / total) * 100);
              const pctColor = pct >= 75 ? "text-emerald-400" : pct >= 50 ? "text-amber-400" : "text-red-400";
              const barColor = pct >= 75 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";

              return (
                <div key={r.classId} className="grid grid-cols-[2fr_1fr_1fr_1fr_1.5fr] gap-3 px-5 py-3.5 items-center hover:bg-white/[0.02] transition text-sm">
                  <div>
                    <p className="font-semibold text-white">Class {r.className}</p>
                    <p className="text-xs text-gray-600">Section {r.section}</p>
                  </div>
                  <div className="text-center font-semibold text-emerald-400">{r.present}</div>
                  <div className="text-center font-semibold text-red-400">{r.absent}</div>
                  <div className="text-center text-gray-400">{total}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={`text-xs font-semibold w-10 text-right ${pctColor}`}>{pct}%</span>
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
