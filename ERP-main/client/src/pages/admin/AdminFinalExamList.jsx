import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function AdminFinalExamList() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, []);

  /* ================= FETCH ================= */
  const fetchExams = async () => {
    try {
      const res = await api.get("/admin/exams/final");
      setExams(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("FETCH FINAL EXAMS ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= PUBLISH ================= */
  const publishExam = async (examId) => {
    if (
      !window.confirm(
        "Publish this final exam?\nTeachers will see it after publishing."
      )
    )
      return;

    try {
      await api.patch(`/admin/final-exams/${examId}/publish`);

      fetchExams();
    } catch (err) {
      console.error("PUBLISH ERROR:", err);
      alert("Failed to publish exam");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">🎓 Final Examinations</h1>
          <p className="text-gray-500 text-sm">
            Admin-controlled exams (Draft → Published)
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/exams/final/create")}
          className="px-5 py-2 rounded-lg bg-black text-white hover:bg-gray-800"
        >
          ➕ Create Final Exam
        </button>
      </div>

      {/* ================= TABLE ================= */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow overflow-hidden"
      >
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">Exam</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Schedules</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {/* LOADING */}
            {loading && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-500">
                  Loading final exams…
                </td>
              </tr>
            )}

            {/* EMPTY */}
            {!loading && exams.length === 0 && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-500">
                  No final exams created yet
                </td>
              </tr>
            )}

            {/* DATA */}
            {exams.map((exam) => (
              <tr
                key={exam._id}
                className="border-t dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                {/* EXAM INFO */}
                <td className="px-4 py-3">
                  <div className="font-semibold">{exam.name}</div>
                  <div className="text-xs text-gray-500">
                    Code: {exam.examCode}
                  </div>
                </td>

                {/* DATE */}
                <td className="px-4 py-3 text-center">
                  {exam.createdAt
                    ? new Date(exam.createdAt).toLocaleDateString()
                    : "—"}
                </td>

                {/* SCHEDULE COUNT */}
                <td className="px-4 py-3 text-center">
                  {exam.schedule?.length || 0}
                </td>

                {/* STATUS */}
                <td className="px-4 py-3 text-center">
                  {exam.status === "PUBLISHED" ? (
                    <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-600">
                      Published
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-600">
                      Draft
                    </span>
                  )}
                </td>

                {/* ACTIONS */}
                <td className="px-4 py-3 text-right space-x-2">
                  {exam.status === "DRAFT" && (
                    <button
                      onClick={() => publishExam(exam._id)}
                      className="px-3 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700"
                    >
                      Publish
                    </button>
                  )}

                  <button
                    onClick={() =>
                      navigate(`/admin/exams/final/view/${exam._id}`)
                    }
                    className="px-3 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
