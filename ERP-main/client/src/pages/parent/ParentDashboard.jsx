import { useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import {
  Home,
  ClipboardList,
  Calendar,
  User,
  LogOut,
  ChevronDown
} from "lucide-react";
import ParentFees from "@/pages/parent/ParentFees";


/* =====================================================
   PARENT DASHBOARD — FAANG LEVEL (MOBILE FIRST)
   • Read-only
   • Child-centric
   • Insight-driven
===================================================== */

export default function ParentDashboard() {
  const [parent, setParent] = useState(null);
  const [students, setStudents] = useState([]);
  const [activeStudentId, setActiveStudentId] = useState(null);

  const [attendance, setAttendance] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [results, setResults] = useState(null);

  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  /* ================= LOAD PARENT CONTEXT ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/parent/me");
        setParent(res.data.parent);
      setStudents(res.data.students || []);
setActiveStudentId(res.data.activeStudentId || null);

      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ================= LOAD CHILD DATA ================= */
useEffect(() => {
  if (!activeStudentId) return;

  Promise.all([
    api.get(`/parent/attendance/${activeStudentId}`),
api.get(`/parent/timetable/${activeStudentId}`),

    api.get(`/parent/results/${activeStudentId}`) // 👈 MARKS API
  ]).then(([a, t, r]) => {
    setAttendance(a.data || []);
    setTimetable(t.data || []);
    setResults(r.data || null); // 👈 SAVE RESULTS
  });
}, [activeStudentId]);


  /* ================= ATTENDANCE STATS ================= */
  const now = new Date();
  const monthKey = now.toISOString().slice(0, 7);

  const monthAttendance = attendance.filter(a =>
    a.date?.startsWith(monthKey)
  );

  const stats = useMemo(() => {
    const total = monthAttendance.length;
    const present = monthAttendance.filter(a => a.status === "present").length;
    const absent = total - present;
    const percent = total ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, percent };
  }, [monthAttendance]);

  const activeStudent = students.find(s => s._id === activeStudentId);

  const todayName = new Date()
  .toLocaleDateString("en-US", { weekday: "long" })
  .trim();

const todaySchedule =
  timetable && timetable.length > 0
    ? timetable.find(d => d.day === todayName) || timetable[0]
    : null;



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading parent dashboard…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">

      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex w-72 bg-white border-r px-6 py-8 flex-col">
        <ParentHeader parent={parent} />

        <StudentSwitcher
          students={students}
          activeStudentId={activeStudentId}
          setActiveStudentId={setActiveStudentId}
        />

        <Nav tab={tab} setTab={setTab} />

        <Logout />
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 px-4 md:px-10 py-6 space-y-6 pb-24 md:pb-6">

        {/* ============ OVERVIEW ============ */}
        {tab === "overview" && activeStudent && (
          <>
            <ChildHeader student={activeStudent} />

            <div className="grid md:grid-cols-2 gap-4">
              <InsightCard title="📊 Attendance Overview">
                <p className="text-4xl font-bold">{stats.percent}%</p>
                <p className="text-sm text-slate-500">
                  {stats.absent} days absent this month
                </p>
              </InsightCard>

              <InsightCard title="🧠 Parent Insight">
                {stats.percent < 75 ? (
                  <p className="text-red-600 text-sm">
                    Attendance is below recommended level. Please monitor closely.
                  </p>
                ) : (
                  <p className="text-green-600 text-sm">
                    Attendance looks healthy. Keep it up 👍
                  </p>
                  
                )}
              </InsightCard>
              {results && results.summary && (
  <InsightCard title="📘 Academic Performance">
    <p className="text-3xl font-bold">
      {results.summary.overallPercent}%
    </p>

    <p className="text-sm text-slate-500">
      Overall Result: {results.summary.overallResult}
    </p>
  </InsightCard>
)}

            </div>
          </>
        )}

        {/* ============ ATTENDANCE ============ */}
        {tab === "attendance" && (
          <>
            <Card title="Attendance Summary">
              <p className="text-lg">
                Present <b>{stats.present}</b> / {stats.total} days
              </p>
              <p className="text-sm text-slate-500">
                Consistent attendance supports better learning outcomes.
              </p>
            </Card>

            <Card title="Daily Attendance">
              <AttendanceCalendar month={now} data={monthAttendance} />
            </Card>
          </>
        )}

        {/* ============ SCHEDULE ============ */}
        {tab === "schedule" && (
          <Card title={`📅 Today (${todayName})`}>
            {!todaySchedule || !todaySchedule.periods || todaySchedule.periods.length === 0 ? (

              <p className="text-sm text-slate-500">No classes scheduled today</p>
            ) : (
              todaySchedule.periods.map((p, i) => (
                <div key={i} className="border rounded-lg p-3 mb-2 text-sm">
                  <p className="font-medium">{p.subject}</p>
                  <p className="text-xs text-slate-500">
                    {p.startTime} – {p.endTime}
                  </p>
                </div>
              ))
            )}
          </Card>
        )}
{tab === "marks" && (
  <Card title="📊 Exam Results">
    {!results || !results.exams || Object.keys(results.exams).length === 0 ? (
      <p className="text-sm text-slate-500">
        No exam results published yet
      </p>
    ) : (
      Object.entries(results.exams).map(([examType, papers]) => (
        <div key={examType} className="mb-6">
          {/* 🔹 Exam Type Heading */}
          <h3 className="font-semibold text-indigo-600 mb-3">
            {examType}
          </h3>

          {/* 🔹 Subject-wise marks */}
          {Array.isArray(papers) && papers.map((p, i) => (

            <div
              key={i}
              className="border rounded-lg p-3 mb-2 text-sm"
            >
              <div className="flex justify-between">
                <p className="font-medium">{p.subject}</p>
                <p className="font-semibold">
                  {p.marks}/{p.maxMarks}
                </p>
              </div>

              <p className="text-xs text-slate-500">
                {p.percentage}% · {p.result}
              </p>
            </div>
          ))}
        </div>
      ))
    )}
  </Card>
)}
{/* ============ FEES ============ */}
{tab === "fees" && activeStudentId && (
  <ParentFees studentId={activeStudentId} />
)}


        {/* ============ PROFILE ============ */}
        {tab === "profile" && parent && (
          <Card title="Parent Profile">
            <Info label="Name" value={parent.name} />
            <Info label="Phone" value={parent.phone} />
            <Info label="Linked Children" value={students.length} />
          </Card>
        )}
      </main>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2">
        <BottomNav icon={<Home />} active={tab === "overview"} onClick={() => setTab("overview")} />
        <BottomNav icon={<ClipboardList />} active={tab === "attendance"} onClick={() => setTab("attendance")} />
        <BottomNav icon={<Calendar />} active={tab === "schedule"} onClick={() => setTab("schedule")} />
        <BottomNav
  icon={<ClipboardList />}
  active={tab === "marks"}
  onClick={() => setTab("marks")}
/>
<BottomNav
  icon={<ClipboardList />}
  active={tab === "fees"}
  onClick={() => setTab("fees")}
/>

        <BottomNav icon={<User />} active={tab === "profile"} onClick={() => setTab("profile")} />
      </div>
    </div>
  );
}

/* =====================================================
   COMPONENTS
===================================================== */

function ParentHeader({ parent }) {
  return (
    <div className="mb-6">
      <p className="text-sm text-slate-500">Parent Account</p>
      <p className="font-semibold text-lg">{parent?.name}</p>
    </div>
  );
}

function ChildHeader({ student }) {
  return (
    <section className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-2xl p-6">
      <h2 className="text-2xl font-semibold">{student.name}</h2>
      <p className="text-sm opacity-90">
        Class {student.classId?.name}-{student.classId?.section} · Roll {student.rollNo || "—"}
      </p>
    </section>
  );
}

function StudentSwitcher({ students, activeStudentId, setActiveStudentId }) {
  if (students.length <= 1) return null;

  return (
    <div className="mb-6">
      <p className="text-xs uppercase text-slate-500 mb-1">Child</p>
      <div className="relative">
        <select
          value={activeStudentId}
          onChange={e => setActiveStudentId(e.target.value)}
          className="w-full border rounded-xl p-2 text-sm"
        >
          {students.map(s => (
            <option key={s._id} value={s._id}>
              {s.name} ({s.classId?.name}-{s.classId?.section})
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-2.5 text-slate-400" size={16} />
      </div>
    </div>
  );
}

function Nav({ tab, setTab }) {
  return (
    <>
      <NavItem label="Overview" active={tab === "overview"} onClick={() => setTab("overview")} />
      <NavItem label="Attendance" active={tab === "attendance"} onClick={() => setTab("attendance")} />
      <NavItem label="Schedule" active={tab === "schedule"} onClick={() => setTab("schedule")} />
        <NavItem label="Marks" active={tab === "marks"} onClick={() => setTab("marks")} />
<NavItem label="Fees" active={tab === "fees"} onClick={() => setTab("fees")} />

      <NavItem label="Profile" active={tab === "profile"} onClick={() => setTab("profile")} />
        
    </>
  );
}

/* ================= UI ATOMS ================= */

function NavItem({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 rounded-lg text-sm mb-1
      ${active ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-100"}`}
    >
      {label}
    </button>
  );
}

function BottomNav({ icon, active, onClick }) {
  return (
    <button onClick={onClick} className={active ? "text-indigo-600" : "text-slate-400"}>
      {icon}
    </button>
  );
}

function Card({ title, children }) {
  return (
    <section className="bg-white rounded-2xl border p-4 md:p-6">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      {children}
    </section>
  );
}

function InsightCard({ title, children }) {
  return (
    <Card title={title}>
      {children}
    </Card>
  );
}

function Info({ label, value }) {
  return (
    <div className="mb-2">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className="font-medium">{value ?? "—"}</p>
    </div>
  );
}

function Logout() {
  return (
    <div className="mt-auto pt-6 border-t">
      <button
        onClick={() => {
          localStorage.clear();
          window.location.href = "/login";
        }}
        className="flex items-center gap-2 text-sm text-red-600"
      >
        <LogOut size={16} /> Logout
      </button>
    </div>
  );
}

function AttendanceCalendar({ month, data }) {
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const map = Object.fromEntries(data.map(d => [d.date, d.status]));

  return (
    <div className="grid grid-cols-7 gap-2 text-xs">
      {Array.from({ length: days }, (_, i) => {
        const day = i + 1;
        const date = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const status = map[date];

        return (
          <div
            key={day}
            className={`h-7 rounded flex items-center justify-center
            ${status === "present" ? "bg-green-100 text-green-700" :
              status === "absent" ? "bg-red-100 text-red-700" :
              "bg-slate-100 text-slate-400"}`}
          >
            {day}
          </div>
        );
      })}
    </div>
  );
}
