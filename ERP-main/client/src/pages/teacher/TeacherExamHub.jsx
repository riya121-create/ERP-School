import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import BackButton from "../../components/BackButton"

export default function TeacherExamHub() {
  const navigate = useNavigate()

  return (
    <div className="text-white">
      <BackButton to="/teacher" label="Dashboard" />
      <h1 className="text-3xl font-extrabold mb-12 tracking-tight">
        Exam Center
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">

        <Card
          title="Create New Exam"
          desc="Schedule a new test or exam"
          onClick={() => navigate("/teacher/exams/create")}
          gradient="from-orange-500 to-red-500"
        />

        <Card
          title="My Exams"
          desc="All exams created by you"
          onClick={() => navigate("/teacher/exams/list")}
          gradient="from-blue-500 to-cyan-500"
        />

        <Card
          title="Draft Exams"
          desc="Saved but not published"
          onClick={() => navigate("/teacher/exams/drafts")}
          gradient="from-purple-500 to-pink-500"
        />

 <Card
  title="Academic Performance Record"
  desc="Detailed exam-wise performance analysis"
  onClick={() => navigate("/teacher/exams/performance")} 
  gradient="from-green-500 to-emerald-500"
/>




      </div>
    </div>
  )
}

/* ================= CARD ================= */
function Card({ title, desc, onClick, gradient }) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`
        cursor-pointer rounded-3xl p-7
        bg-gradient-to-r ${gradient}
        shadow-2xl
      `}
    >
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-sm text-white/80 mt-2">{desc}</p>
      <p className="text-sm mt-6 font-medium">Open →</p>
    </motion.div>
  )
}
