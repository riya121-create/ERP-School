import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import api from "../../services/api"
import TeacherProfileDrawer from "./TeacherProfileDrawer"


/* ================= MOTION PRESETS ================= */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
}

const stagger = {
  show: {
    transition: { staggerChildren: 0.12 }
  }
}

export default function TeacherDashboard() {
  const navigate = useNavigate()

  const [teacher, setTeacher] = useState(null)
  const [showProfile, setShowProfile] = useState(false)

  const [stats, setStats] = useState({
    classes: 0,
    students: 0,
    attendanceToday: "—",
    lastAttendanceTime: null // ✅ ADDED (safe even if backend doesn’t send)
  })

  // ⏰ REAL TIME CLOCK — ✅ ADDED
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    api.get("/teacher/me").then(r => setTeacher(r.data))
    api.get("/teacher/dashboard-stats").then(r => setStats(r.data))
  }, [])

  // ⏰ CLOCK EFFECT — ✅ ADDED
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden text-white bg-[#0B1220]">

      {/* AMBIENT GLOWS */}
      <div className="absolute -top-40 -left-40 w-[28rem] h-[28rem] bg-blue-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-purple-500/20 rounded-full blur-[120px]" />

      <div className="relative z-10 px-10 py-12 max-w-[1400px] mx-auto">

        {/* ================= TOP BAR ================= */}
        <motion.header
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex items-center justify-between mb-16"
        >
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              {teacher ? `Good Morning, ${teacher.name}` : "Teacher Dashboard"}
            </h1>

            <p className="text-gray-400 mt-2 text-sm">
              Faculty Control Center · JN Public School
            </p>

            {/* DATE + TIME — ✅ ADDED */}
            <p className="text-gray-400 mt-2 text-sm">
              {now.toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
              })}
              {" · "}
              {now.toLocaleTimeString("en-IN")}
            </p>
          </div>

          <button
            onClick={() => setShowProfile(true)}
            className="
              px-6 py-2 rounded-xl text-sm
              bg-white/10 hover:bg-white/20
              backdrop-blur transition
            "
          >
            Profile
          </button>
        </motion.header>

        {/* ================= KPI STRIP ================= */}
       
        {/* ================= HERO KPI OVERVIEW ================= */}
 <motion.section
  variants={fadeUp}
  initial="hidden"
  animate="show"
  className="mb-20 flex justify-center"
>
  <div
    className="
      relative w-full max-w-4xl
      rounded-[2.5rem]
      p-10
      bg-[radial-gradient(120%_120%_at_10%_0%,rgba(56,189,248,0.12),transparent_45%),radial-gradient(120%_120%_at_90%_100%,rgba(168,85,247,0.12),transparent_45%)]
      bg-[#0B1220]/80
      border border-white/10
      backdrop-blur-2xl
      shadow-[0_30px_80px_rgba(0,0,0,0.45)]
      overflow-hidden
    "
  >
    {/* GRID OVERLAY */}
    <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:32px_32px]" />

    {/* HEADER */}
    <div className="relative flex items-start justify-between mb-10">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight text-white">
          Teaching Command Center
        </h3>
        <p className="text-sm text-gray-400 mt-1 max-w-md">
          Live overview of your classes, students and attendance health
        </p>
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs text-emerald-400 font-medium">
          Live
        </span>
      </div>
    </div>

    {/* KPI ROW */}
    <div className="relative grid grid-cols-3 gap-6">
      <AdvancedMetric
        label="Classes"
        value={stats.classes}
        accent="blue"
        hint="Assigned & teaching"
      />
      <AdvancedMetric
        label="Students"
        value={stats.students}
        accent="green"
        hint="Active enrollments"
      />
      <AdvancedMetric
        label="Attendance"
        value={stats.attendanceToday}
        accent="purple"
        small
        hint="Today’s status"
      />
    </div>

   {/* FOOTER CTA */}
<div className="relative mt-10 flex items-center justify-between gap-4">

  {/* LEFT: TIMETABLE */}
  <button
    onClick={() => navigate("/teacher/timetable")}
    className="
      group flex items-center gap-3
      px-6 py-3
      rounded-xl
      text-sm font-medium
      text-blue-300
      bg-white/5
      border border-white/10
      hover:bg-white/10
      transition-all
      backdrop-blur
    "
  >
    <span className="text-base">📅</span>
    View Timetable
    <span className="group-hover:translate-x-1 transition-transform">→</span>
  </button>

  {/* RIGHT: CLASSES */}
  <button
    onClick={() => navigate("/teacher/classes")}
    className="
      group flex items-center gap-3
      px-6 py-3
      rounded-xl
      text-sm font-medium
      text-white
      bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600
      bg-[length:200%_200%]
      hover:bg-[position:100%_50%]
      transition-all duration-500
      shadow-[0_10px_30px_rgba(37,99,235,0.35)]
    "
  >
    View Classes
    <span className="group-hover:translate-x-1 transition-transform">→</span>
  </button>

</div>

  </div>
</motion.section>





        {/* ================= ACTIONS ================= */}
        <motion.section
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mb-24"
        >
          <h2 className="text-xl font-semibold mb-8 tracking-wide">
            Quick Actions
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Action
              title="Mark Attendance"
              desc="Fast, secure daily attendance"
              onClick={() => navigate("/teacher/attendance")}
              gradient="from-blue-500 to-cyan-500"
            />
            <Action
              title="Manage Homework"
              desc="Create, assign & grade homework"
              onClick={() => navigate("/teacher/homework")}
              gradient="from-green-500 to-emerald-500"
            />
            <Action
              title="Upload Notes"
              desc="PDFs, slides & study materials"
              onClick={() => navigate("/teacher/notes")}
              gradient="from-purple-500 to-pink-500"
            />
            {/* ================= EXAM ================= */}
  <Action
    title="Exam Centre"
    desc="Create, manage & publish exams"
    onClick={() => navigate("/teacher/exams")}
    gradient="from-orange-500 to-red-500"
  />

  {/* ================= MARKS ================= */}
  <Action
    title="Enter Marks"
    desc="Marks entry & evaluation"
    onClick={() => navigate("/teacher/marks")}
    gradient="from-yellow-500 to-amber-500"
  />

  {/* ================= RESULT ================= */}
  <Action
    title="Publish Results"
    desc="Publish results to students & parents"
    onClick={() => navigate(`/teacher/publish-results/examId`)}
    gradient="from-teal-500 to-cyan-500"
  />
          </div>
        </motion.section>

      



        {/* ================= SIMPLE CALENDAR ================= */}
        {/* ✅ ADDED — no existing UI touched */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">
            Calendar
          </h2>

          <div className="grid grid-cols-7 gap-2 max-w-md">
            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
              <div
                key={day}
                className={`py-2 rounded-lg text-center text-sm
                  ${
                    day === now.getDate()
                      ? "bg-blue-600 text-white"
                      : "bg-white/10 text-gray-400"
                  }`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PROFILE DRAWER */}
      <TeacherProfileDrawer
        open={showProfile}
        onClose={() => setShowProfile(false)}
        teacher={teacher}
      />
    </div>
  )
}

/* ================= KPI ================= */
function KPI({ title, value, desc, color }) {
  const map = {
    blue: "from-blue-500/20 to-transparent text-blue-400",
    green: "from-green-500/20 to-transparent text-green-400",
    purple: "from-purple-500/20 to-transparent text-purple-400"
  }

  return (
    <motion.div
      variants={fadeUp}
      className={`
        rounded-3xl p-7
        bg-gradient-to-br ${map[color]}
        border border-white/10
        backdrop-blur-xl
        shadow-xl
      `}
    >
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-4xl font-bold mt-2">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{desc}</p>
    </motion.div>
  )
}

/* ================= ACTION ================= */
function Action({ title, desc, onClick, gradient }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -10, scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`
        cursor-pointer rounded-3xl p-7
        bg-gradient-to-r ${gradient}
        shadow-2xl
      `}
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-white/80 mt-2">{desc}</p>
      <p className="text-sm mt-5 font-medium">Open →</p>
    </motion.div>
  )
}
/* ================= CLASSES ================= */
function MyClasses({ onCountChange }) {

  const [classes, setClasses] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
  api.get("/teacher/classes").then(res => {
    setClasses(res.data)

    // 🔥 KPI sync fix
    if (onCountChange) {
      onCountChange(res.data.length)
    }
  })
}, [])


  if (!classes.length) {
    return <p className="text-gray-400 text-sm">No classes assigned yet.</p>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

      {/* LEFT: ASSIGNED CLASS */}
      <div className="lg:col-span-8 grid md:grid-cols-2 gap-8">
        {classes.map(cls => (
          <motion.div
            key={cls._id}
            whileHover={{ scale: 1.04 }}
            className="
              rounded-3xl p-6
              bg-white/5 border border-white/10
              backdrop-blur-xl shadow-xl
            "
          >
            <h3 className="text-lg font-semibold">
              Class {cls.name} – Section {cls.section}
            </h3>

            <p
  className={`text-xs mt-1 font-medium ${
    cls.role === "CLASS_TEACHER"
      ? "text-green-400"
      : "text-yellow-400"
  }`}
>
  {cls.role === "CLASS_TEACHER"
    ? "🏅 Class Teacher"
    : `📘 Subject Teacher (${cls.subject || "Subject"})`}

</p>

{cls.role === "CLASS_TEACHER" && (
  <button
    onClick={() => navigate(`/teacher/class/${cls.classId}`)}
    className="mt-6 px-4 py-2 text-sm rounded-xl bg-white/10 hover:bg-white/20 transition"
  >
    View Class →
  </button>
)}

          </motion.div>
        ))}
      </div>

      {/* RIGHT: TIMETABLE (OPTIONAL UX) */}
      <div
        className="
          lg:col-span-4
          rounded-3xl p-7
          bg-white/5
          border border-white/10
          backdrop-blur-xl
          shadow-2xl
          flex flex-col justify-between
        "
      >
        <h3 className="text-lg font-semibold text-white tracking-wide">
          📅 My Timetable
        </h3>

        <p className="text-sm text-gray-400 mt-2">
          View weekly teaching schedule
        </p>

        <button
          onClick={() => navigate("/teacher/timetable")}
          className="
            mt-6 w-full
            bg-blue-600 hover:bg-blue-700
            text-white font-semibold text-sm
            py-3 rounded-xl transition
          "
        >
          View Full Timetable →
        </button>
      </div>

    </div>
  )
}
function AdvancedMetric({ label, value, accent, hint, small }) {
  const accentMap = {
    blue: "text-blue-400",
    green: "text-emerald-400",
    purple: "text-purple-400"
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="
        relative rounded-2xl p-5
        bg-white/5
        border border-white/10
        backdrop-blur
        hover:bg-white/10
        transition-all
      "
    >
      <p className="text-xs text-gray-400">{label}</p>

      <p
        className={`
          mt-1 font-bold tracking-tight
          ${accentMap[accent]}
          ${small ? "text-xl" : "text-3xl"}
        `}
      >
        {value}
      </p>

      {hint && (
        <p className="text-[11px] text-gray-500 mt-1">
          {hint}
        </p>
      )}
    </motion.div>
  )
}
