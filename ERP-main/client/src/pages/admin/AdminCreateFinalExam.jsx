import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Clock, Calendar, BookOpen, GraduationCap, Save } from "lucide-react";

/* =====================================================
   HELPERS
===================================================== */
const addMinutes = (time, mins) => {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const d = new Date(0, 0, 0, h, m + Number(mins));
  return d.toTimeString().slice(0, 5);
};

const CLASS_ACCENTS = [
  "border-indigo-500/40 bg-indigo-500/5",
  "border-sky-500/40 bg-sky-500/5",
  "border-violet-500/40 bg-violet-500/5",
  "border-emerald-500/40 bg-emerald-500/5",
  "border-rose-500/40 bg-rose-500/5",
  "border-amber-500/40 bg-amber-500/5",
];
const CLASS_HEADER = [
  "bg-indigo-500/15 text-indigo-400",
  "bg-sky-500/15 text-sky-400",
  "bg-violet-500/15 text-violet-400",
  "bg-emerald-500/15 text-emerald-400",
  "bg-rose-500/15 text-rose-400",
  "bg-amber-500/15 text-amber-400",
];

/* =====================================================
   MAIN
===================================================== */
export default function AdminCreateFinalExam() {
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(false);
  const [allClasses, setAllClasses] = useState([]);
  const [selected, setSelected]     = useState([]);
  const [step, setStep]             = useState(0);
  const [exam, setExam] = useState({ name: "", examCode: "", subjectSchedule: {} });

  useEffect(() => {
    api.get("/admin/final-exam-structure").then(res => setAllClasses(res.data || []));
  }, []);

  const classKey = c => `${c.classId}_${c.section}`;

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
            classId: cls.classId, className: cls.className,
            section: cls.section, subject: sub,
            date: "", startTime: "", duration: 180, endTime: ""
          };
        });
      });
    setExam(p => ({ ...p, subjectSchedule: schedule }));
  };

  /* group by class */
  const grouped = {};
  Object.values(exam.subjectSchedule).forEach(s => {
    const k = `${s.classId}_${s.section}`;
    if (!grouped[k]) {
      const idx = Object.keys(grouped).length;
      grouped[k] = { className: s.className, section: s.section, idx, subjects: [] };
    }
    grouped[k].subjects.push(s);
  });
  const steps = Object.values(grouped);
  const current = steps[step];

  const updateField = (k, s, field, val) => {
    const updated = { ...s, [field]: val };
    if (field === "startTime" || field === "duration") {
      updated.endTime = addMinutes(
        field === "startTime" ? val : s.startTime,
        field === "duration" ? val : s.duration
      );
    }
    setExam(p => ({ ...p, subjectSchedule: { ...p.subjectSchedule, [k]: updated } }));
  };

  const submit = async () => {
    for (const s of Object.values(exam.subjectSchedule)) {
      if (!s.date || !s.startTime || !s.endTime)
        return alert(`Missing schedule: ${s.className} ${s.section} – ${s.subject}`);
    }
    setLoading(true);
    try {
      await api.post("/admin/exams/final", exam);
      navigate("/admin/exams/final");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create exam");
    } finally {
      setLoading(false);
    }
  };

  /* completion check */
  const isStepComplete = (grp) =>
    grp.subjects.every(s => s.date && s.startTime && s.endTime);

  return (
    <div className="space-y-6 text-gray-100 max-w-4xl">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/admin/exams/final")}
          className="p-2 rounded-xl bg-white/[0.05] border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Final Exam</h1>
          <p className="text-sm text-gray-500 mt-0.5">Schedule subjects across classes</p>
        </div>
      </div>

      {/* BASIC INFO */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#161616] p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Exam Details</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block font-medium">Exam Name *</label>
            <input value={exam.name} onChange={e => setExam(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Annual Final Exam 2025"
              className="w-full bg-white/[0.05] border border-white/10 text-gray-200 placeholder-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500/60 transition" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block font-medium">Exam Code *</label>
            <input value={exam.examCode} onChange={e => setExam(p => ({ ...p, examCode: e.target.value }))}
              placeholder="e.g. FINAL-2025"
              className="w-full bg-white/[0.05] border border-white/10 text-gray-200 placeholder-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500/60 transition" />
          </div>
        </div>
      </div>

      {/* CLASS SELECTION */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#161616] p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Select Classes</p>
        <div className="flex flex-wrap gap-2">
          {allClasses.map((c, i) => {
            const key = classKey(c);
            const active = selected.includes(key);
            return (
              <button key={key} onClick={() => toggleClass(c)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition
                  ${active
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-white/[0.04] border-white/[0.08] text-gray-400 hover:bg-white/[0.08] hover:text-gray-200"
                  }`}>
                {active && <Check size={13} />}
                Class {c.className} – {c.section}
              </button>
            );
          })}
          {allClasses.length === 0 && (
            <p className="text-sm text-gray-600">No classes found. Create a timetable first.</p>
          )}
        </div>
      </div>

      {/* STEP PROGRESS */}
      {steps.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {steps.map((grp, i) => {
            const done = isStepComplete(grp);
            const active = i === step;
            return (
              <button key={i} onClick={() => setStep(i)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition
                  ${active ? "bg-indigo-600 border-indigo-500 text-white"
                    : done ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                    : "bg-white/[0.04] border-white/[0.08] text-gray-500 hover:bg-white/[0.07]"
                  }`}>
                {done && !active && <Check size={11} />}
                {grp.className} – {grp.section}
              </button>
            );
          })}
        </div>
      )}

      {/* SCHEDULE PANEL */}
      {current && (
        <div className={`rounded-2xl border-2 ${CLASS_ACCENTS[current.idx % CLASS_ACCENTS.length]} overflow-hidden`}>
          {/* class header */}
          <div className={`flex items-center justify-between px-5 py-3.5 ${CLASS_HEADER[current.idx % CLASS_HEADER.length]}`}>
            <div className="flex items-center gap-2">
              <GraduationCap size={16} />
              <span className="font-semibold">Class {current.className} – Section {current.section}</span>
              <span className="text-xs opacity-60">({step + 1} of {steps.length})</span>
            </div>
            <span className="text-xs opacity-60">{current.subjects.length} subject{current.subjects.length !== 1 ? "s" : ""}</span>
          </div>

          {/* subjects */}
          <div className="p-5 space-y-3">
            {current.subjects.map(s => {
              const k = `${s.classId}_${s.section}_${s.subject}`;
              const filled = s.date && s.startTime;
              return (
                <div key={k} className={`rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 transition ${filled ? "border-emerald-500/20" : ""}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen size={13} className="text-gray-500" />
                    <span className="font-semibold text-white text-sm">{s.subject}</span>
                    {filled && <Check size={12} className="text-emerald-400 ml-auto" />}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] text-gray-600 mb-1 block flex items-center gap-1"><Calendar size={10} /> Date</label>
                      <input type="date" value={s.date}
                        onChange={e => updateField(k, s, "date", e.target.value)}
                        className="w-full bg-white/[0.05] border border-white/10 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition" />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-600 mb-1 block flex items-center gap-1"><Clock size={10} /> Start Time</label>
                      <input type="time" value={s.startTime}
                        onChange={e => updateField(k, s, "startTime", e.target.value)}
                        className="w-full bg-white/[0.05] border border-white/10 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition" />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-600 mb-1 block">Duration (min)</label>
                      <input type="number" value={s.duration}
                        onChange={e => updateField(k, s, "duration", e.target.value)}
                        className="w-full bg-white/[0.05] border border-white/10 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition" />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-600 mb-1 block">End Time (auto)</label>
                      <input type="time" value={s.endTime} disabled
                        className="w-full bg-white/[0.03] border border-white/[0.06] text-gray-500 rounded-lg px-3 py-2 text-sm cursor-not-allowed" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* nav */}
          <div className="flex justify-between px-5 py-4 border-t border-white/[0.06] bg-white/[0.02]">
            <button disabled={step === 0} onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 text-sm font-medium transition">
              <ArrowLeft size={14} /> Previous
            </button>
            {step < steps.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition">
                Next <ArrowRight size={14} />
              </button>
            ) : (
              <button onClick={submit} disabled={loading}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold transition">
                <Save size={14} />
                {loading ? "Creating…" : "Create Exam"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
