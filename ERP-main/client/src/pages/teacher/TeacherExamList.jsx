import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

/* ================= ANIMATION ================= */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" }
  }
};

/**
 * props:
 *  - status (optional)  -> "DRAFT" | "PUBLISHED"
 *  - mode (optional)    -> "performance"
 */
export default function TeacherExamList({ status, mode }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  /* ================= LOAD EXAMS ================= */
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");

Promise.all([
  api.get("/teacher/exams/my", {
    params: status ? { status } : {}
  }),
  api.get("/teacher/final-exams/my")
])
  .then(([teacherRes, finalRes]) => {
    if (!alive) return;

    const teacherExams = Array.isArray(teacherRes.data)
      ? teacherRes.data
      : [];

    const finalExams = Array.isArray(finalRes.data)
      ? finalRes.data.map(e => ({ ...e, examType: "FINAL" }))
      : [];

    setExams([...teacherExams, ...finalExams]);
  })
  .catch(err => {
    if (!alive) return;
    console.error("LOAD EXAMS ERROR:", err);
    setError(
      err.response?.data?.message || "Failed to load exams"
    );
  })
  .finally(() => {
    if (alive) setLoading(false);
  });


    return () => {
      alive = false;
    };
  }, [status]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center text-gray-400">
        Loading exams...
      </div>
    );
  }

  /* ================= ERROR ================= */
  if (error) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-center text-red-400">
        <p className="text-xl font-semibold mb-2">Something went wrong</p>
        <p className="text-sm opacity-80">{error}</p>
      </div>
    );
  }

  /* ================= EMPTY STATE ================= */
  if (exams.length === 0) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-center text-gray-400">
        <p className="text-2xl font-semibold mb-2">
          {mode === "performance" ? "No Performance Records" : "No Exams Found"}
        </p>

        <p className="text-sm mb-6 max-w-md">
          {mode === "performance"
            ? "Performance will appear once marks are evaluated."
            : "You haven’t created any exams yet."}
        </p>

        {mode !== "performance" && (
          <button
            onClick={() => navigate("/teacher/exams/create")}
            className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            Create Exam →
          </button>
        )}
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen px-10 py-10 text-white bg-[#0B1220]">
      {/* ================= HEADER ================= */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <h1 className="text-3xl font-bold">
          {mode === "performance"
            ? "Academic Performance Record"
            : status
            ? `${status} Exams`
            : "My Exams"}
        </h1>

        <p className="text-gray-400 mt-2">
  {mode === "performance"
    ? "Select an exam to view detailed performance analytics"
    : "Includes your exams and admin-controlled final examinations"}
</p>


      </motion.div>

      {/* ================= EXAM CARDS ================= */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="grid md:grid-cols-2 xl:grid-cols-3 gap-8 mt-12"
      >
        {exams.map(exam => {
          const completed = exam.marksStatus === "COMPLETED";
const isFinal = exam.examType === "FINAL";

          return (
            <motion.div
              key={exam._id}
              whileHover={{ y: -6 }}
              className={`
  rounded-2xl p-6 flex flex-col justify-between
  ${
    isFinal
      ? "bg-[#0F172A] border border-slate-600 shadow-[0_0_0_1px_rgba(148,163,184,0.15)]"
      : "bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl"
  }
`}

            >
              {/* INFO */}
              <div>
          <div className="flex items-center justify-between mb-4">
  <span
    className={`text-xs px-2 py-0.5 rounded font-medium ${
      isFinal
        ? "bg-slate-700 text-slate-200"
        : exam.status === "PUBLISHED"
        ? "bg-emerald-500/20 text-emerald-400"
        : "bg-yellow-500/20 text-yellow-400"
    }`}
  >
    {isFinal ? "ADMIN FINAL EXAM" : exam.status}
  </span>

  <span className="text-xs text-gray-500">
    {exam.date
      ? new Date(exam.date).toLocaleDateString()
      : "—"}
  </span>
</div>


                <h3 className="text-lg font-semibold">{exam.name}</h3>

              <p className="text-sm text-gray-400 mt-1">
  {isFinal ? "Authority Examination" : `Subject: ${exam.subject || "—"}`}
</p>


                <p className="text-xs text-gray-500 mt-2">
                  Max Marks: {exam.maxMarks} · Passing: {exam.passingMarks}
                </p>

                <p className="text-xs mt-1">
                  Marks:
                  <span
                    className={`ml-1 font-semibold ${
                      completed ? "text-emerald-400" : "text-yellow-400"
                    }`}
                  >
                    {exam.marksStatus || "PENDING"}
                  </span>
                </p>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3 mt-6">
                {mode !== "performance" && (
              <button
  onClick={() => {
    if (isFinal) {
      navigate(`/teacher/final-exams/view/${exam._id}`);
    } else {
      navigate(`/teacher/exams/view/${exam._id}`);
    }
  }}
  className={`
    flex-1 py-2 rounded-lg text-sm font-medium
    ${
      isFinal
        ? "bg-slate-800 hover:bg-slate-700 border border-slate-600"
        : "bg-white/10 hover:bg-white/20"
    }
  `}
>
  View
</button>

                )}

                {mode !== "performance" && !isFinal && exam.status === "DRAFT" && (

                  <button
                    onClick={() =>
                      navigate(`/teacher/exams/edit/${exam._id}`)
                    }
                    className="flex-1 py-2 rounded-xl text-sm bg-blue-600 hover:bg-blue-700 transition"
                  >
                    Edit
                  </button>
                )}

                {mode === "performance" && (
                  <button
                    disabled={!completed}
                    onClick={() =>
                      navigate(`/teacher/exams/performance/${exam._id}`)
                    }
                    className={`flex-1 py-2 rounded-xl text-sm transition ${
                      completed
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-white/10 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    View Performance →
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
