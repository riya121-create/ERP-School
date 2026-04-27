import { useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import { ChevronDown, ChevronUp, Bus, BookOpen, BarChart2 } from "lucide-react";

const fmt = n => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function FeeExplore() {
  const [fees, setFees]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [filters, setFilters]   = useState({ className: "", session: "" });

  useEffect(() => {
    api.get("/admin/fees/structure")
      .then(r => setFees(Array.isArray(r.data) ? r.data : []))
      .catch(() => setError("Failed to load fee structures"))
      .finally(() => setLoading(false));
  }, []);

  const classes  = useMemo(() => [...new Set(fees.map(f => f.className).filter(Boolean))], [fees]);
  const sessions = useMemo(() => [...new Set(fees.map(f => f.session).filter(Boolean))], [fees]);

  const filtered = useMemo(() => fees.filter(f => {
    if (filters.className && f.className !== filters.className) return false;
    if (filters.session   && f.session   !== filters.session)   return false;
    return true;
  }), [fees, filters]);

  if (loading) return (
    <div className="space-y-3">
      {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-white/[0.05] animate-pulse" />)}
    </div>
  );

  if (error) return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400 text-sm">{error}</div>
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">Fee Explorer</h2>
        <p className="text-sm text-gray-500 mt-0.5">Complete admin-level fee visibility</p>
      </div>

      {/* FILTERS */}
      <div className="flex gap-3 flex-wrap">
        <select value={filters.className} onChange={e => setFilters(p => ({ ...p, className: e.target.value }))}
          className="bg-white/[0.05] border border-white/10 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition">
          <option value="" className="bg-[#1a1a1a]">All Classes</option>
          {classes.map(c => <option key={c} value={c} className="bg-[#1a1a1a]">{c}</option>)}
        </select>
        <select value={filters.session} onChange={e => setFilters(p => ({ ...p, session: e.target.value }))}
          className="bg-white/[0.05] border border-white/10 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition">
          <option value="" className="bg-[#1a1a1a]">All Sessions</option>
          {sessions.map(s => <option key={s} value={s} className="bg-[#1a1a1a]">{s}</option>)}
        </select>
        {filtered.length !== fees.length && (
          <span className="text-xs text-gray-600 bg-white/[0.04] border border-white/[0.07] px-3 py-2 rounded-lg self-center">
            {filtered.length} of {fees.length}
          </span>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-600 text-sm">No fee structures found</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(fee => {
            const open = expandedId === fee._id;
            const bd   = fee.calculatedBreakdown || {};
            const stopWise = Array.isArray(bd.stopWise) ? bd.stopWise : [];

            return (
              <div key={fee._id} className="rounded-2xl border border-white/[0.08] bg-[#161616] overflow-hidden">
                {/* header */}
                <button onClick={() => setExpandedId(open ? null : fee._id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                      <span className="text-xs font-bold text-indigo-400">{fee.className}</span>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white text-sm">Class {fee.className} · {fee.session}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{fee.structureName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-[11px] text-gray-600">Annual Base</p>
                      <p className="font-bold text-white">{fmt(fee.financeSummary?.annualBase)}</p>
                    </div>
                    {open ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                  </div>
                </button>

                {/* expanded */}
                {open && (
                  <div className="border-t border-white/[0.06] p-5 space-y-4">
                    {/* summary */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
                        <p className="text-[11px] text-gray-500 uppercase tracking-wider">Monthly Tuition</p>
                        <p className="text-xl font-bold text-emerald-400 mt-0.5">{fmt(bd.tuition?.monthly)}</p>
                      </div>
                      <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-3">
                        <p className="text-[11px] text-gray-500 uppercase tracking-wider">Annual Tuition</p>
                        <p className="text-xl font-bold text-indigo-400 mt-0.5">{fmt(bd.tuition?.annual)}</p>
                      </div>
                    </div>

                    {/* components */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><BookOpen size={12} /> Fee Components</p>
                      <div className="rounded-xl border border-white/[0.07] overflow-hidden">
                        <div className="grid grid-cols-4 px-4 py-2.5 bg-white/[0.04] border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                          <span>Component</span><span>Frequency</span><span>Monthly</span><span>Annual</span>
                        </div>
                        {fee.components?.map((c, i) => (
                          <div key={i} className="grid grid-cols-4 px-4 py-2.5 border-b border-white/[0.04] text-sm">
                            <span className="text-gray-200">{c.name}</span>
                            <span className="text-gray-500">{c.frequency}</span>
                            <span className="text-gray-300">{c.frequency === "Monthly" ? fmt(c.amount) : "—"}</span>
                            <span className="text-gray-300">{c.frequency === "Monthly" ? fmt(c.amount * 12) : fmt(c.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* transport class level */}
                    {fee.transportConfig?.feeMode === "TRANSPORT" && (
                      <div className="rounded-xl bg-indigo-500/5 border border-indigo-500/20 p-4">
                        <p className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5 mb-2"><Bus size={12} /> Transport (Class Level)</p>
                        <p className="text-sm text-gray-400">Monthly: {fmt(bd.transport?.monthly)} · Annual: {fmt(bd.transport?.annual)}</p>
                      </div>
                    )}

                    {/* transport stop wise */}
                    {fee.transportConfig?.feeMode === "STOP" && (
                      <div>
                        <p className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5 mb-2"><Bus size={12} /> Transport — Stop Wise</p>
                        {stopWise.length === 0 ? (
                          <p className="text-sm text-red-400">Stop fees not configured</p>
                        ) : (
                          <div className="rounded-xl border border-white/[0.07] overflow-hidden">
                            <div className="grid grid-cols-7 px-4 py-2.5 bg-white/[0.04] border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                              <span>Stop</span><span>Trans/M</span><span>Trans/A</span><span>Tuit/M</span><span>Tuit/A</span><span className="font-bold">Total/M</span><span className="font-bold">Total/A</span>
                            </div>
                            {stopWise.map((s, i) => (
                              <div key={i} className="grid grid-cols-7 px-4 py-2.5 border-b border-white/[0.04] text-sm">
                                <span className="text-gray-200">{s.stopName}</span>
                                <span className="text-gray-400">{fmt(s.transportMonthly)}</span>
                                <span className="text-gray-400">{fmt(s.transportAnnual)}</span>
                                <span className="text-gray-400">{fmt(bd.tuition?.monthly)}</span>
                                <span className="text-gray-400">{fmt(bd.tuition?.annual)}</span>
                                <span className="font-semibold text-white">{fmt(s.totalMonthly)}</span>
                                <span className="font-bold text-indigo-400">{fmt(s.totalAnnual)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
