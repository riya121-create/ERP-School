import { useEffect, useMemo, useState } from "react"
import api from "../../services/api"
import AttendanceCalendar from "./AttendanceCalendar"
import BackButton from "../../components/BackButton"

const OFFLINE_KEY = "arp_attendance_draft"

function MarkAttendance() {
  const [classes, setClasses] = useState([])
  const [classId, setClassId] = useState("")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))

  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [loading, setLoading] = useState(false)
  const [alreadyMarked, setAlreadyMarked] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  /* ===== Drawer State ===== */
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerDate, setDrawerDate] = useState(null)
  const [drawerData, setDrawerData] = useState([])

  /* ================= ONLINE / OFFLINE ================= */
  useEffect(() => {
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener("online", onOnline)
    window.addEventListener("offline", onOffline)
    return () => {
      window.removeEventListener("online", onOnline)
      window.removeEventListener("offline", onOffline)
    }
  }, [])

  /* ================= LOAD CLASSES ================= */
  useEffect(() => {
    api.get("/teacher/classes").then(res => {
      const onlyClassTeacher = res.data.filter(
        c => c.role === "CLASS_TEACHER"
      )
      setClasses(onlyClassTeacher)
    })
  }, [])

  /* ================= LOAD STUDENTS ================= */
  useEffect(() => {
    if (!classId) {
      setStudents([])
      setAttendance({})
      setAlreadyMarked(false)
      return
    }


    api.get(`/teacher/classes/${classId}/students`).then(res => {
      setStudents(res.data)
      const initial = {}
      res.data.forEach(s => (initial[s._id] = "present"))
      setAttendance(initial)
    })
  }, [classId])
/* ================= RESET DATE ON CLASS CHANGE ================= */
useEffect(() => {
  if (!classId) return
  setDate(new Date().toISOString().slice(0, 10))
    setAlreadyMarked(false) // ✅ ADD THIS
}, [classId])

  /* ================= LOAD EXISTING ATTENDANCE ================= */
  useEffect(() => {
    if (!classId || !date) return
    setAlreadyMarked(false)

    api.get(`/attendance/class/${classId}?date=${date}`).then(res => {
      if (!res.data || res.data.length === 0) return
      setAlreadyMarked(true)
      const map = {}
      res.data.forEach(r => (map[r.studentId._id] = r.status))
      setAttendance(prev => ({ ...prev, ...map }))
    })
  }, [classId, date])

  /* ================= OFFLINE RESTORE ================= */
  useEffect(() => {
    const raw = localStorage.getItem(OFFLINE_KEY)
    if (!raw) return
    const saved = JSON.parse(raw)
    if (saved.classId === classId && saved.date === date) {
      setAttendance(saved.attendance)
    }
  }, [classId, date])

  useEffect(() => {
  setDrawerOpen(false)
  setDrawerDate(null)
  setDrawerData([])
}, [classId])


  /* ================= LIVE COUNT ================= */
  const counts = useMemo(() => {
    let present = 0, absent = 0
    Object.values(attendance).forEach(v =>
      v === "present" ? present++ : absent++
    )
    return { present, absent }
  }, [attendance])

  /* ================= SUBMIT ================= */
  const submit = async () => {
    const records = Object.keys(attendance).map(id => ({
      studentId: id,
      status: attendance[id]
    }))

    if (!isOnline) {
      localStorage.setItem(
        OFFLINE_KEY,
        JSON.stringify({ classId, date, attendance })
      )
      alert("Offline: saved locally")
      return
    }

    try {
      setLoading(true)
      await api.post("/attendance/mark", { classId, date, records })
      localStorage.removeItem(OFFLINE_KEY)
      setAlreadyMarked(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="text-white">

      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-[#0B1220]/80 backdrop-blur border-b border-white/10 px-4 py-4 space-y-4">
        <div className="flex justify-between">
          <div className="flex items-center gap-3">
            <BackButton to="/teacher" label="Dashboard" />
            <h1 className="text-xl font-bold">Attendance</h1>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full ${
            isOnline ? "bg-green-600/20 text-green-400" : "bg-yellow-600/20 text-yellow-400"
          }`}>
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select
            value={classId}
            onChange={e => setClassId(e.target.value)}
            className="bg-white/5 rounded-xl p-3 text-sm"
          >
            <option value="">Select Class</option>
            {classes.map(c => (
              <option key={c._id} value={c._id}>
                {c.name} – {c.section}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={date}
            max={new Date().toISOString().slice(0, 10)}
            onChange={e => setDate(e.target.value)}
            className="bg-white/5 rounded-xl p-3 text-sm"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1 bg-green-600/15 rounded-xl p-2">
            <p className="text-xs">Present</p>
            <p className="text-lg font-bold">{counts.present}</p>
          </div>
          <div className="flex-1 bg-red-600/15 rounded-xl p-2">
            <p className="text-xs">Absent</p>
            <p className="text-lg font-bold">{counts.absent}</p>
          </div>
        </div>
      </div>

      {/* CALENDAR */}
      {classId && (
        <AttendanceCalendar
          classId={classId}
          activeDate={date}
      onSelectDate={(d) => {
  setDate(d)

  api.get(`/attendance/class/${classId}?date=${d}`)
    .then(res => {
      if (res.data && res.data.length > 0) {
        setDrawerDate(d)
        setDrawerOpen(true)
        setDrawerData(res.data)
      } else {
        alert("Attendance not marked for this date")
      }
    })
}}


        />
      )}

      {/* STUDENTS */}
     {!drawerOpen && (
  <div className="px-4 py-6 space-y-3 pb-32">

        {students.map(s => (
          <div key={s._id} className="bg-white/5 rounded-2xl p-4 flex justify-between">
            <div>
              <p className="font-semibold">{s.name}</p>
              <p className="text-xs text-white/40">Roll {s.rollNo || "—"}</p>
            </div>
            <div className="flex gap-2">
              <button
                disabled={alreadyMarked}
                onClick={() => setAttendance(p => ({ ...p, [s._id]: "present" }))}
                className={`px-4 py-2 rounded-xl ${
                  attendance[s._id] === "present" ? "bg-green-600" : "bg-white/10"
                }`}
              >P</button>
              <button
                disabled={alreadyMarked}
                onClick={() => setAttendance(p => ({ ...p, [s._id]: "absent" }))}
                className={`px-4 py-2 rounded-xl ${
                  attendance[s._id] === "absent" ? "bg-red-600" : "bg-white/10"
                }`}
              >A</button>
            </div>
          </div>
        ))}
      </div>
     )}
      {/* ACTION BAR */}
     {students.length > 0 && !drawerOpen && (

        <div className="fixed bottom-0 left-0 right-0 bg-[#0B1220]/90 p-4">
          <button
            onClick={submit}
            disabled={loading || alreadyMarked}
            className="w-full py-4 rounded-2xl bg-blue-600 font-bold"
          >
            {alreadyMarked ? "Attendance Locked" : loading ? "Saving..." : "Save Attendance"}
          </button>
        </div>
      )}

      {/* DRAWER */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50">
          <div className="absolute bottom-0 left-0 right-0 bg-[#0B1220] rounded-t-2xl p-4 max-h-[70vh] overflow-y-auto">
            <div className="flex justify-between mb-3">
              <h2 className="font-semibold">Attendance – {drawerDate}</h2>
              <button onClick={() => setDrawerOpen(false)}>✕</button>
            </div>

        <div className="space-y-3">
  {drawerData.map(r => {
    const present = r.status === "present"

    return (
      <div
        key={r._id}
        className={`
          flex items-center justify-between
          p-4 rounded-2xl
          transition-all active:scale-[0.98]
          ${present
            ? "bg-green-500/10 border border-green-500/30"
            : "bg-red-500/10 border border-red-500/30"}
        `}
      >
        {/* LEFT */}
        <div className="flex items-center gap-3">
          {/* STATUS DOT */}
          <div
            className={`
              w-3 h-3 rounded-full
              ${present ? "bg-green-400" : "bg-red-400"}
            `}
          />

          {/* NAME */}
          <div>
            <p className="font-semibold text-sm">
              {r.studentId.name}
            </p>
            <p className="text-[11px] text-white/40">
              Roll {r.studentId.rollNo || "—"}
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div
          className={`
            text-xs font-semibold px-3 py-1 rounded-full
            ${present
              ? "bg-green-500/20 text-green-300"
              : "bg-red-500/20 text-red-300"}
          `}
        >
          {present ? "Present" : "Absent"}
        </div>
      </div>
    )
  })}
</div>

          </div>
        </div>
      )}
    </div>
  )
}

export default MarkAttendance
