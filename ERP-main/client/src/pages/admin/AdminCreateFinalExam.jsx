import { useEffect, useState } from "react";
import api from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

/* ================= COLOR SYSTEM ================= */
const CLASS_COLORS = [
  { bg: "#EEF2FF", border: "#6366F1", dot: "#4F46E5" },
  { bg: "#ECFDF5", border: "#10B981", dot: "#059669" },
  { bg: "#FFF1F2", border: "#F43F5E", dot: "#E11D48" },
  { bg: "#FFFBEB", border: "#F59E0B", dot: "#D97706" },
  { bg: "#F5F3FF", border: "#8B5CF6", dot: "#7C3AED" }
];

/* ================= TIME HELPERS ================= */
const addMinutes = (time, mins) => {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const d = new Date(0, 0, 0, h, m + Number(mins));
  return d.toTimeString().slice(0, 5);
};

export default function AdminCreateFinalExam() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [allClasses, setAllClasses] = useState([]);
  const [selected, setSelected] = useState([]);
  const [step, setStep] = useState(0);

  const [exam, setExam] = useState({
    name: "",
    examCode: "",
    subjectSchedule: {}
  });

  useEffect(() => {
    api.get("/admin/final-exam-structure").then(res => {
      setAllClasses(res.data);
    });
  }, []);

  const classKey = c => `${c.classId}_${c.section}`;

  /* ================= CLASS SELECT ================= */
  const toggleClass = c => {
    const key = classKey(c);
    const updated = selected.includes(key)
      ? selected.filter(k => k !== key)
      : [...selected, key];

    setSelected(updated);
    setStep(0);

    const schedule = {};
    allClasses
      .filter(x => updated.includes(classKey(x)))
      .forEach(cls => {
        cls.subjects.forEach(sub => {
          const k = `${cls.classId}_${cls.section}_${sub}`;
          schedule[k] = exam.subjectSchedule[k] || {
            classId: cls.classId,
            className: cls.className,
            section: cls.section,
            subject: sub,
            date: "",
            startTime: "",
            duration: 180,
            endTime: ""
          };
        });
      });

    setExam(p => ({ ...p, subjectSchedule: schedule }));
  };

  /* ================= GROUP ================= */
  const grouped = {};
  Object.values(exam.subjectSchedule).forEach(s => {
    const k = `${s.classId}_${s.section}`;
    if (!grouped[k]) {
      grouped[k] = {
        className: s.className,
        section: s.section,
        color:
          CLASS_COLORS[
            Object.keys(grouped).length % CLASS_COLORS.length
          ],
        subjects: []
      };
    }
    grouped[k].subjects.push(s);
  });

  const steps = Object.values(grouped);
  const current = steps[step];

  /* ================= SUBMIT ================= */
  const submit = async () => {
    for (const s of Object.values(exam.subjectSchedule)) {
      if (!s.date || !s.startTime || !s.endTime) {
        return alert(
          `Missing schedule: ${s.className} ${s.section} - ${s.subject}`
        );
      }
    }

    setLoading(true);
    try {
      await api.post("/admin/exams/final", exam);
      alert("Final Exam Created ✅");
      navigate("/admin/exams/final");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-10">
      <h1 className="text-4xl font-bold mb-10">
        🎓 Create Final Examination
      </h1>

      {/* BASIC */}
      <div className="grid grid-cols-2 gap-6 mb-12">
        <Input label="Exam Name" value={exam.name}
          onChange={v => setExam({ ...exam, name: v })} />
        <Input label="Exam Code" value={exam.examCode}
          onChange={v => setExam({ ...exam, examCode: v })} />
      </div>

      {/* CLASS SELECT */}
      <div className="mb-14">
        <div className="font-semibold mb-3">Select Classes</div>
        <div className="flex flex-wrap gap-3">
          {allClasses.map(c => {
            const active = selected.includes(classKey(c));
            return (
              <motion.div
                whileTap={{ scale: 0.95 }}
                key={classKey(c)}
                onClick={() => toggleClass(c)}
                className={`
                  px-4 py-2 rounded-full cursor-pointer
                  border transition
                  ${active
                    ? "bg-black text-white"
                    : "bg-gray-100 hover:bg-gray-200"}
                `}
              >
                {c.className} – {c.section}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* SCHEDULING */}
      <AnimatePresence>
        {current && (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="rounded-2xl shadow-xl border-l-8 overflow-hidden"
            style={{ borderColor: current.color.border }}
          >
            <div
              className="px-6 py-4 text-xl font-bold"
              style={{
                backgroundColor: current.color.bg,
                color: current.color.border
              }}
            >
              {current.className} – Section {current.section}
              <span className="ml-4 text-sm opacity-70">
                ({step + 1}/{steps.length})
              </span>
            </div>

            <div className="p-6 space-y-5">
              {current.subjects.map(s => {
                const k = `${s.classId}_${s.section}_${s.subject}`;

                return (
                  <div
                    key={k}
                    className="p-4 rounded-xl grid grid-cols-5 gap-4"
                    style={{ backgroundColor: current.color.bg }}
                  >
                    <div className="font-semibold flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: current.color.dot }}
                      />
                      {s.subject}
                    </div>

                    <Input type="date" label="Date" value={s.date}
                      onChange={v =>
                        setExam(p => ({
                          ...p,
                          subjectSchedule: {
                            ...p.subjectSchedule,
                            [k]: { ...s, date: v }
                          }
                        }))
                      }
                    />

                    <Input type="time" label="Start" value={s.startTime}
                      onChange={v => {
                        const end = addMinutes(v, s.duration);
                        setExam(p => ({
                          ...p,
                          subjectSchedule: {
                            ...p.subjectSchedule,
                            [k]: { ...s, startTime: v, endTime: end }
                          }
                        }));
                      }}
                    />

                    <Input type="number" label="Duration (min)"
                      value={s.duration}
                      onChange={v => {
                        const end = addMinutes(s.startTime, v);
                        setExam(p => ({
                          ...p,
                          subjectSchedule: {
                            ...p.subjectSchedule,
                            [k]: { ...s, duration: v, endTime: end }
                          }
                        }));
                      }}
                    />

                    <Input label="End (auto)" value={s.endTime} disabled />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between p-6 bg-gray-50">
              <button
                disabled={step === 0}
                onClick={() => setStep(s => s - 1)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Previous
              </button>

              {step < steps.length - 1 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  className="px-6 py-2 bg-black text-white rounded"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded"
                >
                  {loading ? "Creating…" : "Create Exam"}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= INPUT ================= */
function Input({ label, value, onChange, type = "text", disabled }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500">
        {label}
      </label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={e => onChange?.(e.target.value)}
        className="
          w-full mt-1 px-4 py-2 rounded-lg border
          disabled:bg-gray-100
        "
      />
    </div>
  );
}
