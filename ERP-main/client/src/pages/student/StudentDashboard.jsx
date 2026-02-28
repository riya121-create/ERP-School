import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import {
  Home,
  ClipboardList,
  User,
  LogOut,
  AlertTriangle
} from "lucide-react";

/* =====================================================
   STUDENT DASHBOARD (FAANG LEVEL, MOBILE FIRST)
===================================================== */

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [tab, setTab] = useState("dashboard");
const DAY_MAP = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

const todayName = DAY_MAP[new Date().getDay()];

const todayTimetable = timetable.find(
  d => d.day === todayName
);

  /* ================= LOAD ALL DATA ================= */
  useEffect(() => {
    Promise.all([
      api.get("/student/me"),
      api.get("/attendance/my"),
      api.get("/timetable/student")
    ]).then(([s, a, t]) => {
      setStudent(s.data);
      setAttendance(a.data);
      setTimetable(t.data);
    });
  }, []);

  /* ================= ATTENDANCE STATS ================= */
  const now = new Date();
  const monthKey = now.toISOString().slice(0, 7);

  const monthAttendance = attendance.filter(a =>
    a.date.startsWith(monthKey)
  );

  const stats = useMemo(() => {
    const total = monthAttendance.length;
    const present = monthAttendance.filter(a => a.status === "present").length;
    return {
      total,
      present,
      absent: total - present,
      percent: total ? Math.round((present / total) * 100) : 0
    };
  }, [monthAttendance]);

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  const academicBlocked = student.academicStatus !== "active";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">

      {/* ================= DESKTOP SIDEBAR ================= */}
     <aside className="hidden md:flex w-72 bg-white border-r px-6 py-8 flex-col">
  <StudentHeader student={student} />

  <Nav tab={tab} setTab={setTab} />

  {/* 🔥 TODAY TIMETABLE PREVIEW (SIDEBAR) */}
  {todayTimetable && todayTimetable.periods.length > 0 && (
    <div className="mt-6 bg-slate-50 rounded-xl p-3 text-xs">
      <p className="font-semibold mb-2 text-slate-700">
        Today ({todayName})
      </p>

      {todayTimetable.periods.slice(0, 2).map((p, i) => (
        <div key={i} className="mb-2">
          <p className="font-medium">{p.subject}</p>
          <p className="text-slate-500">
            {p.startTime} – {p.endTime}
          </p>
        </div>
      ))}

      {todayTimetable.periods.length > 2 && (
        <p
          className="text-indigo-600 cursor-pointer font-medium"
          onClick={() => setTab("timetable")}
        >
          View full →
        </p>
      )}
    </div>
  )}

  <Logout />
</aside>


      {/* ================= MAIN ================= */}
      <main className="flex-1 px-4 md:px-10 py-6 space-y-6 pb-20 md:pb-6">

        {/* 🚨 STATUS */}
        {academicBlocked && <BlockedBanner student={student} />}

        {/* ================= DASHBOARD ================= */}
     {tab === "dashboard" && (
  <>
    <WelcomeCard student={student} />

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Metric title="Attendance %" value={`${stats.percent}%`} />
      <Metric title="Present" value={stats.present} />
      <Metric title="Absent" value={stats.absent} />
      <Metric title="Total" value={stats.total} />
    </div>

    <Card title={`📅 Today (${todayName})`}>
      {!todayTimetable || todayTimetable.periods.length === 0 ? (
        <p className="text-sm text-slate-500">
          No classes scheduled for today 🎉
        </p>
      ) : (
        <div className="space-y-3">
          {todayTimetable.periods.map((p, i) => (
            <div
              key={i}
              className="bg-slate-50 rounded-xl p-3 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{p.subject}</p>
                <p className="text-xs text-slate-500">
                  {p.startTime} – {p.endTime}
                </p>
              </div>
              <p className="text-xs text-slate-600">
                👨‍🏫 {p.teacherId?.name || "—"}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  </>
)}


        {/* ================= ATTENDANCE ================= */}
        {tab === "attendance" && (
          <>
            <Card title="Monthly Attendance">
              <AttendanceCalendar month={now} data={monthAttendance} />
            </Card>

            <Card title="History">
              {monthAttendance
                .slice()
                .reverse()
                .map((a, i) => (
                  <div key={i} className="flex justify-between py-2 text-sm border-b">
                    <span>{formatDate(a.date)}</span>
                    <span className={a.status === "present" ? "text-green-600" : "text-red-600"}>
                      {a.status.toUpperCase()}
                    </span>
                  </div>
                ))}
            </Card>
          </>
        )}
{tab === "timetable" && (
  <Card title="📅 Weekly Timetable">
    {timetable.length === 0 ? (
      <p className="text-sm text-slate-500">No timetable published yet</p>
    ) : (
      <div className="grid gap-4 md:grid-cols-3">
        {timetable.map(day => (
          <div key={day._id} className="border rounded-xl p-3">
            <h4 className="font-semibold mb-2">{day.day}</h4>

            {day.periods.map((p, i) => (
              <div
                key={i}
                className="bg-slate-50 rounded-lg p-2 mb-2 text-sm"
              >
                <p className="font-medium">{p.subject}</p>
                <p className="text-xs text-slate-500">
                  {p.startTime} – {p.endTime}
                </p>
                <p className="text-xs text-slate-600">
                  👨‍🏫 {p.teacherId?.name || "—"}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>
    )}
  </Card>
)}

        {/* ================= PROFILE ================= */}
        {tab === "profile" && (
          <Card title="Student Profile">
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <Info label="Name" value={student.name} />
              <Info label="Gender" value={student.gender} />
              <Info label="DOB" value={formatDate(student.dob)} />
              <Info label="Parent" value={student.parentName} />
              <Info label="Phone" value={student.parentPhone} />
              <Info label="Address" value={student.address} />
              <Info label="Status" value={student.academicStatus} />
            </div>
          </Card>
        )}
      </main>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2">
        <BottomNav icon={<Home />} active={tab === "dashboard"} onClick={() => setTab("dashboard")} />
        <BottomNav icon={<ClipboardList />} active={tab === "attendance"} onClick={() => setTab("attendance")} />
        <BottomNav icon={<User />} active={tab === "profile"} onClick={() => setTab("profile")} />
        <BottomNav
  icon={<ClipboardList />}
  active={tab === "timetable"}
  onClick={() => setTab("timetable")}
/>

      </div>
    </div>
  );
}

/* =====================================================
   SUB COMPONENTS
===================================================== */

function StudentHeader({ student }) {
  return (
    <div className="mb-10 flex items-center gap-3">
      <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
        {student.name[0]}
      </div>
      <div>
        <p className="font-semibold">{student.name}</p>
        <p className="text-xs text-slate-500">
          {student.class
            ? `Class ${student.class.name}-${student.class.section}`
            : "No Active Class"}
        </p>
      </div>
    </div>
  );
}

function Nav({ tab, setTab }) {
  return (
    <>
      <NavItem icon={<Home />} label="Dashboard" active={tab === "dashboard"} onClick={() => setTab("dashboard")} />
      <NavItem icon={<ClipboardList />} label="Attendance" active={tab === "attendance"} onClick={() => setTab("attendance")} />
      <NavItem icon={<User />} label="Profile" active={tab === "profile"} onClick={() => setTab("profile")} />
      <NavItem
  icon={<ClipboardList />}
  label="Timetable"
  active={tab === "timetable"}
  onClick={() => setTab("timetable")}
/>

    </>
  );
}

function WeeklyTimetable({ timetable }) {
  return (
    <Card title="📅 Weekly Timetable">
      {timetable.length === 0 ? (
        <p className="text-sm text-slate-500">No timetable published yet</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {timetable.map(day => (
            <div key={day._id} className="border rounded-xl p-3">
              <h4 className="font-semibold mb-2">{day.day}</h4>
              {day.periods.map((p, i) => (
                <div key={i} className="bg-slate-50 rounded-lg p-2 mb-2 text-sm">
                  <div className="font-medium">{p.subject}</div>
                  <div className="text-xs text-slate-500">
                    {p.startTime} – {p.endTime}
                  </div>
                  <div className="text-xs text-slate-600">
                    👨‍🏫 {p.teacherId?.name || "—"}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/* ================= UI ATOMS ================= */

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg text-sm mb-1
      ${active ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-100"}`}
    >
      {icon}
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

function Metric({ title, value }) {
  return (
    <div className="bg-white rounded-2xl border p-4">
      <p className="text-xs uppercase text-slate-500">{title}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className="font-medium">{value || "—"}</p>
    </div>
  );
}

function BlockedBanner({ student }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 text-sm">
      <AlertTriangle className="text-red-600" />
      <div>
        <p className="font-semibold text-red-700">
          Academic Status: {student.academicStatus.toUpperCase()}
        </p>
        <p className="text-red-600 text-xs">
          {student.statusReason || "Contact administration"}
        </p>
      </div>
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
        className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-100"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
}

function AttendanceCalendar({ month, data }) {
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const map = Object.fromEntries(data.map(d => [d.date, d.status]));

  return (
    <div className="grid grid-cols-7 gap-2 text-sm">
      {Array.from({ length: days }, (_, i) => {
        const day = i + 1;
        const date = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const status = map[date];

        return (
          <div
            key={day}
            className={`h-8 rounded-lg flex items-center justify-center
            ${status === "present" ? "bg-green-100 text-green-700" :
              status === "absent" ? "bg-red-100 text-red-700" :
              "bg-slate-100 text-slate-500"}`}
          >
            {day}
          </div>
        );
      })}
    </div>
  );
}

function formatDate(date) {
  return date ? new Date(date).toLocaleDateString("en-IN") : "—";
}
function WelcomeCard({ student }) {
  return (
    <section className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-2xl p-6">
      <h2 className="text-2xl font-semibold">{student.name}</h2>
      <p className="text-sm opacity-90">
        Admission No: {student.admissionNo} · Roll No: {student.rollNo || "—"}
      </p>
    </section>
  );
}
