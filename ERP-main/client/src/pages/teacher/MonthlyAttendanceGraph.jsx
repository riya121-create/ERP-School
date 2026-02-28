import { useEffect, useState } from "react"
import api from "../../services/api"

function MonthlyAttendanceGraph({ classId }) {
  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!classId) return

    setLoading(true)
    api
      .get(`/attendance/monthly-summary/${classId}?month=${month}`)
      .then(res => setData(res.data))
      .finally(() => setLoading(false))
  }, [classId, month])

  if (!classId) return null

  return (
    <div className="px-4 mt-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white/80">
          Monthly Attendance %
        </h3>

        <input
          type="month"
          value={month}
          max={new Date().toISOString().slice(0, 7)}
          onChange={e => setMonth(e.target.value)}
          className="bg-white/10 text-xs px-2 py-1 rounded-lg"
        />
      </div>

      {/* CONTENT */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        {loading && (
          <p className="text-xs text-white/50">Loading...</p>
        )}

        {!loading && data && (
          <>
            {/* PERCENTAGE */}
            <div className="flex items-end gap-4">
              <div className="text-4xl font-bold text-green-400">
                {data.percentage}%
              </div>
              <div className="text-xs text-white/50 mb-1">
                Attendance
              </div>
            </div>

            {/* BAR GRAPH */}
            <div className="mt-4 space-y-2">
              {/* PRESENT */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-green-300">Present</span>
                  <span>{data.presentDays} days</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{
                      width: `${(data.presentDays / data.totalDays) * 100}%`
                    }}
                  />
                </div>
              </div>

              {/* ABSENT */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-red-300">Absent</span>
                  <span>{data.absentDays} days</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500"
                    style={{
                      width: `${(data.absentDays / data.totalDays) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="text-xs text-white/40 mt-3">
              Total Working Days: {data.totalDays}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MonthlyAttendanceGraph
