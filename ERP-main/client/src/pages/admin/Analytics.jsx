import { useEffect, useState } from "react";
import api from "../../services/api";

function Analytics() {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
    attendance: 92
  });

  useEffect(() => {
    // Phase-1: hook ready
    // Later replace with real API
    setStats({
      students: 420,
      teachers: 32,
      classes: 18,
      attendance: 92
    });
  }, []);

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Analytics Overview</h1>
        <p className="text-gray-500 mt-1">
          School performance & attendance insights
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <KPI title="Students" value={stats.students} icon="🎓" />
        <KPI title="Teachers" value={stats.teachers} icon="👩‍🏫" />
        <KPI title="Classes" value={stats.classes} icon="🏫" />
        <KPI title="Attendance %" value={`${stats.attendance}%`} icon="🕒" />
      </div>

      {/* GRAPHS PLACEHOLDER */}
      <div className="grid md:grid-cols-2 gap-6">

        <ChartCard
          title="Attendance Trend (7 days)"
          description="Daily attendance percentage"
        />

        <ChartCard
          title="Class-wise Attendance"
          description="Compare attendance across classes"
        />

      </div>

      {/* INSIGHTS */}
      <div className="bg-white rounded-2xl p-6 shadow border">
        <h2 className="text-xl font-semibold mb-4">
          Key Insights
        </h2>

        <ul className="space-y-3 text-sm text-gray-700">
          <li>⚠️ Class 9-B attendance below 75%</li>
          <li>📉 Mondays show lowest attendance</li>
          <li>✅ Overall attendance improving week-over-week</li>
        </ul>
      </div>

    </div>
  );
}

/* =========================
   COMPONENTS
========================= */

function KPI({ title, value, icon }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow border hover:shadow-lg transition">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{title}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

function ChartCard({ title, description }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow border">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">
        {description}
      </p>

      {/* GRAPH PLACEHOLDER */}
      <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
        Chart will appear here
      </div>
    </div>
  );
}

export default Analytics;
