import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { ArrowLeft, GraduationCap, BookOpen, Calendar, Clock, Send, CheckCircle, FileText } from "lucide-react";

const SUBJECT_COLORS = [
  { bg: "bg-indigo-500/15",  text: "text-indigo-400",  border: "border-indigo-500/25"  },
  { bg: "bg-sky-500/15",     text: "text-sky-400",     border: "border-sky-500/25"     },
  { bg: "bg-violet-500/15",  text: "text-violet-400",  border: "border-violet-500/25"  },
  { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/25" },
  { bg: "bg-rose-500/15",    text: "text-rose-400",    border: "border-rose-500/25"    },
  { bg: "bg-amber-500/15",   text: "text-amber-400",   border: "border-amber-500/25"   },
];
const subColorMap = {};
let subColorIdx = 0;
const getSubColor = sub => {
  if (!subColorMap[sub]) subColorMap[sub] = SUBJECT_COLORS[subColorIdx++ % SUBJECT_COLORS.length];
  return subColorMap[sub];
};

const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short", year:"numeric" }) : "—";

export default function AdminFinalExamView() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [exam, setExam]     = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get(`/admin/exams/final/${id}`);
      setExam(res.data);
    } catch (err) {
      alert("Failed to load exam");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const publish = async () => {
    if (!confirm("Publish this exam? Teachers will be able to see it.")) return;
    try {
      await api.patch(`/admin/final-exams/${id}/publish`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to publish");
    }
  };

  /* group schedule by class */
  const grouped = useMemo(() => {
    if (!exam?.schedule) return {};
    const map = {};
    exam.schedule.forEach(s => {
      const key = `${s.className}-${s.section}`;
      if (!map[key]) map[key] = { className: s.className, section: s.section, rows: [] };
      map[key].rows.push(s);
    });
    return map;
  }, [exam]);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-600 text-sm animate-pulse">Loading exam…</div>
  );

  if (!exam) return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-400 text-sm">Exam not found</div>
  );

  const published = exam.status === "PUBLISHED";

  return (
    <div className="space-y-5 text-gray-100 max-w-4xl">

      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin/exams/final")}
            className="p-2 rounded-xl bg-white/[0.05] border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition flex-shrink-0">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{exam.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
              <FileText size={12} /> {exam.examCode}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border
            ${published
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
              : "bg-amber-500/15 text-amber-400 border-amber-500/25"
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${published ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
            {published ? "Published" : "Draft"}
          </span>
          {!published && (
            <button onClick={publish}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition">
              <Send size={13} /> Publish
            </button>
          )}
        </div>
      </div>

      {/* META STRIP */}
      <div className="grid grid-cols-3 gap-3">
        <MetaCard icon={<GraduationCap size={14} />} label="Classes" value={Object.keys(grouped).length} color="indigo" />
        <MetaCard icon={<BookOpen size={14} />}      label="Subjects" value={exam.schedule?.length || 0} color="sky" />
        <MetaCard icon={<Calendar size={14} />}      label="Created"
          value={new Date(exam.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short" })} color="violet" />
      </div>

      {/* SCHEDULE BY CLASS */}
      <div className="space-y-4">
        {Object.values(grouped).map((grp, gi) => (
          <div key={gi} className="rounded-2xl border border-white/[0.08] bg-[#161616] overflow-hidden">
            {/* class header */}
            <div className="flex items-center justify-between px-5 py-3 bg-white/[0.03] border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                  <span className="text-xs font-bold text-indigo-400">{grp.className}</span>
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Class {grp.className}</p>
                  <p className="text-xs text-gray-600">Section {grp.section}</p>
                </div>
              </div>
              <span className="text-xs text-gray-600">{grp.rows.length} subject{grp.rows.length !== 1 ? "s" : ""}</span>
            </div>

            {/* subject rows */}
            <div className="divide-y divide-white/[0.04]">
              {grp.rows
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((s, i) => {
                  const c = getSubColor(s.subject);
                  return (
                    <div key={i} className="grid grid-cols-[2fr_2fr_1.5fr_1fr] gap-3 px-5 py-3.5 items-center hover:bg-white/[0.02] transition">
                      {/* subject */}
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
                          {s.subject}
                        </span>
                      </div>

                      {/* date */}
                      <div className="flex items-center gap-1.5 text-sm text-gray-300">
                        <Calendar size={13} className="text-gray-600 flex-shrink-0" />
                        {fmtDate(s.date)}
                      </div>

                      {/* time */}
                      <div className="flex items-center gap-1.5 text-sm text-gray-400">
                        <Clock size={13} className="text-gray-600 flex-shrink-0" />
                        {s.startTime} – {s.endTime}
                      </div>

                      {/* duration */}
                      <div className="text-right">
                        <span className="text-xs text-gray-600 bg-white/[0.04] border border-white/[0.07] px-2 py-1 rounded-lg">
                          {s.duration || "—"} min
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {/* published notice */}
      {published && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
          <p className="text-sm text-emerald-400">This exam is published. Teachers can now view and enter marks.</p>
        </div>
      )}
    </div>
  );
}

function MetaCard({ icon, label, value, color }) {
  const colors = {
    indigo: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" },
    sky:    { bg: "bg-sky-500/10",    text: "text-sky-400",    border: "border-sky-500/20"    },
    violet: { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20" },
  };
  const c = colors[color];
  return (
    <div className={`flex items-center gap-3 rounded-xl border ${c.border} ${c.bg} px-4 py-3`}>
      <span className={c.text}>{icon}</span>
      <div>
        <p className="text-[11px] text-gray-600 uppercase tracking-wider font-medium">{label}</p>
        <p className="text-lg font-bold text-white leading-none mt-0.5">{value}</p>
      </div>
    </div>
  );
}
