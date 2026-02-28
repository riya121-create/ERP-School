import { useEffect, useState } from "react";
import api from "@/services/api";

export default function AdminAttendanceByClass() {
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get(`/attendance/by-class?date=${date}`).then(res => {
      setRows(res.data);
    });
  }, [date]);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Class Attendance</h1>

      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        className="border rounded-xl px-3 py-2 text-sm"
      />

      <div className="space-y-3">
        {rows.map(r => (
          <div
            key={r.classId}
            className="p-4 rounded-2xl border bg-white flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">
                {r.className} – {r.section}
              </p>
              <p className="text-xs text-gray-500">
                Present {r.present} | Absent {r.absent}
              </p>
            </div>

            <span className="text-sm font-semibold">
              {Math.round(
                (r.present / (r.present + r.absent || 1)) * 100
              )}
              %
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
