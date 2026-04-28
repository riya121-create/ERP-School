import { useState, useEffect } from "react";
import { Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import api from "../../services/api";
import DarkCard from "./DarkCard";
import Metric from "./Metric";

function fmtDate(d) { return d ? new Date(d).toLocaleDateString("en-IN") : "-"; }

export default function ParentHomework({ activeStudentId }) {
  const [homework, setHomework] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeStudentId) return;
    setLoading(true);
    api.get(`/parent-dashboard/homework/${activeStudentId}`)
      .then(res => setHomework(res.data))
      .catch(() => setHomework(null))
      .finally(() => setLoading(false));
  }, [activeStudentId]);

  if (loading) {
    return <DarkCard title="Homework"><p className="text-sm text-gray-500">Loading...</p></DarkCard>;
  }

  if (!homework) {
    return <DarkCard title="Homework"><p className="text-sm text-gray-500">No homework data available.</p></DarkCard>;
  }

  const stats = homework.statistics || {};

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric title="Total" value={stats.total || 0} accent="indigo" />
        <Metric title="Pending" value={stats.pending || 0} accent="amber" />
        <Metric title="Submitted" value={stats.submitted || 0} accent="emerald" />
        <Metric title="Overdue" value={stats.overdue || 0} accent="rose" />
      </div>

      {/* Pending Homework */}
      {homework.homework?.pending?.length > 0 && (
        <DarkCard title="Pending Homework">
          <div className="space-y-3">
            {homework.homework.pending.map((hw, i) => (
              <div key={i} className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06]">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-200">{hw.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {hw.classId?.name}-{hw.classId?.section} • {hw.teacherId?.name || "Teacher"}
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400">
                    Pending
                  </span>
                </div>
                {hw.description && (
                  <p className="text-sm text-gray-400 mb-3">{hw.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> Due: {fmtDate(hw.dueDate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </DarkCard>
      )}

      {/* Submitted Homework */}
      {homework.homework?.submitted?.length > 0 && (
        <DarkCard title="Submitted Homework">
          <div className="space-y-3">
            {homework.homework.submitted.map((hw, i) => (
              <div key={i} className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06]">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-200">{hw.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {hw.classId?.name}-{hw.classId?.section} • {hw.teacherId?.name || "Teacher"}
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Submitted
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> Due: {fmtDate(hw.dueDate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </DarkCard>
      )}

      {/* Overdue Homework */}
      {homework.homework?.overdue?.length > 0 && (
        <DarkCard title="Overdue Homework">
          <div className="space-y-3">
            {homework.homework.overdue.map((hw, i) => (
              <div key={i} className="bg-white/[0.04] rounded-xl p-4 border border-rose-500/20">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-200">{hw.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {hw.classId?.name}-{hw.classId?.section} • {hw.teacherId?.name || "Teacher"}
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 flex items-center gap-1">
                    <AlertCircle size={12} /> Overdue
                  </span>
                </div>
                {hw.description && (
                  <p className="text-sm text-gray-400 mb-3">{hw.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-rose-400">
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> Due: {fmtDate(hw.dueDate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </DarkCard>
      )}

      {stats.total === 0 && (
        <DarkCard>
          <p className="text-sm text-gray-500 text-center py-8">No homework assigned yet.</p>
        </DarkCard>
      )}
    </div>
  );
}
