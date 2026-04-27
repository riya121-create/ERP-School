import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Send, GraduationCap, BookOpen, Calendar, FileText, CheckCircle, Clock } from "lucide-react";

export default function AdminFinalExamList() {
  const [exams, setExams]     = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/exams/final");
      setExams(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const publish = async (id) => {
    if (!confirm("Publish this exam? Teachers will be able to see it.")) return;
    try {
      await api.patch(`/admin/final-exams/${id}/publish`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to publish");
    }
  };

  const draftCount     = exams.filter(e => e.status !== "PUBLISHED").length;
  const publishedCount = exams.filter(e => e.status === "PUBLISHED").length;

  return (
    <div className="space-y-5 text-gray-100">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Final Examinations</h1>
          <p className="text-sm text-gray-500 mt-0.5">Admin-controlled exams — Draft → Published</p>
        </div>
        <button
          onClick={() => navigate("/admin/exams/final/create")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition self-start sm:self-auto"
        >
          <Plus size={15} /> Create Final Exam
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={<GraduationCap size={15} />} label="Total"     value={exams.length}    color="indigo" />
        <StatCard icon={<CheckCircle size={15} />}   label="Published" value={publishedCount}  color="emerald" />
        <StatCard icon={<Clock size={15} />}         label="Draft"     value={draftCount}      color="amber" />
      </div>

      {/* LIST */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#161616] overflow-hidden">

        {/* table header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 px-5 py-3 bg-white/[0.03] border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-gray-600">
          <div>Exam</div>
          <div className="text-center">Created</div>
          <div className="text-center">Schedules</div>
          <div className="text-center">Status</div>
          <div className="text-right pr-1">Actions</div>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {loading ? (
            <div className="py-16 text-center text-gray-600 text-sm">Loading exams…</div>
          ) : exams.length === 0 ? (
            <div className="py-16 text-center">
              <GraduationCap size={28} className="text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-3">No final exams created yet</p>
              <button onClick={() => navigate("/admin/exams/final/create")}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition">
                + Create your first exam
              </button>
            </div>
          ) : (
            exams.map(exam => {
              const published = exam.status === "PUBLISHED";
              return (
                <div key={exam._id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 px-5 py-4 items-center hover:bg-white/[0.02] transition">

                  {/* exam info */}
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                      ${published ? "bg-emerald-500/15" : "bg-amber-500/15"}`}>
                      <GraduationCap size={16} className={published ? "text-emerald-400" : "text-amber-400"} />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{exam.name}</p>
                      <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                        <FileText size={10} /> {exam.examCode}
                      </p>
                    </div>
                  </div>

                  {/* created */}
                  <div className="text-center">
                    <p className="text-xs text-gray-400">
                      {exam.createdAt ? new Date(exam.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : "—"}
                    </p>
                  </div>

                  {/* schedules */}
                  <div className="flex justify-center">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/[0.04] border border-white/[0.07] px-2.5 py-1 rounded-lg">
                      <BookOpen size={11} /> {exam.schedule?.length || 0}
                    </span>
                  </div>

                  {/* status */}
                  <div className="flex justify-center">
                    <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border
                      ${published
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                        : "bg-amber-500/15 text-amber-400 border-amber-500/25"
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${published ? "bg-emerald-400" : "bg-amber-400"}`} />
                      {published ? "Published" : "Draft"}
                    </span>
                  </div>

                  {/* actions */}
                  <div className="flex items-center gap-2 justify-end">
                    {!published && (
                      <button onClick={() => publish(exam._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition">
                        <Send size={12} /> Publish
                      </button>
                    )}
                    <button onClick={() => navigate(`/admin/exams/final/view/${exam._id}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 text-xs font-semibold transition">
                      <Eye size={12} /> View
                    </button>
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

/* stat card */
const STAT_COLORS = {
  indigo:  { bg: "bg-indigo-500/10",  text: "text-indigo-400",  border: "border-indigo-500/20"  },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  amber:   { bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/20"   },
};
function StatCard({ icon, label, value, color }) {
  const c = STAT_COLORS[color];
  return (
    <div className={`flex items-center gap-3 rounded-xl border ${c.border} ${c.bg} px-4 py-3`}>
      <span className={c.text}>{icon}</span>
      <div>
        <p className="text-[11px] text-gray-600 uppercase tracking-wider font-medium">{label}</p>
        <p className="text-xl font-bold text-white leading-none mt-0.5">{value}</p>
      </div>
    </div>
  );
}
