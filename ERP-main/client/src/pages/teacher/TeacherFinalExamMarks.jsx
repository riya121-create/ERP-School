import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../services/api";
import BackButton from "../../components/BackButton";

/* ================= ANIMATION ================= */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } }
};

export default function TeacherFinalExamMarks() {
  const { examId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const classId = searchParams.get("classId");
  const section = searchParams.get("section");
  const subject = searchParams.get("subject");

  const [exam, setExam] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* ================= LOAD STUDENTS ================= */
  useEffect(() => {
    if (!classId || !section || !subject) {
      setError("Missing class / section / subject");
      setLoading(false);
      return;
    }

    api.get(`/teacher/final-exams/${examId}/students`, {
  params: {
    classId,
    section,
    subject
  }
})

      .then(res => {
        setExam(res.data.exam);
        setStudents(res.data.students);
      })
      .catch(err => {
        setError(
          err.response?.data?.message || "Failed to load students"
        );
      })
      .finally(() => setLoading(false));
  }, [examId, classId, section, subject]);

  /* ================= SUMMARY ================= */
  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;

    students.forEach(s => {
      if (s.status === "ABSENT") absent++;
      else present++;
    });

    return { present, absent };
  }, [students]);

  /* ================= UPDATE STUDENT ================= */
  const updateStudent = (index, updates) => {
    setStudents(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  /* ================= SAVE MARKS ================= */
  const saveMarks = async () => {
    setSaving(true);
    setError("");

    try {
      await api.post("/teacher/final-exams/marks", {
        results: students.map(s => ({
          resultId: s.resultId,
          marks: s.status === "ABSENT" ? null : Number(s.marks),
          status: s.status
        }))
      });

      navigate(-1);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save marks"
      );
    } finally {
      setSaving(false);
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center text-slate-400">
        Loading final exam students…
      </div>
    );
  }

  /* ================= ERROR ================= */
  if (error) {
    return (
      <div className="h-[70vh] flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="text-white">
      {/* ================= HEADER ================= */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <BackButton to="/teacher/exams/list" label="My Exams" />

        <h1 className="text-3xl font-semibold tracking-tight">
          Final Exam – Marks Entry
        </h1>

        <p className="text-sm text-slate-400 mt-2">
          {exam?.name} • {classId} • Section {section} • {subject}
        </p>
      </motion.div>

      {/* ================= SUMMARY BAR ================= */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="flex gap-6 mt-6 text-sm"
      >
        <Summary label="Total Students" value={students.length} />
        <Summary label="Present" value={summary.present} />
        <Summary label="Absent" value={summary.absent} />
      </motion.div>

      {/* ================= TABLE ================= */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="mt-10 overflow-hidden rounded-xl border border-slate-700"
      >
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left">Roll No</th>
              <th className="px-4 py-3 text-left">Student</th>
              <th className="px-4 py-3 text-center">Marks</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>

          <tbody>
            {students.map((s, i) => (
              <tr
                key={s.resultId}
                className="border-t border-slate-800 hover:bg-slate-900/40"
              >
                <td className="px-4 py-3">{s.rollNo}</td>
                <td className="px-4 py-3">{s.name}</td>

                <td className="px-4 py-3 text-center">
                  <input
                    type="number"
                    min={0}
                    disabled={s.status === "ABSENT"}
                    value={s.marks ?? ""}
                    onChange={e =>
                      updateStudent(i, {
                        marks: e.target.value
                      })
                    }
                    className="w-20 rounded-md bg-slate-800 border border-slate-600 px-2 py-1 text-center disabled:opacity-40"
                  />
                </td>

                <td className="px-4 py-3 text-center">
                  <select
                    value={s.status}
                    onChange={e =>
                      updateStudent(i, {
                        status: e.target.value,
                        marks:
                          e.target.value === "ABSENT"
                            ? null
                            : s.marks
                      })
                    }
                    className="rounded-md bg-slate-800 border border-slate-600 px-2 py-1"
                  >
                    <option value="PRESENT">Present</option>
                    <option value="ABSENT">Absent</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* ================= ACTIONS ================= */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="flex justify-end gap-4 mt-8"
      >
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600"
        >
          Cancel
        </button>

        <button
          disabled={saving}
          onClick={saveMarks}
          className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Marks"}
        </button>
      </motion.div>
    </div>
  );
}

/* ================= SMALL SUMMARY CARD ================= */
function Summary({ label, value }) {
  return (
    <div className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-700">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-lg font-semibold text-slate-200">
        {value}
      </p>
    </div>
  );
}
