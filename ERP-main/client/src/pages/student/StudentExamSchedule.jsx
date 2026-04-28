import { useEffect, useState } from "react";
import { Calendar, Clock, BookOpen } from "lucide-react";
import api from "../../services/api";

function fmtDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function daysLeft(d) {
  if (!d) return null;
  const diff = Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

const TYPE_COLORS = {
  UNIT_TEST:  "bg-amber-500/20 text-amber-400",
  MID_TERM:   "bg-indigo-500/20 text-indigo-400",
  FINAL:      "bg-rose-500/20 text-rose-400",
  QUARTERLY:  "bg-emerald-500/20 text-emerald-400",
  HALF_YEARLY:"bg-purple-500/20 text-purple-400",
};

export default function StudentExamSchedule() {
  const [exams,   setExams]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/student/exams")
      .then(r => setExams(r.data || []))
      .catch(() => setExams([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-40 text-gray-500 text-sm">Loading...</div>
  );

  const upcoming = exams.filter(e => daysLeft(e.date) >= 0);
  const past     = exams.filter(e => daysLeft(e.date) < 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-4">
          <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">Total Exams</p>
          <p className="text-2xl font-bold text-white">{exams.length}</p>
        </div>
        <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-4">
          <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">Upcoming</p>
          <p className="text-2xl font-bold text-amber-400">{upcoming.length}</p>
        </div>
        <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-4">
          <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">Completed</p>
          <p className="text-2xl font-bold text-emerald-400">{past.length}</p>
        </div>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-5 md:p-6">
          <h2 className="text-base font-semibold text-gray-200 mb-4">Upcoming Exams</h2>
          <div className="space-y-3">
            {upcoming.map((exam, i) => {
              const days = daysLeft(exam.date);
              return (
                <div key={i} className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06]">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                        <BookOpen size={16} className="text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-200">{exam.name || exam.subject}</h3>
                        <p className="text-xs text-gray-500">{exam.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${TYPE_COLORS[exam.type] || "bg-gray-500/20 text-gray-400"}`}>
                        {exam.type?.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} /> {fmtDate(exam.date)}
                    </span>
                    <span className={`font-semibold ${days <= 3 ? "text-rose-400" : days <= 7 ? "text-amber-400" : "text-emerald-400"}`}>
                      {days === 0 ? "Today!" : `${days} day${days !== 1 ? "s" : ""} left`}
                    </span>
                  </div>
                  {exam.maxMarks && (
                    <p className="text-xs text-gray-600 mt-1">Max Marks: {exam.maxMarks}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-5 md:p-6">
          <h2 className="text-base font-semibold text-gray-200 mb-4">Past Exams</h2>
          <div className="space-y-2">
            {past.map((exam, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/[0.06] last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-300">{exam.name || exam.subject}</p>
                  <p className="text-xs text-gray-600">{exam.subject} &middot; {exam.type?.replace("_", " ")}</p>
                </div>
                <span className="text-xs text-gray-500">{fmtDate(exam.date)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {exams.length === 0 && (
        <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-8 text-center">
          <p className="text-gray-500 text-sm">No exams scheduled yet.</p>
        </div>
      )}
    </div>
  );
}
