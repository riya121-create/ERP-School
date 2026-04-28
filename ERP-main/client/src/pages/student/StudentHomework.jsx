import { useEffect, useState } from "react";
import { Calendar, CheckCircle2, Clock, AlertCircle, Star, FileText } from "lucide-react";
import api from "../../services/api";

function fmtDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_CONFIG = {
  pending:   { label: "Pending",   cls: "bg-amber-500/20 text-amber-400",   icon: <Clock size={12} /> },
  submitted: { label: "Submitted", cls: "bg-emerald-500/20 text-emerald-400", icon: <CheckCircle2 size={12} /> },
  graded:    { label: "Graded",    cls: "bg-indigo-500/20 text-indigo-400",  icon: <Star size={12} /> },
  overdue:   { label: "Overdue",   cls: "bg-rose-500/20 text-rose-400",      icon: <AlertCircle size={12} /> },
};

export default function StudentHomework() {
  const [homework, setHomework] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("all");

  useEffect(() => {
    api.get("/student/homework")
      .then(r => setHomework(r.data || []))
      .catch(() => setHomework([]))
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    all:       homework.length,
    pending:   homework.filter(h => h.status === "pending").length,
    submitted: homework.filter(h => h.status === "submitted").length,
    graded:    homework.filter(h => h.status === "graded").length,
    overdue:   homework.filter(h => h.status === "overdue").length,
  };

  const filtered = filter === "all" ? homework : homework.filter(h => h.status === filter);

  if (loading) return (
    <div className="flex items-center justify-center h-40 text-gray-500 text-sm">Loading...</div>
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { key: "pending",   label: "Pending",   accent: "text-amber-400" },
          { key: "submitted", label: "Submitted", accent: "text-emerald-400" },
          { key: "graded",    label: "Graded",    accent: "text-indigo-400" },
          { key: "overdue",   label: "Overdue",   accent: "text-rose-400" },
        ].map(s => (
          <div key={s.key} className="bg-[#111111] border border-white/[0.08] rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.accent}`}>{counts[s.key]}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "submitted", "graded", "overdue"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition capitalize
              ${filter === f
                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                : "bg-white/[0.04] text-gray-500 border border-white/[0.06] hover:text-gray-300"}`}>
            {f} {f !== "all" && `(${counts[f]})`}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-8 text-center">
          <p className="text-gray-500 text-sm">No homework found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((hw, i) => {
            const cfg = STATUS_CONFIG[hw.status] || STATUS_CONFIG.pending;
            return (
              <div key={i} className="bg-[#111111] border border-white/[0.08] rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-200 truncate">{hw.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{hw.subject} &middot; {hw.teacher}</p>
                  </div>
                  <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${cfg.cls}`}>
                    {cfg.icon} {cfg.label}
                  </span>
                </div>

                {hw.description && (
                  <p className="text-sm text-gray-400 mb-3 leading-relaxed">{hw.description}</p>
                )}

                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} /> Due: {fmtDate(hw.dueDate)}
                    </span>
                    {hw.marks !== null && (
                      <span className="flex items-center gap-1 text-indigo-400 font-semibold">
                        <Star size={13} /> Marks: {hw.marks}
                      </span>
                    )}
                  </div>
                  {hw.fileUrl && (
                    <a href={`http://localhost:5000/${hw.fileUrl}`} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition">
                      <FileText size={13} /> {hw.fileName || "Attachment"}
                    </a>
                  )}
                </div>

                {hw.feedback && (
                  <div className="mt-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3">
                    <p className="text-xs text-indigo-300 font-semibold mb-1">Teacher Feedback</p>
                    <p className="text-xs text-gray-400">{hw.feedback}</p>
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
