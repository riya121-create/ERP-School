import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { motion } from "framer-motion";

export default function AdminFinalExamView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExam();
  }, [id]);

  const fetchExam = async () => {
    try {
      const res = await api.get(`/admin/exams/final/${id}`);
      setExam(res.data);
    } catch (err) {
      console.error("FETCH FINAL EXAM ERROR:", err);
      alert("Failed to load exam");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading exam details…
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="p-10 text-center text-red-500">
        Exam not found
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{exam.name}</h1>
          <p className="text-sm text-gray-500">
            Exam Code: {exam.examCode}
          </p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          ← Back
        </button>
      </div>

      {/* STATUS */}
      <div className="mb-6">
        {exam.status === "PUBLISHED" ? (
          <span className="px-3 py-1 rounded bg-green-100 text-green-600 text-sm">
            Published
          </span>
        ) : (
          <span className="px-3 py-1 rounded bg-yellow-100 text-yellow-600 text-sm">
            Draft
          </span>
        )}
      </div>

      {/* SCHEDULE LIST */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow overflow-hidden"
      >
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Class</th>
              <th className="px-4 py-3">Section</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
            </tr>
          </thead>

          <tbody>
            {exam.schedule.map((s, i) => (
              <tr
                key={i} 
                className="border-t hover:bg-gray-50"
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
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
