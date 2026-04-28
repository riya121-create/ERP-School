export default function AttendanceCalendar({ month, data }) {
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const map  = Object.fromEntries((data || []).map(d => [d.date, d.status]));

  return (
    <div className="grid grid-cols-7 gap-2 text-sm">
      {Array.from({ length: days }, (_, i) => {
        const day    = i + 1;
        const date   = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const status = map[date];
        return (
          <div
            key={day}
            className={`h-9 rounded-lg flex items-center justify-center text-xs font-medium
              ${status === "present" ? "bg-emerald-500/20 text-emerald-400" :
                status === "absent"  ? "bg-rose-500/20 text-rose-400" :
                "bg-white/[0.04] text-gray-600"}`}
          >
            {day}
          </div>
        );
      })}
    </div>
  );
}
