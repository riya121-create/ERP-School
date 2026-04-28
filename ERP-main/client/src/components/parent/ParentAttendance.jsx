import DarkCard from "./DarkCard";
import Metric from "./Metric";
import AttendanceCalendar from "./AttendanceCalendar";

function fmtDate(d) { return d ? new Date(d).toLocaleDateString("en-IN") : "-"; }

export default function ParentAttendance({ stats, monthAtt }) {
  const now = new Date();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric title="Present"      value={stats.present} accent="emerald" />
        <Metric title="Absent"       value={stats.absent}  accent="rose" />
        <Metric title="Total Days"   value={stats.total}   accent="indigo" />
        <Metric
          title="Attendance %"
          value={stats.total > 0 ? `${stats.percent}%` : "No Data"}
          accent={stats.total === 0 ? "amber" : stats.percent >= 75 ? "emerald" : "rose"}
        />
      </div>

      <DarkCard title="Monthly Calendar">
        <AttendanceCalendar month={now} data={monthAtt} />
      </DarkCard>

      <DarkCard title="History">
        {monthAtt.length === 0 ? (
          <p className="text-sm text-gray-500">No attendance records this month.</p>
        ) : (
          monthAtt.slice().reverse().map((a, i) => (
            <div key={i} className="flex justify-between py-2.5 text-sm border-b border-white/[0.06] last:border-0">
              <span className="text-gray-400">{fmtDate(a.date)}</span>
              <span className={`font-medium ${a.status === "present" ? "text-emerald-400" : "text-rose-400"}`}>
                {a.status.toUpperCase()}
              </span>
            </div>
          ))
        )}
      </DarkCard>
    </div>
  );
}
