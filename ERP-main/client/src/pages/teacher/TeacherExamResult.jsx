import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../services/api";

/* ================= ANIMATION ================= */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } }
};

export default function TeacherExamResult() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filter, setFilter] = useState("ALL");
  const [selectedClassId, setSelectedClassId] = useState("");

  /* ================= LOAD EXAM ================= */
  useEffect(() => {
    api
      // ✅ CORRECT BACKEND ROUTE
      .get(`/teacher/view/${examId}`)
      .then(res => {
        const examData = res.data.exam;
        setExam(examData);

        if (examData?.classes?.length) {
          setSelectedClassId(examData.classes[0].classId._id);
        }
      })
      .catch(err => {
        console.error("EXAM LOAD ERROR:", err);
        alert("Failed to load exam");
      });
  }, [examId]);

  /* ================= LOAD RESULTS ================= */
  useEffect(() => {
    if (!selectedClassId) return;

    setLoading(true);

    api
      // ✅ CORRECT BACKEND ROUTE
      .get(`/teacher/${examId}/results`, {
        params: { classId: selectedClassId }
      })
      .then(res => setRows(res.data || []))
      .catch(err => {
        console.error("RESULT LOAD ERROR:", err);
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, [examId, selectedClassId]);

  /* ================= STATS ================= */
  const stats = useMemo(() => {
    const total = rows.length;
    const absent = rows.filter(r => r.absent).length;
    const evaluated = rows.filter(
      r => !r.absent && r.marks !== null
    ).length;
    const passed = rows.filter(r => r.result === "PASS").length;
    const failed = rows.filter(r => r.result === "FAIL").length;

    const topper =
      rows
        .filter(r => !r.absent && r.marks !== null)
        .sort((a, b) => b.marks - a.marks)[0] || null;

    return { total, absent, evaluated, passed, failed, topper };
  }, [rows]);

  /* ================= FILTER ================= */
  const filteredRows = useMemo(() => {
    if (filter === "ALL") return rows;
    if (filter === "PASS") return rows.filter(r => r.result === "PASS");
    if (filter === "FAIL") return rows.filter(r => r.result === "FAIL");
    if (filter === "ABSENT") return rows.filter(r => r.absent);
    return rows;
  }, [rows, filter]);

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-[#0B1220] text-white px-10 py-10">

      {/* HEADER */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <div className="flex justify-between items-start gap-6">
          <div>
            <h1 className="text-3xl font-bold">
              Academic Performance Record
            </h1>
            <p className="text-gray-400 mt-1">
              {exam?.name} · {exam?.subject} · {exam?.type}
            </p>
          </div>

          <div className="flex gap-3">
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="bg-white/10 px-4 py-2 rounded-lg text-sm"
            >
              {exam?.classes?.map(c => (
                <option key={c.classId._id} value={c.classId._id}>
                  {c.classId.name} – {c.section}
                </option>
              ))}
            </select>

            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
            >
              ← Back
            </button>
          </div>
        </div>
      </motion.div>

      {/* STATS */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="grid md:grid-cols-5 gap-6 mt-10"
      >
        <Stat title="Students" value={stats.total} />
        <Stat title="Evaluated" value={stats.evaluated} />
        <Stat title="Passed" value={stats.passed} green />
        <Stat title="Failed" value={stats.failed} red />
        <Stat title="Absent" value={stats.absent} yellow />
      </motion.div>

      {/* TOPPER */}
      {stats.topper && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-8 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20"
        >
          <p className="text-sm text-emerald-400 font-medium">
            🏆 Class Topper
          </p>
          <p className="text-lg font-semibold mt-1">
            {stats.topper.name} — {stats.topper.marks}/{exam.maxMarks}
          </p>
        </motion.div>
      )}

      {/* FILTERS */}
      <div className="flex gap-3 mt-10">
        {["ALL", "PASS", "FAIL", "ABSENT"].map(f => (
          <FilterButton
            key={f}
            active={filter === f}
            onClick={() => setFilter(f)}
          >
            {f}
          </FilterButton>
        ))}
      </div>

      {/* TABLE */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border border-white/10 rounded-xl overflow-hidden">
          <thead className="bg-white/10 text-sm">
            <tr>
              <th className="p-3 text-left">Roll</th>
              <th className="p-3 text-left">Student</th>
              <th className="p-3 text-center">Marks</th>
              <th className="p-3 text-center">%</th>
              <th className="p-3 text-center">Evaluation</th>
              <th className="p-3 text-center">Result</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-400">
                  Loading…
                </td>
              </tr>
            ) : filteredRows.length ? (
              filteredRows.map(r => (
                <tr
                  key={`${r.studentId}-${selectedClassId}`}
                  className="border-t border-white/10 hover:bg-white/5"
                >
                  <td className="p-3">{r.rollNo}</td>
                  <td className="p-3">{r.name}</td>
                  <td className="p-3 text-center">
                    {r.absent ? "—" : r.marks}
                  </td>
                  <td className="p-3 text-center">
                    {r.percentage ?? "—"}
                  </td>
                  <td className="p-3 text-center">
                    <EvaluationBadge value={r.evaluation} />
                  </td>
                  <td className="p-3 text-center">
                    <ResultBadge
                      result={r.result}
                      absent={r.absent}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= UI PARTS ================= */

function Stat({ title, value, green, red, yellow }) {
  const color =
    green ? "text-emerald-400" :
    red ? "text-red-400" :
    yellow ? "text-yellow-400" :
    "text-white";

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
      <p className="text-xs text-gray-400">{title}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>
        {value}
      </p>
    </div>
  );
}

function FilterButton({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm ${
        active
          ? "bg-blue-600"
          : "bg-white/10 hover:bg-white/20"
      }`}
    >
      {children}
    </button>
  );
}

function ResultBadge({ result, absent }) {
  if (absent) {
    return (
      <span className="px-3 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
        ABSENT
      </span>
    );
  }
  if (result === "PASS") {
    return (
      <span className="px-3 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-400">
        PASS
      </span>
    );
  }
  return (
    <span className="px-3 py-1 rounded-full text-xs bg-red-500/20 text-red-400">
      FAIL
    </span>
  );
}

function EvaluationBadge({ value }) {
  if (!value) return "—";

  const map = {
    Excellent: "bg-green-500/20 text-green-400",
    Good: "bg-blue-500/20 text-blue-400",
    Average: "bg-yellow-500/20 text-yellow-400",
    Poor: "bg-red-500/20 text-red-400"
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs ${
        map[value] || "bg-white/10"
      }`}
    >
      {value}
    </span>
  );
}
