import { useEffect, useState } from "react";
import api from "@/services/api";

export default function AdminAttendanceLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get("/attendance/logs").then(res => setLogs(res.data));
  }, []);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Attendance Audit Logs</h1>

      <div className="space-y-3">
        {logs.map(l => (
          <div
            key={l._id}
            className="p-4 rounded-2xl border bg-white"
          >
            <p className="font-semibold text-sm">
              {l.studentId?.name} ({l.studentId?.rollNo})
            </p>
            <p className="text-xs text-gray-500">
              {l.classId?.name} – {l.classId?.section}
            </p>
            <p
              className={`text-xs mt-1 font-semibold ${
                l.status === "present"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {l.status.toUpperCase()}
            </p>
            <p className="text-[11px] text-gray-400">
              Marked by {l.teacherId?.name} • {l.date}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
