import { useEffect, useMemo, useState, useRef } from "react";
import api from "../../services/api";
import {
  Home, ClipboardList, User, LogOut, AlertTriangle, CalendarDays,
  ChevronUp, KeyRound, BookOpen, FileText, Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import StudentHomework from "./StudentHomework";
import StudentNotes from "./StudentNotes";
import StudentExamSchedule from "./StudentExamSchedule";

/* =====================================================
   STUDENT DASHBOARD — dark theme matching Teacher UI
===================================================== */

const DAY_MAP = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

export default function StudentDashboard() {
  const [student,    setStudent]    = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [timetable,  setTimetable]  = useState([]);
  const [results,    setResults]    = useState(null);
  const [fees,       setFees]       = useState(null);
  const [tab,        setTab]        = useState("dashboard");
  const [collapsed,  setCollapsed]  = useState(false);
  const [isMobile,   setIsMobile]   = useState(window.innerWidth < 768);

  const todayName      = DAY_MAP[new Date().getDay()];
  const todayTimetable = timetable.find(d => d.day === todayName);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setCollapsed(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    Promise.all([
      api.get("/student/me"),
      api.get("/attendance/my"),
      api.get("/timetable/student"),
    ]).then(([s, a, t]) => {
      setStudent(s.data);
      setAttendance(a.data);
      setTimetable(t.data);
    });

    // Load results & fees in background (non-blocking)
    api.get("/student/results").then(r => setResults(r.data)).catch(() => {});
    api.get("/student/fees").then(r => setFees(r.data)).catch(() => {});
  }, []);

  const now   = new Date();
  const monthKey = now.toISOString().slice(0, 7);
  const monthAttendance = attendance.filter(a => a.date.startsWith(monthKey));

  const stats = useMemo(() => {
    const total   = monthAttendance.length;
    const present = monthAttendance.filter(a => a.status === "present").length;
    return { total, present, absent: total - present,
             percent: total ? Math.round((present / total) * 100) : 0 };
  }, [monthAttendance]);

  if (!student) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-gray-400 text-sm">
        Loading…
      </div>
    );
  }

  const academicBlocked = student.academicStatus !== "active";

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex">

      {/* ── SIDEBAR ── */}
      <StudentSidebar
        student={student}
        tab={tab}
        setTab={setTab}
        collapsed={collapsed}
        isMobile={isMobile}
        onToggle={() => setCollapsed(c => !c)}
      />

      {/* ── MAIN ── */}
      <main
        className={`flex-1 min-h-screen p-6 md:p-8 overflow-y-auto transition-all duration-300
          ${collapsed ? "md:ml-20" : "md:ml-72"}`}
      >
        {academicBlocked && <BlockedBanner student={student} />}

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <div className="space-y-6">
            <WelcomeCard student={student} />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Metric title="Attendance %" value={`${stats.percent}%`} accent="indigo" />
              <Metric title="Present"       value={stats.present}      accent="emerald" />
              <Metric title="Absent"        value={stats.absent}       accent="rose" />
              <Metric title="Total"         value={stats.total}        accent="amber" />
            </div>

            <DarkCard title={`📅 Today (${todayName})`}>
              {!todayTimetable || todayTimetable.periods.length === 0 ? (
                <p className="text-sm text-gray-500">No classes scheduled for today 🎉</p>
              ) : (
                <div className="space-y-3">
                  {todayTimetable.periods.map((p, i) => (
                    <div key={i} className="bg-white/[0.04] rounded-xl p-3 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-200">{p.subject}</p>
                        <p className="text-xs text-gray-500">{p.startTime} – {p.endTime}</p>
                      </div>
                      <p className="text-xs text-gray-500">👨‍🏫 {p.teacherId?.name || "—"}</p>
                    </div>
                  ))}
                </div>
              )}
            </DarkCard>
          </div>
        )}

        {/* ATTENDANCE */}
        {tab === "attendance" && (
          <div className="space-y-6">
            <DarkCard title="Monthly Attendance">
              <AttendanceCalendar month={now} data={monthAttendance} />
            </DarkCard>
            <DarkCard title="History">
              {monthAttendance.length === 0 ? (
                <p className="text-sm text-gray-500">No records this month.</p>
              ) : (
                monthAttendance.slice().reverse().map((a, i) => (
                  <div key={i} className="flex justify-between py-2.5 text-sm border-b border-white/[0.06] last:border-0">
                    <span className="text-gray-400">{formatDate(a.date)}</span>
                    <span className={a.status === "present" ? "text-emerald-400 font-medium" : "text-rose-400 font-medium"}>
                      {a.status.toUpperCase()}
                    </span>
                  </div>
                ))
              )}
            </DarkCard>
          </div>
        )}

        {/* TIMETABLE */}
        {tab === "timetable" && (
          <DarkCard title="📅 Weekly Timetable">
            {timetable.length === 0 ? (
              <p className="text-sm text-gray-500">No timetable published yet.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {timetable.map(day => (
                  <div key={day._id} className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4">
                    <h4 className="font-semibold text-gray-200 mb-3">{day.day}</h4>
                    {day.periods.map((p, i) => (
                      <div key={i} className="bg-white/[0.04] rounded-lg p-2.5 mb-2 text-sm">
                        <p className="font-medium text-gray-200">{p.subject}</p>
                        <p className="text-xs text-gray-500">{p.startTime} – {p.endTime}</p>
                        <p className="text-xs text-gray-600">👨‍🏫 {p.teacherId?.name || "—"}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </DarkCard>
        )}

        {/* EXAM SCHEDULE */}
        {tab === "exams" && <StudentExamSchedule />}

        {/* HOMEWORK */}
        {tab === "homework" && <StudentHomework />}

        {/* STUDY NOTES */}
        {tab === "notes" && <StudentNotes />}

        {/* RESULTS */}
        {tab === "results" && (
          <div className="space-y-6">
            {!results ? (
              <DarkCard title="🎓 My Results">
                <p className="text-sm text-gray-500">Loading results…</p>
              </DarkCard>
            ) : Object.keys(results.exams || {}).length === 0 ? (
              <DarkCard title="🎓 My Results">
                <p className="text-sm text-gray-500">No published results yet.</p>
              </DarkCard>
            ) : (
              <>
                {/* Overall Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Metric title="Total Marks"   value={results.summary.totalMarks}    accent="indigo" />
                  <Metric title="Max Marks"     value={results.summary.totalMaxMarks} accent="amber" />
                  <Metric title="Overall %"     value={`${results.summary.overallPercent}%`} accent="emerald" />
                  <Metric title="Result"        value={results.summary.overallResult}
                    accent={results.summary.overallResult === "PASS" ? "emerald" : "rose"} />
                </div>

                {/* Exam Groups */}
                {Object.entries(results.exams).map(([type, list]) => (
                  <DarkCard key={type} title={`📋 ${type} Exams`}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-[10px] uppercase tracking-widest text-gray-600 border-b border-white/[0.06]">
                            <th className="text-left pb-3 pr-4">Exam</th>
                            <th className="text-left pb-3 pr-4">Subject</th>
                            <th className="text-center pb-3 pr-4">Marks</th>
                            <th className="text-center pb-3 pr-4">Max</th>
                            <th className="text-center pb-3 pr-4">%</th>
                            <th className="text-center pb-3">Result</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                          {list.map((r, i) => (
                            <tr key={i} className="text-gray-300">
                              <td className="py-3 pr-4 font-medium">{r.name}</td>
                              <td className="py-3 pr-4 text-gray-400">{r.subject}</td>
                              <td className="py-3 pr-4 text-center font-semibold">
                                <span className={r.marks === "AB" ? "text-amber-400" : "text-white"}>{r.marks}</span>
                              </td>
                              <td className="py-3 pr-4 text-center text-gray-500">{r.maxMarks}</td>
                              <td className="py-3 pr-4 text-center">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                                  ${r.percentage >= 75 ? "bg-emerald-500/20 text-emerald-400" :
                                    r.percentage >= 33 ? "bg-amber-500/20 text-amber-400" :
                                    "bg-rose-500/20 text-rose-400"}`}>
                                  {r.percentage}%
                                </span>
                              </td>
                              <td className="py-3 text-center">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                                  ${r.result === "PASS" || r.result === "PRESENT"
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : r.result === "AB" || r.result === "ABSENT"
                                    ? "bg-amber-500/20 text-amber-400"
                                    : "bg-rose-500/20 text-rose-400"}`}>
                                  {r.result || "—"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </DarkCard>
                ))}
              </>
            )}
          </div>
        )}

        {/* FEES */}
        {tab === "fees" && (
          <div className="space-y-6">
            {!fees ? (
              <DarkCard title="💰 Fee Summary">
                <p className="text-sm text-gray-500">Loading fee details…</p>
              </DarkCard>
            ) : (
              <>
                {/* Fee Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Metric title="Monthly Tuition"  value={`₹${fees.tuition?.monthly?.toLocaleString() || 0}`}  accent="indigo" />
                  <Metric title="Annual Tuition"   value={`₹${fees.tuition?.annual?.toLocaleString()  || 0}`}  accent="amber" />
                  <Metric title="Total Monthly"    value={`₹${fees.total?.monthly?.toLocaleString()   || 0}`}  accent="emerald" />
                </div>

                {/* Fee Breakdown */}
                <DarkCard title="📋 Fee Breakdown">
                  <div className="space-y-3">
                    {(fees.components || []).map((c, i) => (
                      <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/[0.06] last:border-0">
                        <div>
                          <p className="text-sm font-medium text-gray-200">{c.name}</p>
                          <p className="text-xs text-gray-600">{c.frequency}{c.optional ? " · Optional" : ""}{c.refundable ? " · Refundable" : ""}</p>
                        </div>
                        <p className="text-sm font-semibold text-indigo-400">₹{c.amount?.toLocaleString()}</p>
                      </div>
                    ))}
                    {(fees.components || []).length === 0 && (
                      <p className="text-sm text-gray-500">No fee components configured.</p>
                    )}
                  </div>
                </DarkCard>

                {/* Transport Fee */}
                {fees.transport?.enabled && (
                  <DarkCard title="🚌 Transport Fee">
                    <div className="grid md:grid-cols-2 gap-4">
                      <Info label="Mode"          value={fees.transport.mode} />
                      {fees.transport.stopName  && <Info label="Stop"         value={fees.transport.stopName} />}
                      {fees.transport.vehicleNo && <Info label="Vehicle No"   value={fees.transport.vehicleNo} />}
                      {fees.transport.routeName && <Info label="Route"        value={fees.transport.routeName} />}
                      {fees.transport.pickupTime && <Info label="Pickup Time" value={fees.transport.pickupTime} />}
                      <Info label="Monthly Fee"   value={`₹${fees.transport.monthly?.toLocaleString()}`} />
                      <Info label="Annual Fee"    value={`₹${fees.transport.annual?.toLocaleString()}`} />
                    </div>
                  </DarkCard>
                )}
              </>
            )}
          </div>
        )}

        {/* TRANSPORT */}
        {tab === "transport" && (
          <DarkCard title="🚌 My Transport Details">
            {!student?.transport ? (
              <p className="text-sm text-gray-500">No transport assigned.</p>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                <Info label="Vehicle No"   value={student.transport.vehicle?.vehicleNo} />
                <Info label="Vehicle Type" value={student.transport.vehicle?.vehicleType} />
                <Info label="Route"        value={student.transport.routeName} />
                <Info label="Stop"         value={student.transport.stopName} />
              </div>
            )}
          </DarkCard>
        )}

        {/* PROFILE */}
        {tab === "profile" && (
          <DarkCard title="Student Profile">
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <Info label="Name"    value={student.name} />
              <Info label="Gender"  value={student.gender} />
              <Info label="DOB"     value={formatDate(student.dob)} />
              <Info label="Parent"  value={student.parentName} />
              <Info label="Phone"   value={student.parentPhone} />
              <Info label="Address" value={student.address} />
              <Info label="Status"  value={student.academicStatus} />
            </div>
          </DarkCard>
        )}
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#111111] border-t border-white/[0.06] flex justify-around py-3 z-50">
        {[
          { id: "dashboard",  icon: <Home size={20} /> },
          { id: "attendance", icon: <ClipboardList size={20} /> },
          { id: "timetable",  icon: <CalendarDays size={20} /> },
          { id: "exams",      icon: <Calendar size={20} /> },
          { id: "results",    icon: <BookOpen size={20} /> },
          { id: "homework",   icon: <FileText size={20} /> },
          { id: "profile",    icon: <User size={20} /> },
        ].map(({ id, icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`transition ${tab === id ? "text-indigo-400" : "text-gray-600 hover:text-gray-400"}`}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  );
}

/* =====================================================
   SIDEBAR
===================================================== */
function StudentSidebar({ student, tab, setTab, collapsed, isMobile, onToggle }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate   = useNavigate();

  useEffect(() => {
    const handler = e => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  const navItems = [
    { id: "dashboard",  label: "Dashboard",     icon: "📊" },
    { id: "attendance", label: "Attendance",    icon: "🕒" },
    { id: "timetable",  label: "Timetable",     icon: "📅" },
    { id: "exams",      label: "Exam Schedule", icon: "📝" },
    { id: "results",    label: "Results",       icon: "🎓" },
    { id: "homework",   label: "Homework",      icon: "📚" },
    { id: "notes",      label: "Study Notes",   icon: "📁" },
    { id: "fees",       label: "Fees",          icon: "💰" },
    { id: "transport",  label: "Transport",     icon: "🚌" },
    { id: "profile",    label: "Profile",       icon: "👤" },
  ];

  const initials = student.name?.charAt(0).toUpperCase() || "S";

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 flex flex-col
        bg-[#111111] border-r border-white/[0.06]
        transition-all duration-300 ease-in-out
        ${collapsed
          ? isMobile ? "-translate-x-full" : "w-20"
          : "w-72 translate-x-0"
        }
      `}
    >
      {/* BRAND */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-white/[0.06]">
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-indigo-500/30 border border-indigo-500/40 flex items-center justify-center text-sm font-bold text-indigo-300 flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate leading-tight">{student.name}</p>
              <p className="text-[10px] text-gray-600 truncate">
                {student.class ? `Class ${student.class.name}-${student.class.section}` : "Student"}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="text-gray-500 hover:text-white transition p-1.5 rounded-lg hover:bg-white/10 flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* NAV */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-5">
        <div>
          {!collapsed && (
            <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest text-gray-600 uppercase">
              Navigation
            </p>
          )}
          <div className="space-y-0.5">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`
                  group relative flex items-center gap-3
                  w-full px-3 py-2.5 rounded-xl text-sm transition-all
                  ${tab === item.id
                    ? "bg-indigo-500/15 text-indigo-400 font-semibold"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.06]"
                  }
                  ${collapsed ? "justify-center" : ""}
                `}
              >
                <span className="text-base">{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* FOOTER — PROFILE */}
      <div className="px-3 py-3 border-t border-white/[0.06]" ref={profileRef}>
        {profileOpen && !collapsed && (
          <div className="mb-2 rounded-xl border border-white/10 bg-[#1a1a1a] overflow-hidden shadow-2xl">
            <button
              onClick={() => { setProfileOpen(false); setTab("profile"); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/[0.06] hover:text-white transition"
            >
              <User size={14} className="text-indigo-400" /> Profile
            </button>
            <button
              onClick={() => { setProfileOpen(false); navigate("/change-password"); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/[0.06] hover:text-white transition"
            >
              <KeyRound size={14} className="text-amber-400" /> Change Password
            </button>
            <div className="border-t border-white/[0.06]" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
            >
              <LogOut size={14} /> Log out
            </button>
          </div>
        )}

        <button
          onClick={() => !collapsed && setProfileOpen(o => !o)}
          className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/[0.06] transition ${collapsed ? "justify-center" : ""}`}
        >
          <div className="w-8 h-8 rounded-full bg-indigo-500/30 border border-indigo-500/40 flex items-center justify-center text-sm font-bold text-indigo-300 flex-shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs font-semibold text-gray-200 truncate">{student.name}</p>
                <p className="text-[11px] text-gray-600 truncate">
                  {student.class ? `Class ${student.class.name}-${student.class.section}` : "Student"}
                </p>
              </div>
              <ChevronUp size={14} className={`text-gray-600 transition-transform flex-shrink-0 ${profileOpen ? "" : "rotate-180"}`} />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

/* =====================================================
   UI ATOMS
===================================================== */

function WelcomeCard({ student }) {
  return (
    <section className="bg-gradient-to-r from-indigo-600/90 to-indigo-500/80 rounded-2xl p-6 border border-indigo-500/30">
      <h2 className="text-2xl font-bold text-white">{student.name}</h2>
      <p className="text-sm text-indigo-200 mt-1">
        Admission No: {student.admissionNo} · Roll No: {student.rollNo || "—"}
      </p>
    </section>
  );
}

function Metric({ title, value, accent }) {
  const colors = {
    indigo:  "text-indigo-400",
    emerald: "text-emerald-400",
    rose:    "text-rose-400",
    amber:   "text-amber-400",
  };
  return (
    <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-4">
      <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">{title}</p>
      <p className={`text-2xl font-bold ${colors[accent] || "text-white"}`}>{value}</p>
    </div>
  );
}

function DarkCard({ title, children }) {
  return (
    <section className="bg-[#111111] border border-white/[0.08] rounded-2xl p-5 md:p-6">
      <h2 className="text-base font-semibold text-gray-200 mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-200">{value || "—"}</p>
    </div>
  );
}

function BlockedBanner({ student }) {
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3 text-sm mb-6">
      <AlertTriangle className="text-red-400 flex-shrink-0" size={18} />
      <div>
        <p className="font-semibold text-red-400">
          Academic Status: {student.academicStatus.toUpperCase()}
        </p>
        <p className="text-red-500/80 text-xs mt-0.5">
          {student.statusReason || "Contact administration"}
        </p>
      </div>
    </div>
  );
}

function AttendanceCalendar({ month, data }) {
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const map  = Object.fromEntries(data.map(d => [d.date, d.status]));

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

function formatDate(date) {
  return date ? new Date(date).toLocaleDateString("en-IN") : "—";
}
