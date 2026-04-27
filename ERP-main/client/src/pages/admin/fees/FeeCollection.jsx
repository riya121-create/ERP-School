import { useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import StudentFeeProfile from "./StudentFeeProfile";
import { Search, CreditCard, Banknote, Smartphone, Globe, CheckCircle } from "lucide-react";

const PAYMENT_MODES = [
  { key: "CASH",   label: "Cash",   icon: <Banknote size={16} /> },
  { key: "UPI",    label: "UPI",    icon: <Smartphone size={16} /> },
  { key: "BANK",   label: "Bank",   icon: <Globe size={16} /> },
  { key: "ONLINE", label: "Online", icon: <CreditCard size={16} /> },
];

export default function FeeCollection() {
  const [classes, setClasses]           = useState([]);
  const [classId, setClassId]           = useState("");
  const [students, setStudents]         = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [fee, setFee]                   = useState(null);
  const [search, setSearch]             = useState("");
  const [payment, setPayment]           = useState({ amount: "", paymentMode: "CASH", referenceNo: "" });
  const [loading, setLoading]           = useState(false);
  const [success, setSuccess]           = useState(false);

  useEffect(() => {
    api.get("/admin/classes").then(r => setClasses(r.data || []));
  }, []);

  useEffect(() => {
    if (!classId) return;
    setStudents([]); setSelectedStudent(null); setFee(null); setSearch("");
    api.get(`/admin/classes/${classId}/students`).then(r => setStudents(r.data || []));
  }, [classId]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return students;
    return students.filter(s =>
      s.name?.toLowerCase().includes(q) ||
      s.admissionNo?.toLowerCase().includes(q) ||
      s.rollNo?.toString().includes(q) ||
      s.parentPhone?.includes(q)
    );
  }, [students, search]);

  const selectStudent = async s => {
    setSelectedStudent(s); setSuccess(false);
    const res = await api.get(`/admin/fees/student/${s._id}`);
    setFee(res.data);
    setPayment(p => ({ ...p, amount: res.data.totalDue, referenceNo: "" }));
  };

  const collectFee = async () => {
    if (!payment.amount) return alert("Amount required");
    setLoading(true);
    try {
      await api.post("/admin/fees/pay", { studentId: selectedStudent._id, ...payment });
      setSuccess(true);
      selectStudent(selectedStudent);
    } catch (err) {
      alert(err.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 text-gray-100">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Fee Collection</h1>
        <p className="text-sm text-gray-500 mt-0.5">Select class → find student → collect payment</p>
      </div>

      {/* CLASS SELECT */}
      <div className="max-w-xs">
        <label className="text-xs text-gray-500 mb-1.5 block font-medium">Select Class</label>
        <select value={classId} onChange={e => setClassId(e.target.value)}
          className="w-full bg-white/[0.05] border border-white/10 text-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500/60 transition">
          <option value="" className="bg-[#1a1a1a]">Select Class</option>
          {classes.map(c => <option key={c._id} value={c._id} className="bg-[#1a1a1a]">Class {c.name} – {c.section}</option>)}
        </select>
      </div>

      {/* SEARCH */}
      {students.length > 0 && (
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input placeholder="Search name / roll / admission / parent phone…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/[0.05] border border-white/10 text-gray-200 placeholder-gray-600 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500/60 transition" />
        </div>
      )}

      {/* STUDENT LIST */}
      {filtered.length > 0 && (
        <div className="rounded-2xl border border-white/[0.08] bg-[#161616] overflow-hidden">
          <div className="px-5 py-3 bg-white/[0.03] border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-gray-600">
            {filtered.length} student{filtered.length !== 1 ? "s" : ""} — verify identity carefully
          </div>
          <div className="divide-y divide-white/[0.04] max-h-64 overflow-y-auto">
            {filtered.map(s => (
              <button key={s._id} onClick={() => selectStudent(s)}
                className={`w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.03] transition text-left
                  ${selectedStudent?._id === s._id ? "bg-indigo-500/10 border-l-2 border-indigo-500" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {s.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-200 text-sm">{s.rollNo ? `${s.rollNo}. ` : ""}{s.name}</p>
                    <p className="text-xs text-gray-600">Adm: {s.admissionNo || "—"}</p>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500">
                  <p>{s.parentName || "—"}</p>
                  <p className="font-mono">{s.parentPhone || "—"}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FEE SNAPSHOT */}
      {fee && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <FeeCard label="Annual Fee" value={`₹${Number(fee.totalAnnual||0).toLocaleString("en-IN")}`} color="indigo" />
          <FeeCard label="Paid"       value={`₹${Number(fee.totalPaid||0).toLocaleString("en-IN")}`}   color="emerald" />
          <FeeCard label="Due"        value={`₹${Number(fee.totalDue||0).toLocaleString("en-IN")}`}    color={fee.totalDue > 0 ? "red" : "emerald"} />
          <FeeCard label="Status"     value={fee.status}                                                color="sky" />
        </div>
      )}

      {/* PAYMENT FORM */}
      {fee && fee.totalDue > 0 && (
        <div className="rounded-2xl border border-white/[0.08] bg-[#161616] p-5 space-y-4">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Collect Payment</p>

          {/* amount */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Amount (₹) *</label>
            <input type="number" value={payment.amount} onChange={e => setPayment(p => ({ ...p, amount: e.target.value }))}
              className="w-full bg-white/[0.05] border border-white/10 text-white text-2xl font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500/60 transition" />
          </div>

          {/* mode */}
          <div>
            <label className="text-xs text-gray-500 mb-2 block">Payment Mode</label>
            <div className="grid grid-cols-4 gap-2">
              {PAYMENT_MODES.map(m => (
                <button key={m.key} onClick={() => setPayment(p => ({ ...p, paymentMode: m.key }))}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-semibold transition
                    ${payment.paymentMode === m.key
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-white/[0.04] border-white/[0.08] text-gray-400 hover:bg-white/[0.08]"
                    }`}>
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* reference */}
          {payment.paymentMode !== "CASH" && (
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Reference No</label>
              <input placeholder="Transaction / UTR reference" value={payment.referenceNo} onChange={e => setPayment(p => ({ ...p, referenceNo: e.target.value }))}
                className="w-full bg-white/[0.05] border border-white/10 text-gray-200 placeholder-gray-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500/60 transition" />
            </div>
          )}

          <button onClick={collectFee} disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold transition">
            <CreditCard size={16} />
            {loading ? "Processing…" : "Collect Fee"}
          </button>
        </div>
      )}

      {/* SUCCESS */}
      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
          <p className="text-sm text-emerald-400 font-medium">Fee collected successfully!</p>
        </div>
      )}

      {/* NO DUE */}
      {fee && fee.totalDue === 0 && !success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
          <p className="text-sm text-emerald-400">Fee fully cleared for this session 🎉</p>
        </div>
      )}

      {/* STUDENT FEE PROFILE */}
      {selectedStudent && <StudentFeeProfile studentId={selectedStudent._id} />}
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
    <div className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
      <p className="text-[11px] text-gray-600 uppercase tracking-wider font-medium mb-1">{label}</p>
      <p className={`text-lg font-bold ${c.text}`}>{value}</p>
    </div>
  );
}
