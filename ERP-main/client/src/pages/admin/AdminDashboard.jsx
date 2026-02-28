import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

import CreateClass from "./CreateClass";
import AssignTeacher from "./AssignTeacher";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    teachers: "—",
    students: "—",
    classes: "—",
    attendance: "—"
  });

  useEffect(() => {
    api.get("/admin/dashboard-stats").then(res => {
      setStats({
        teachers: res.data.teachers ?? "—",
        students: res.data.students ?? "—",
        classes: res.data.classes ?? "—",
        attendance: res.data.attendanceToday ?? "—"
      });
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-10">

      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            School operations overview
          </p>
        </div>

        <div className="flex gap-2">
          <NavBtn onClick={() => navigate("/admin/students")}>Students</NavBtn>
          <NavBtn onClick={() => navigate("/admin/teachers")}>Teachers</NavBtn>
          <NavBtn onClick={() => navigate("/admin/classes")}>Classes</NavBtn>
        </div>
      </header>

      {/* STATS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Students" value={stats.students} hint="Active enrolments" />
        <Stat label="Teachers" value={stats.teachers} hint="Faculty members" />
        <Stat label="Classes" value={stats.classes} hint="Running sections" />
        <Stat label="Attendance" value={stats.attendance} hint="Today" />
      </section>

      {/* ACTION PANELS */}
      <section className="grid lg:grid-cols-2 gap-6">
        <Panel title="Create Class" desc="Add a new class and section">
          <CreateClass />
        </Panel>

        <Panel title="Assign Class Teacher" desc="Map teachers to classes">
          <AssignTeacher />
        </Panel>
      </section>

      {/* SYSTEM STATUS */}
      <section className="border rounded-xl p-5 bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          System Status
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Health status="ok" title="Authentication" text="RBAC active" />
          <Health status="warn" title="Teacher Mapping" text="Pending classes" />
          <Health status="ok" title="Academic Data" text="Tracking enabled" />
        </div>
      </section>
    </div>
  );
}

/* ================= UI ================= */

function NavBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 text-sm rounded-lg border bg-white hover:bg-gray-100 transition"
    >
      {children}
    </button>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div className="border rounded-xl p-4 bg-white">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-3xl font-semibold mt-2">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{hint}</p>
    </div>
  );
}

function Panel({ title, desc, children }) {
  return (
    <div className="border rounded-xl p-6 bg-white">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{desc}</p>
      {children}
    </div>
  );
}

function Health({ status, title, text }) {
  const color =
    status === "ok"
      ? "bg-green-100 text-green-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <div className="flex gap-3 items-start">
      <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>
        {status.toUpperCase()}
      </span>
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-gray-500">{text}</p>
      </div>
    </div>
  );
}
