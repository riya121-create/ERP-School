import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../services/api";

/* ================= ANIMATIONS ================= */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

export default function TeacherEnterMarks() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [examClasses, setExamClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ================= LOAD EXAM ================= */
  useEffect(() => {
    let alive = true;
    setLoading(true);

    api
      // ✅ CORRECT BACKEND ROUTE
      .get(`/teacher/view/${examId}`)
      .then(res => {
        if (!alive) return;

        const exam = res.data.exam;
        const classes = exam?.classes || [];

        setExamClasses(classes);

        // auto select if single class
        if (
          classes.length === 1 &&
          classes[0].classId?._id &&
          classes[0].section
        ) {
          const c = classes[0];
          setSelectedClass(`${c.classId._id}_${c.section}`);
        }
      })
      .catch(err => {
        console.error("LOAD EXAM ERROR:", err);
        alert("Failed to load exam");
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [examId]);

  /* ================= LOAD STUDENTS ================= */
  useEffect(() => {
    if (!selectedClass) {
      setRows([]);
      return;
    }

    api
      // ✅ CORRECT BACKEND ROUTE
      .get(`/teacher/${examId}/students`, {
        params: { classKey: selectedClass }
      })
      .then(res => {
        setRows(
          (res.data || []).map(x => ({
            studentId: x.studentId._id,
            rollNo: x.studentId.rollNo,
            name: x.studentId.name,
            marks: x.marks ?? "",
            absent: Boolean(x.absent)
          }))
        );
      })
      .catch(err => {
        console.error("LOAD STUDENTS ERROR:", err);
        setRows([]);
      });
  }, [examId, selectedClass]);

  /* ================= HELPERS ================= */
  const updateMarks = (id, value) => {
    setRows(r =>
      r.map(x =>
        x.studentId === id ? { ...x, marks: value } : x
      )
    );
  };

  const toggleAbsent = id => {
    setRows(r =>
      r.map(x =>
        x.studentId === id
          ? { ...x, absent: !x.absent, marks: "" }
          : x
      )
    );
  };

  /* ================= SAVE MARKS ================= */
  const saveAll = async () => {
    if (!selectedClass) {
      alert("Select class first");
      return;
    }

    if (rows.some(r => !r.absent && r.marks === "")) {
      alert("Enter marks or mark absent for all students");
      return;
    }

    try {
      setSaving(true);

      await api.post("/teacher/marks", {
        examId,
        classKey: selectedClass,
        marks: rows.map(r => ({
          studentId: r.studentId,
          marks: r.absent ? null : Number(r.marks),
          absent: r.absent
        }))
      });

      alert("✅ Marks saved successfully");
      navigate(-1);
    } catch (err) {
      console.error("SAVE MARKS ERROR:", err);
      alert(
        err.response?.data?.message || "Failed to save marks"
      );
    } finally {
      setSaving(false);
    }
  };

  /* ================= PROGRESS ================= */
  const completed = useMemo(
    () =>
      rows.filter(r => r.absent || r.marks !== "").length,
    [rows]
  );

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-gray-400">
        Preparing exam workspace…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1220] via-[#0E1628] to-black text-white px-10 py-10">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto"
      >
        {/* HEADER */}
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="text-4xl font-semibold">
              Enter Marks
            </h1>
            <p className="text-gray-400 mt-2">
              {completed} of {rows.length} students evaluated
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="rounded-xl px-4 py-2 bg-white/10 hover:bg-white/20"
          >
            ← Back
          </button>
        </div>

        {/* CLASS SELECT */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-10">
          <label className="block text-sm text-gray-400 mb-2">
            Select Class
          </label>
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3"
          >
            <option value="">Choose class</option>
            {examClasses.map(c => (
              <option
                key={`${c.classId._id}_${c.section}`}
                value={`${c.classId._id}_${c.section}`}
              >
                {c.classId.name} – {c.section}
              </option>
            ))}
          </select>
        </div>

        {/* TABLE */}
        {selectedClass && (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <table className="w-full">
              <thead className="bg-white/10 text-xs uppercase text-gray-300">
                <tr>
                  <th className="p-4 text-left">Roll</th>
                  <th className="p-4 text-left">Student</th>
                  <th className="p-4 text-center">Marks</th>
                  <th className="p-4 text-center">Absent</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={`${r.studentId}-${i}`}
                    className={`border-t border-white/10 ${
                      r.absent
                        ? "opacity-40"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <td className="p-4">{r.rollNo}</td>
                    <td className="p-4">{r.name}</td>
                    <td className="p-4 text-center">
                      <input
                        type="number"
                        min="0"
                        value={r.marks}
                        disabled={r.absent}
                        onChange={e =>
                          updateMarks(
                            r.studentId,
                            e.target.value
                          )
                        }
                        className="w-24 bg-black/40 border border-white/10 rounded-lg text-center"
                      />
                    </td>
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={r.absent}
                        onChange={() =>
                          toggleAbsent(r.studentId)
                        }
                        className="accent-emerald-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SAVE */}
        {selectedClass && (
          <div className="mt-10 flex justify-end">
            <button
              disabled={saving}
              onClick={saveAll}
              className="px-10 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-black font-semibold disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Marks"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
