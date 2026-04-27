import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../services/api";
import BackButton from "../../components/BackButton";

/* ================= ANIMATION ================= */
const fade = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } }
};

export default function TeacherAdminFinalExamView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD FINAL EXAM ================= */
  useEffect(() => {
    api
      .get(`/teacher/final-exams/${id}`) // ✅ teacher-safe endpoint
      .then(res => setExam(res.data))
      .catch(() => setExam(null))
      .finally(() => setLoading(false));
  }, [id]);

  /* ================= STATES ================= */
  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center text-gray-400">
        Loading final exam…
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="h-[70vh] flex items-center justify-center text-red-400">
        Final exam not found or access denied
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="text-white">

      {/* ================= HEADER ================= */}
      <motion.div variants={fade} initial="hidden" animate="show">
        <BackButton to="/teacher/exams/list" label="My Exams" />

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {exam.name}
            </h1>

            <p className="text-gray-400 mt-1 text-sm">
              Exam Code:{" "}
              <span className="text-gray-300">{exam.examCode}</span>
            </p>
          </div>

          <span className="px-3 py-1 rounded text-xs bg-slate-700 text-slate-200">
            ADMIN FINAL EXAM
          </span>
        </div>

        <p className="mt-4 text-sm text-slate-400 max-w-3xl">
          This is an authority-level examination created by administration.
          Teachers can only enter marks for assigned subjects and classes.
        </p>
      </motion.div>

      {/* ================= META ================= */}
      <motion.div
        variants={fade}
        initial="hidden"
        animate="show"
        className="grid md:grid-cols-3 gap-6 mt-10"
      >
        <Meta label="Status" value={exam.status} />
        <Meta
          label="Created On"
          value={new Date(exam.createdAt).toLocaleDateString()}
        />
        <Meta label="Assigned Schedules" value={exam.schedule.length} />
      </motion.div>

      {/* ================= SCHEDULE ================= */}
      <motion.div
        variants={fade}
        initial="hidden"
        animate="show"
        className="mt-12"
      >
        <h2 className="text-xl font-semibold mb-4">
          Examination Schedule (Your Assignment)
        </h2>

        <div className="overflow-hidden rounded-xl border border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left">Class</th>
                <th className="px-4 py-3">Section</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {exam.schedule.map((s, i) => (
                <tr
                  key={i}
                  className="border-t border-slate-800 hover:bg-slate-900/50"
                >
                  <td className="px-4 py-3">{s.className}</td>
                  <td className="px-4 py-3 text-center">{s.section}</td>
                  <td className="px-4 py-3 text-center">{s.subject}</td>
                  <td className="px-4 py-3 text-center">
                    {new Date(s.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {s.startTime} – {s.endTime}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {s.durationMinutes} min
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() =>
                        navigate(
                          `/teacher/final-exams/${exam._id}/marks?classId=${s.classId}&section=${s.section}&subject=${s.subject}`
                        )
                      }
                      className="px-3 py-1.5 text-xs rounded-md bg-slate-700 hover:bg-slate-600"
                    >
                      Enter Marks
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </motion.div>
    </div>
  );
}

/* ================= META CARD ================= */
function Meta({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-900 border border-slate-700 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-medium text-slate-200">
        {value}
      </p>
    </div>
  );
}
