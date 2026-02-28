import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import api from "../../services/api"

/* ================= ANIMATIONS ================= */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } }
}

export default function TeacherExamView() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [exam, setExam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  /* ================= LOAD EXAM ================= */
  useEffect(() => {
    let alive = true
    setLoading(true)
    setError("")

    api
      // ✅ BACKEND CORRECT ROUTE
      .get(`/teacher/view/${id}`)
      .then(res => {
        if (!alive) return
        setExam(res.data.exam || null)
      })
      .catch(err => {
        if (!alive) return
        console.error("LOAD EXAM ERROR:", err)
        setError(
          err.response?.data?.message || "Failed to load exam"
        )
      })
      .finally(() => alive && setLoading(false))

    return () => {
      alive = false
    }
  }, [id])

  /* ================= STATES ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1220] text-gray-400">
        Loading exam details...
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1220] text-red-400">
        {error}
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1220] text-red-400">
        Exam not found
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-white px-10 py-10">

      {/* ================= HEADER ================= */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{exam.name}</h1>
            <p className="text-gray-400 mt-1">
              {exam.subject || "—"} · {exam.type || "—"} · {exam.mode || "—"}
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
          >
            ← Back
          </button>
        </div>
      </motion.div>

      {/* ================= STATUS BAR ================= */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="mt-8 flex flex-wrap gap-4"
      >
        <StatusBadge
          label="Exam Status"
          value={exam.status}
          color={exam.status === "PUBLISHED" ? "green" : "yellow"}
        />

        <StatusBadge
          label="Marks Status"
          value={exam.marksStatus || "PENDING"}
          color={exam.marksStatus === "COMPLETED" ? "green" : "yellow"}
        />

        <StatusBadge
          label="Date"
          value={new Date(exam.date).toLocaleDateString()}
          color="blue"
        />

        <StatusBadge
          label="Time"
          value={`${exam.startTime || "--"} – ${exam.endTime || "--"}`}
          color="purple"
        />
      </motion.div>

      {/* ================= GRID ================= */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-10"
      >

        {/* ================= LEFT ================= */}
        <div className="xl:col-span-2 space-y-8">

          {/* ===== MARKS INFO ===== */}
          <Card title="Marks Information">
            <InfoRow label="Maximum Marks" value={exam.maxMarks} />
            <InfoRow label="Passing Marks" value={exam.passingMarks} />
          </Card>

          {/* ===== CLASSES ===== */}
          <Card title="Exam For Classes">
            <div className="flex flex-wrap gap-2">
              {exam.classes?.map((c, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-xs bg-white/10"
                >
                  Class {c.classId?.name}
                  {c.section && ` (${c.section})`}
                </span>
              ))}
            </div>
          </Card>

          {/* ===== SYLLABUS ===== */}
          <Card title="Syllabus">
            {!exam.syllabus || exam.syllabus.length === 0 && (
              <p className="text-gray-400 text-sm">
                No syllabus defined
              </p>
            )}

            {exam.syllabus?.map((s, i) => (
              <div key={i} className="mb-4">
                <p className="font-semibold">{s.chapter}</p>
                <ul className="list-disc ml-6 text-sm text-gray-300">
                  {s.topics?.map((t, j) => (
                    <li key={j}>{t}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Card>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="space-y-8">

          {/* ===== RULES ===== */}
          <Card title="Exam Rules">
            <Rule label="Absent Allowed" value={exam.rules?.allowAbsent} />
            <Rule label="Auto Grading" value={exam.rules?.autoGrade} />
            <Rule label="Lock After Publish" value={exam.rules?.lockAfterPublish} />
            <Rule label="Re-evaluation" value={exam.rules?.reEvaluation} />
            <Rule label="Grace Marks" value={exam.rules?.graceMarks} />
          </Card>

          {/* ===== ACTIONS ===== */}
          <Card title="Actions">
            <button
              onClick={() =>
                 navigate(`/teacher/exams/${exam._id}/marks`)
              }
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 transition"
            >
              Enter Marks
            </button>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}

/* ================= REUSABLE UI ================= */

function Card({ title, children }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {children}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm py-1">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function StatusBadge({ label, value, color }) {
  const colors = {
    green: "text-emerald-400 bg-emerald-500/20",
    yellow: "text-yellow-400 bg-yellow-500/20",
    blue: "text-blue-400 bg-blue-500/20",
    purple: "text-purple-400 bg-purple-500/20"
  }

  return (
    <div className={`px-4 py-2 rounded-xl text-sm ${colors[color]}`}>
      <span className="opacity-70 mr-1">{label}:</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

function Rule({ label, value }) {
  return (
    <div className="flex justify-between text-sm py-1">
      <span className="text-gray-400">{label}</span>
      <span className={value ? "text-emerald-400" : "text-red-400"}>
        {value ? "Yes" : "No"}
      </span>
    </div>
  )
}
