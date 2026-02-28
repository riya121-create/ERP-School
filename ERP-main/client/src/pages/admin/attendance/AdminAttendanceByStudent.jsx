import { useEffect, useState } from "react";
import api from "@/services/api";

export default function AdminAttendanceByStudent() {
  const [studentId, setStudentId] = useState("");
  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [data, setData] = useState(null);

  const load = () => {
    api
      .get(`/attendance/by-student?studentId=${studentId}&month=${month}`)
      .then(res => setData(res.data));
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Student Attendance</h1>

      <div className="grid grid-cols-2 gap-3">
        <input
          placeholder="Student ID"
          value={studentId}
          onChange={e => setStudentId(e.target.value)}
          className="border rounded-xl px-3 py-2 text-sm"
        />
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="border rounded-xl px-3 py-2 text-sm"
        />
      </div>

      <button
        onClick={load}
        className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm"
      >
        Load
      </button>

      {data && (
        <div className="bg-white border rounded-2xl p-5 space-y-2">
          <p>Present: {data.presentDays}</p>
          <p>Absent: {data.absentDays}</p>
          <p>Total: {data.totalDays}</p>
          <p className="font-semibold">
            {data.percentage}% Attendance
          </p>
        </div>
      )}
    </div>
  );
}
