import { useEffect, useState } from "react";
import api from "@/services/api";

/* =====================================================
   ADMIN ATTENDANCE OVERVIEW (FAANG LEVEL)
===================================================== */
export default function AdminAttendance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    api
      .get("/admin/attendance")
      .then(res => {
        if (mounted) {
          setData(res.data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(
            err?.response?.data?.message ||
              "Failed to load attendance overview"
          );
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <AttendanceSkeleton />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  return (
    <div className="space-y-6">

      {/* ===== HEADER ===== */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Attendance Overview
          </h1>
          <p className="text-sm text-gray-500">
            Daily attendance snapshot
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
          {data.date}
        </span>
      </header>

      {/* ===== STATS GRID ===== */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Students"
          value={data.totalStudents}
        />
        <StatCard
          label="Present"
          value={data.present}
          tone="green"
        />
        <StatCard
          label="Absent"
          value={data.absent}
          tone="red"
        />
        <StatCard
          label="Attendance %"
          value={`${data.attendancePercent}%`}
          tone="blue"
        />
      </section>

      {/* ===== SUMMARY CARD ===== */}
      <section className="rounded-2xl border bg-white p-5">
        <p className="text-xs text-gray-500">Classes Marked Today</p>
        <p className="text-3xl font-semibold mt-1">
          {data.classesMarked}
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Classes where attendance has been submitted
        </p>
      </section>
    </div>
  );
}

/* =====================================================
   COMPONENTS
===================================================== */

function StatCard({ label, value, tone }) {
  const toneMap = {
    green: "text-green-600 bg-green-50 border-green-200",
    red: "text-red-600 bg-red-50 border-red-200",
    blue: "text-blue-600 bg-blue-50 border-blue-200",
  };

  return (
    <div
      className={`rounded-2xl border bg-white p-4 ${
        tone ? toneMap[tone] : ""
      }`}
    >
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

/* =====================================================
   STATES
===================================================== */

function AttendanceSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 w-48 bg-gray-200 rounded" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="h-24 rounded-2xl bg-gray-200"
          />
        ))}
      </div>

      <div className="h-28 rounded-2xl bg-gray-200" />
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-medium text-red-600">
        {message}
      </p>
    </div>
  );
}
