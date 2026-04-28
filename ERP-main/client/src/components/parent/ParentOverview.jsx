import { CheckCircle2, AlertTriangle } from "lucide-react";
import DarkCard from "./DarkCard";
import Metric from "./Metric";

const DAY_MAP = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

export default function ParentOverview({ parent, activeStudent, stats, results, timetable }) {
  const todayName     = DAY_MAP[new Date().getDay()];
  const todaySchedule = timetable.find(d => d.day === todayName);

  return (
    <div className="space-y-6">

      {/* Welcome Banner */}
      <section className="bg-gradient-to-r from-indigo-600/90 to-indigo-500/80 rounded-2xl p-6 border border-indigo-500/30">
        <p className="text-xs text-indigo-200 uppercase tracking-widest mb-1">Parent Portal</p>
        <h2 className="text-2xl font-bold text-white">{parent?.name || "Parent"}</h2>
        {activeStudent && (
          <p className="text-sm text-indigo-200 mt-1">
            Viewing: <span className="font-semibold text-white">{activeStudent.name}</span>
            {activeStudent.classId && (
              <span> &middot; Class {activeStudent.classId.name}-{activeStudent.classId.section}</span>
            )}
          </p>
        )}
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric
          title="Attendance %"
          value={stats.total > 0 ? `${stats.percent}%` : "No Data"}
          accent={stats.total === 0 ? "amber" : stats.percent >= 75 ? "emerald" : "rose"}
        />
        <Metric title="Present" value={stats.present} accent="indigo" />
        <Metric title="Absent"  value={stats.absent}  accent="rose" />
        <Metric
          title="Overall Result"
          value={results?.summary?.overallResult || "No Data"}
          accent={
            !results?.summary ? "amber" :
            results.summary.overallResult === "PASS" ? "emerald" : "rose"
          }
        />
      </div>

      {/* Insight Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <DarkCard title="Attendance Insight">
          <div className="flex items-start gap-3">
            {stats.total === 0 ? (
              <AlertTriangle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
            ) : stats.percent >= 75 ? (
              <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle size={20} className="text-rose-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`text-sm font-medium ${
                stats.total === 0 ? "text-amber-400" :
                stats.percent >= 75 ? "text-emerald-400" : "text-rose-400"
              }`}>
                {stats.total === 0
                  ? "No attendance records this month"
                  : stats.percent >= 75
                  ? "Attendance is healthy"
                  : "Attendance below 75%"}
              </p>
              {stats.total > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {stats.absent} absent day{stats.absent !== 1 ? "s" : ""} this month
                </p>
              )}
            </div>
          </div>
        </DarkCard>

        <DarkCard title="Academic Performance">
          {results?.summary ? (
            <div className="flex items-center gap-4">
              <div>
                <p className="text-3xl font-bold text-white">{results.summary.overallPercent}%</p>
                <p className="text-xs text-gray-500 mt-1">Overall score</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold
                ${results.summary.overallResult === "PASS"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/20 text-rose-400"}`}>
                {results.summary.overallResult}
              </span>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No published results yet.</p>
          )}
        </DarkCard>
      </div>

      {/* Today Schedule */}
      <DarkCard title={`Today (${todayName})`}>
        {!todaySchedule || todaySchedule.periods?.length === 0 ? (
          <p className="text-sm text-gray-500">No classes scheduled today.</p>
        ) : (
          <div className="space-y-2">
            {todaySchedule.periods.map((p, i) => (
              <div key={i} className="bg-white/[0.04] rounded-xl p-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-200">{p.subject}</p>
                  <p className="text-xs text-gray-500">{p.startTime} - {p.endTime}</p>
                </div>
                <p className="text-xs text-gray-500">{p.teacherId?.name || "-"}</p>
              </div>
            ))}
          </div>
        )}
      </DarkCard>
    </div>
  );
}
