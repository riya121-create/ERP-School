import { useEffect, useState } from "react";
import api from "@/services/api";
import { Receipt, TrendingUp, AlertCircle } from "lucide-react";

const fmt    = n => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : "—";

const MODE_ICON = { CASH: "💵", UPI: "📱", BANK: "🏦", ONLINE: "💳" };

export default function StudentFeeProfile({ studentId }) {
  const [fee, setFee]         = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (!studentId) return;
    let mounted = true;
    setLoading(true); setError("");
    Promise.all([
      api.get(`/admin/fees/student/${studentId}`),
      api.get(`/admin/fees/payments/${studentId}`),
    ]).then(([fr, pr]) => {
      if (!mounted) return;
      setFee(fr.data);
      setPayments(Array.isArray(pr.data) ? pr.data : []);
    }).catch(() => setError("Failed to load fee details"))
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [studentId]);

  if (loading) return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#161616] p-5 animate-pulse space-y-3">
      <div className="h-4 w-40 bg-white/[0.06] rounded" />
      <div className="grid grid-cols-4 gap-3">{[1,2,3,4].map(i => <div key={i} className="h-16 rounded-xl bg-white/[0.05]" />)}</div>
    </div>
  );

  if (error) return (
    <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
      <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
      <p className="text-sm text-red-400">{error}</p>
    </div>
  );

  if (!fee) return null;

  const paidPct = fee.totalAnnual > 0 ? Math.round((fee.totalPaid / fee.totalAnnual) * 100) : 0;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#161616] overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <TrendingUp size={13} className="text-indigo-400" /> Fee Profile
        </div>
        <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border
          ${fee.status === "PAID"
            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
            : fee.totalDue > 0
            ? "bg-red-500/15 text-red-400 border-red-500/25"
            : "bg-amber-500/15 text-amber-400 border-amber-500/25"
          }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${fee.status === "PAID" ? "bg-emerald-400" : fee.totalDue > 0 ? "bg-red-400" : "bg-amber-400"}`} />
          {fee.status}
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <FeeCard label="Annual Fee" value={fmt(fee.totalAnnual)} color="indigo" />
          <FeeCard label="Paid"       value={fmt(fee.totalPaid)}   color="emerald" />
          <FeeCard label="Due"        value={fmt(fee.totalDue)}    color={fee.totalDue > 0 ? "red" : "emerald"} />
          <FeeCard label="Progress"   value={`${paidPct}%`}        color="sky" />
        </div>

        {/* progress bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1.5">
            <span>Payment Progress</span><span>{paidPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${paidPct >= 100 ? "bg-emerald-500" : paidPct >= 50 ? "bg-indigo-500" : "bg-amber-500"}`}
              style={{ width: `${Math.min(paidPct, 100)}%` }} />
          </div>
        </div>

        {/* payment history */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Receipt size={12} /> Payment History
          </p>
          {payments.length === 0 ? (
            <p className="text-sm text-gray-600 py-4 text-center">No payments recorded yet</p>
          ) : (
            <div className="rounded-xl border border-white/[0.07] overflow-hidden">
              <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-2.5 bg-white/[0.04] border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                <span>Receipt</span><span>Amount</span><span>Mode</span><span>Date</span><span>Ref</span>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {payments.map(p => (
                  <div key={p._id} className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-3 text-sm items-center hover:bg-white/[0.02] transition">
                    <span className="font-mono text-xs text-gray-500">{p.receiptNo || "—"}</span>
                    <span className="font-semibold text-emerald-400">{fmt(p.amount)}</span>
                    <span className="text-gray-400">{MODE_ICON[p.paymentMode] || ""} {p.paymentMode || "—"}</span>
                    <span className="text-gray-400 text-xs">{fmtDate(p.paidAt)}</span>
                    <span className="text-gray-600 text-xs truncate">{p.referenceNo || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FeeCard({ label, value, color }) {
  const colors = {
    indigo:  { bg: "bg-indigo-500/10",  text: "text-indigo-400",  border: "border-indigo-500/20"  },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
    red:     { bg: "bg-red-500/10",     text: "text-red-400",     border: "border-red-500/20"     },
    sky:     { bg: "bg-sky-500/10",     text: "text-sky-400",     border: "border-sky-500/20"     },
  };
  const c = colors[color] || colors.indigo;
  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-3`}>
      <p className="text-[11px] text-gray-600 uppercase tracking-wider font-medium mb-1">{label}</p>
      <p className={`text-lg font-bold ${c.text}`}>{value}</p>
    </div>
  );
}
