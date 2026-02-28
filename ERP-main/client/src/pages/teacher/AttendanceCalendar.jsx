import { useEffect, useMemo, useState } from "react"
import api from "../../services/api"

const OFFLINE_KEY = "arp_attendance_draft"

function AttendanceCalendar({ classId, activeDate, onSelectDate }) {
  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )
  const [markedDates, setMarkedDates] = useState([])

  const today = new Date().toISOString().slice(0, 10)

  /* ================= LOAD MONTH DATA ================= */
  useEffect(() => {
    if (!classId) return
    api
      .get(`/attendance/calendar/${classId}?month=${month}`)
      .then(res => setMarkedDates(res.data.markedDates || []))
      .catch(() => setMarkedDates([]))
  }, [classId, month])

  /* ================= OFFLINE DRAFT ================= */
  const offlineDraft = useMemo(() => {
    try {
      const raw = localStorage.getItem(OFFLINE_KEY)
      if (!raw) return null
      const saved = JSON.parse(raw)
      return saved.classId === classId ? saved.date : null
    } catch {
      return null
    }
  }, [classId])

  /* ================= DATE UTILS ================= */
  const daysInMonth = new Date(
    Number(month.split("-")[0]),
    Number(month.split("-")[1]),
    0
  ).getDate()

  const firstDay = new Date(month + "-01").getDay()

  const monthLabel = new Date(month + "-01").toLocaleString("en-US", {
    month: "long",
    year: "numeric"
  })

  const isFuture = d => d > today
  const isMarked = d => markedDates.includes(d)
  const isOffline = d => d === offlineDraft

  /* ================= MONTH % ================= */
  const percent = Math.round(
    (markedDates.filter(d => d.startsWith(month)).length / daysInMonth) * 100
  )

  /* ================= CELLS ================= */
  const cells = useMemo(() => {
    return [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) =>
        `${month}-${String(i + 1).padStart(2, "0")}`
      )
    ]
  }, [month, daysInMonth, firstDay])

  return (
    <div className="px-4 mt-6">

      {/* GLASS CARD */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 shadow-xl">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              const d = new Date(month + "-01")
              d.setMonth(d.getMonth() - 1)
              setMonth(d.toISOString().slice(0, 7))
            }}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center active:scale-95"
          >
            ◀
          </button>

          <div className="text-sm font-semibold tracking-wide">
            {monthLabel}
          </div>

          <button
            disabled={month >= today.slice(0, 7)}
            onClick={() => {
              const d = new Date(month + "-01")
              d.setMonth(d.getMonth() + 1)
              setMonth(d.toISOString().slice(0, 7))
            }}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center disabled:opacity-30 active:scale-95"
          >
            ▶
          </button>
        </div>

        {/* PROGRESS */}
        <div className="mb-5">
          <div className="flex justify-between text-[11px] text-white/60 mb-1">
            <span>Monthly Attendance</span>
            <span className="font-semibold text-green-400">{percent}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* WEEK */}
        <div className="grid grid-cols-7 text-center text-[11px] text-white/40 mb-2">
          {["S", "M", "T", "W", "T", "F", "S"].map(d => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* CALENDAR */}
        <div className="grid grid-cols-7 gap-2">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />

            const future = isFuture(day)
            const marked = isMarked(day)
            const selected = activeDate === day
            const offline = isOffline(day)

            return (
              <button
                key={day}
                disabled={future}
                onClick={() => onSelectDate?.(day)}
                className={`
                  relative h-11 rounded-2xl text-xs font-medium
                  flex items-center justify-center
                  transition-all active:scale-95
                  ${future && "bg-white/5 text-white/20"}
                  ${marked && "bg-green-600/25 text-green-300"}
                  ${!marked && !future && "bg-red-600/20 text-red-300"}
                  ${selected && "ring-2 ring-blue-500"}
                `}
              >
                {day.slice(-2)}

                {offline && (
                  <span className="absolute bottom-1 right-1 w-2 h-2 bg-yellow-400 rounded-full" />
                )}
              </button>
            )
          })}
        </div>

        {/* LEGEND */}
        <div className="flex flex-wrap gap-3 text-[11px] text-white/50 mt-5">
          <Legend color="bg-green-500" label="Marked" />
          <Legend color="bg-red-500" label="Missed" />
          <Legend color="bg-yellow-400" label="Offline" />
          <Legend color="bg-white/30" label="Future" />
        </div>
      </div>
    </div>
  )
}

/* ===== MINI COMPONENT ===== */
function Legend({ color, label }) {
  return (
    <span className="flex items-center gap-1">
      <span className={`w-3 h-3 rounded-full ${color}`} />
      {label}
    </span>
  )
}

export default AttendanceCalendar
