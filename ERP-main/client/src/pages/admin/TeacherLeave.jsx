import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { ArrowLeft, Plus, CheckCircle, XCircle, Clock } from "lucide-react";

const LEAVE_TYPES = ["sick","casual","earned","maternity","paternity","unpaid"];

const STATUS_STYLE = {
  approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  rejected: "bg-red-500/15 text-red-400 border-red-500/25",
  cancelled:"bg-gray-500/15 text-gray-400 border-gray-500/25",
  pending:  "bg-amber-500/15 text-amber-400 border-amber-500/25",
};
const LEAVE_STYLE = {
  sick:      "bg-red-500/10 text-red-400",
  casual:    "bg-emerald-500/10 text-emerald-400",
  earned:    "bg-purple-500/10 text-purple-400",
  maternity: "bg-pink-500/10 text-pink-400",
  paternity: "bg-blue-500/10 text-blue-400",
  unpaid:    "bg-gray-500/10 text-gray-400",
};

export default function TeacherLeave() {
  const navigate    = useNavigate();
  const { teacherId } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [leaves, setLeaves]   = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ leaveType: "casual", startDate: "", endDate: "", reason: "" });

  const loadLeaves = async () => {
    const res = await api.get(`/admin/teachers/${teacherId}/leave`);
    setLeaves(res.data.leaves || []);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const tRes = await api.get(`/admin/teachers/${teacherId}`);
        setTeacher(tRes.data.teacher || tRes.data);
        await loadLeaves();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to load data");
      }
    };
    load();
  }, [teacherId]);

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/admin/teachers/${teacherId}/leave`, form);
      setForm({ leaveType: "casual", startDate: "", endDate: "", reason: "" });
      await loadLeaves();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit leave");
    } finally {
      setLoading(false);
    }
  };

  const approve = async (leaveId, status) => {
    const comments = prompt(`Comments for ${status}:`);
    if (!comments) return;
    try {
      await api.post(`/admin/leave/${leaveId}/approve`, { status, comments });
      await loadLeaves();
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    }
  };

  if (!teacher) return <div className="flex items-center justify-center h-64 text-gray-600 text-sm">Loading…</div>;

  return (
    <div className="space-y-5 text-gray-100 max-w-5xl">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/admin/teachers")} className="p-2 rounded-xl bg-white/[0.05] border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Leave Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{teacher.name}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">

        {/* REQUEST FORM */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#161616] p-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Request Leave</h2>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Leave Type</label>
              <select value={form.leaveType} onChange={e => setForm(f => ({ ...f, leaveType: e.target.value }))} className="w-full bg-white/[0.05] border border-white/10 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition">
                {LEAVE_TYPES.map(t => <option key={t} value={t} className="bg-[#1a1a1a] capitalize">{t.charAt(0).toUpperCase() + t.slice(1)} Leave</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Start Date *</label>
                <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required className="w-full bg-white/[0.05] border border-white/10 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">End Date *</label>
                <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required className="w-full bg-white/[0.05] border border-white/10 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Reason *</label>
              <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} rows={3} required placeholder="Enter reason…" className="w-full bg-white/[0.05] border border-white/10 text-gray-200 placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition resize-none" />
            </div>
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition">
              <Plus size={14} /> {loading ? "Submitting…" : "Submit Request"}
            </button>
          </form>
        </div>

        {/* LEAVE HISTORY */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#161616] p-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Leave History ({leaves.length})</h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {leaves.length === 0 ? (
              <div className="py-12 text-center text-gray-600 text-sm">No leave requests</div>
            ) : (
              leaves.map(l => (
                <div key={l._id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${LEAVE_STYLE[l.leaveType] || "bg-gray-500/10 text-gray-400"}`}>
                        {l.leaveType?.toUpperCase()}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_STYLE[l.status] || STATUS_STYLE.pending}`}>
                        {l.status?.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-gray-600 flex-shrink-0">
                      {new Date(l.startDate).toLocaleDateString("en-IN", { day:"numeric", month:"short" })} – {new Date(l.endDate).toLocaleDateString("en-IN", { day:"numeric", month:"short" })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{l.reason}</p>
                  {l.comments && <p className="text-xs text-gray-600 mt-1">Comment: {l.comments}</p>}
                  {l.status === "pending" && (
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => approve(l._id, "approved")} className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition">
                        <CheckCircle size={12} /> Approve
                      </button>
                      <button onClick={() => approve(l._id, "rejected")} className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition">
                        <XCircle size={12} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
