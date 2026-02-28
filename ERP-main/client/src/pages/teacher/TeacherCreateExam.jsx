import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import api from "../../services/api"

/* ================= MOTION ================= */
const fade = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } }
}

/* ================= MAIN ================= */
export default function TeacherCreateExam() {
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: "",
    type: "Unit Test",
    mode: "Offline",
    subject: "",
    selectedClasses: [],
    date: "",
    startTime: "",
    endTime: "",
    maxMarks: 50,
    passingMarks: 17,
     evaluationRules: [], 
    syllabus: [],
    rules: {
      allowAbsent: true,
      autoGrade: true,
      lockAfterPublish: true,
      reEvaluation: false,
      graceMarks: false
    },
    status: "DRAFT"
  })

  /* ================= FETCH SUBJECTS ONLY ================= */
  useEffect(() => {
    api.get("/teacher/subjects")
      .then(r => setSubjects(r.data || []))
  }, [])

  /* ================= FETCH CLASSES ON SUBJECT CHANGE ================= */
  useEffect(() => {
    if (!form.subject) {
      setClasses([])
      setForm(f => ({ ...f, selectedClasses: [] }))
      return
    }

    api.get("/teacher/subject-classes", {
      params: { subject: form.subject }
    })
      .then(r => {
        setClasses(r.data || [])
        setForm(f => ({ ...f, selectedClasses: [] }))
      })
  }, [form.subject])

  /* ================= HELPERS ================= */
  const duration = useMemo(() => {
    if (!form.startTime || !form.endTime) return ""
    const s = new Date(`1970-01-01T${form.startTime}`)
    const e = new Date(`1970-01-01T${form.endTime}`)
    const diff = (e - s) / 60000
    return diff > 0 ? `${diff} mins` : ""
  }, [form.startTime, form.endTime])

  const toggleClass = id => {
    setForm(f => ({
      ...f,
      selectedClasses: f.selectedClasses.includes(id)
        ? f.selectedClasses.filter(c => c !== id)
        : [...f.selectedClasses, id]
    }))
  }

  const addChapter = () => {
    setForm(f => ({
      ...f,
      syllabus: [...f.syllabus, { chapter: "", topics: [] }]
    }))
  }

  const addTopic = i => {
    const syllabus = [...form.syllabus]
    syllabus[i].topics.push("")
    setForm({ ...form, syllabus })
  }

  const updateChapter = (i, val) => {
    const syllabus = [...form.syllabus]
    syllabus[i].chapter = val
    setForm({ ...form, syllabus })
  }

  const updateTopic = (i, j, val) => {
    const syllabus = [...form.syllabus]
    syllabus[i].topics[j] = val
    setForm({ ...form, syllabus })
  }

  const validate = () => {
    if (!form.name.trim()) return "Exam name required"
    if (!form.subject) return "Subject required"
    if (!form.date) return "Date required"
    if (!form.selectedClasses.length) return "Select at least one class"
    if (form.passingMarks > form.maxMarks) return "Passing marks invalid"
    if (!duration) return "Invalid time range"
    return null
  }

  const submit = () => {
    const err = validate()
    if (err) return alert(err)
    setShowPreview(true)
  }

  const finalSubmit = async status => {
    try {
      setLoading(true)
      await api.post("/teacher/exams/create", { ...form, status })
      alert(status === "PUBLISHED" ? "Exam Published ✅" : "Saved as Draft 📝")
      setShowPreview(false)
    } catch {
      alert("Failed to create exam")
    } finally {
      setLoading(false)
    }
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-[#F9FAFB] px-6 py-8">
      <motion.div variants={fade} initial="hidden" animate="show">
        <h1 className="text-3xl font-semibold">Create Exam</h1>
        <p className="text-gray-500 mt-1">
          Advanced exam setup & evaluation rules
        </p>
      </motion.div>

      <div className="mt-10 grid lg:grid-cols-3 gap-10">

        {/* ================= FORM ================= */}
        <motion.div variants={fade} initial="hidden" animate="show" className="lg:col-span-2 space-y-8">

          <Section title="Basic Information">
            <Input label="Exam Name" value={form.name}
              onChange={v => setForm({ ...form, name: v })} />

            <Select label="Exam Type" value={form.type}
              options={["Unit Test", "Mid Term", "Final", "Practical"]}
              onChange={v => setForm({ ...form, type: v })} />

            <Select label="Exam Mode" value={form.mode}
              options={["Offline", "Online"]}
              onChange={v => setForm({ ...form, mode: v })} />

            <Select
              label="Subject"
              value={form.subject}
              options={subjects.map(s => s.name)}
              onChange={v => setForm({ ...form, subject: v })}
            />
          </Section>

          <Section title="Schedule">
            <div className="grid sm:grid-cols-2 gap-6">
              <Input type="date" label="Exam Date" value={form.date}
                onChange={v => setForm({ ...form, date: v })} />
              <Input type="time" label="Start Time" value={form.startTime}
                onChange={v => setForm({ ...form, startTime: v })} />
              <Input type="time" label="End Time" value={form.endTime}
                onChange={v => setForm({ ...form, endTime: v })} />
              <Input label="Duration" value={duration} disabled />
            </div>
          </Section>

          <Section title="Classes & Sections">
            <div className="grid sm:grid-cols-2 gap-3">
              {classes.map(c => (
                <ClassPill
                  key={c._id}
                  active={form.selectedClasses.includes(c._id)}
                  label={`${c.name} - ${c.section}`}
                  onClick={() => toggleClass(c._id)}
                />
              ))}
              {!classes.length && form.subject && (
                <p className="text-sm text-gray-500">No classes mapped for this subject</p>
              )}
            </div>
          </Section>

          <Section title="Marking Scheme">
            <div className="grid sm:grid-cols-2 gap-6">
              <Input type="number" label="Max Marks" value={form.maxMarks}
                onChange={v => setForm({ ...form, maxMarks: +v })} />
              <Input type="number" label="Passing Marks" value={form.passingMarks}
                onChange={v => setForm({ ...form, passingMarks: +v })} />
            </div>
          </Section>
<Section title="Evaluation Rules (Optional)">
  {form.evaluationRules.map((r, i) => (
    <div key={i} className="grid grid-cols-4 gap-3 items-end">
      
      <Input
        label="Label"
        value={r.label}
        onChange={v => {
          const rules = [...form.evaluationRules]
          rules[i].label = v
          setForm({ ...form, evaluationRules: rules })
        }}
      />

      <Input
        type="number"
        label="Min Marks"
        value={r.minMarks}
        onChange={v => {
          const rules = [...form.evaluationRules]
          rules[i].minMarks = Number(v)
          setForm({ ...form, evaluationRules: rules })
        }}
      />

      <Input
        type="number"
        label="Max Marks"
        value={r.maxMarks}
        onChange={v => {
          const rules = [...form.evaluationRules]
          rules[i].maxMarks = Number(v)
          setForm({ ...form, evaluationRules: rules })
        }}
      />

      <button
        onClick={() => {
          setForm({
            ...form,
            evaluationRules: form.evaluationRules.filter((_, x) => x !== i)
          })
        }}
        className="h-11 rounded-lg border text-red-500"
      >
        Remove
      </button>
    </div>
  ))}

  <button
    onClick={() =>
      setForm({
        ...form,
        evaluationRules: [
          ...form.evaluationRules,
          { label: "", minMarks: 0, maxMarks: 0 }
        ]
      })
    }
    className="text-sm text-blue-600"
  >
    + Add Evaluation Rule
  </button>
</Section>

          <Section title="Syllabus">
            {form.syllabus.map((c, i) => (
              <div key={i} className="border rounded-xl p-4 space-y-3">
                <Input label={`Chapter ${i + 1}`} value={c.chapter}
                  onChange={v => updateChapter(i, v)} />
                {c.topics.map((t, j) => (
                  <Input key={j} label={`Topic ${j + 1}`} value={t}
                    onChange={v => updateTopic(i, j, v)} />
                ))}
                <button onClick={() => addTopic(i)} className="text-sm text-blue-600">
                  + Add Topic
                </button>
              </div>
            ))}
            <button onClick={addChapter} className="text-sm text-blue-600">
              + Add Chapter
            </button>
          </Section>

          <Section title="Exam Rules">
            {Object.entries(form.rules).map(([k, v]) => (
              <Toggle
                key={k}
                label={k.replace(/([A-Z])/g, " $1")}
                value={v}
                onChange={val =>
                  setForm({ ...form, rules: { ...form.rules, [k]: val } })
                }
              />
            ))}
          </Section>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={submit}
            className="w-full h-12 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700"
          >
            Review Exam
          </motion.button>
        </motion.div>

        {/* ================= PREVIEW ================= */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl border p-8 space-y-4 shadow-xl"
            >
              <h2 className="text-lg font-semibold">Review & Publish</h2>

              <Preview label="Exam" value={form.name} />
              <Preview label="Subject" value={form.subject} />
              <Preview label="Classes" value={form.selectedClasses.length} />
              <Preview label="Duration" value={duration} />

              <button onClick={() => finalSubmit("DRAFT")}
                className="w-full h-11 rounded-xl border">
                Save as Draft
              </button>

              <button onClick={() => finalSubmit("PUBLISHED")}
                disabled={loading}
                className="w-full h-11 rounded-xl bg-emerald-600 text-white">
                Publish Exam 🚀
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ================= UI ATOMS ================= */

function Section({ title, children }) {
  return (
    <motion.div variants={fade} className="bg-white rounded-2xl border p-6 space-y-5">
      <h3 className="font-semibold text-lg">{title}</h3>
      {children}
    </motion.div>
  )
}

function Input({ label, value, onChange, type = "text", disabled }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
        className="w-full mt-1 h-11 rounded-lg border px-3 disabled:bg-gray-100"
      />
    </div>
  )
}

function Select({ label, options, value, onChange }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full mt-1 h-11 rounded-lg border px-3"
      >
        <option value="">Select</option>
        {options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}

function ClassPill({ label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`px-4 py-2 rounded-full cursor-pointer text-sm border
      ${active ? "bg-blue-600 text-white" : "bg-white"}`}
    >
      {label}
    </div>
  )
}

function Toggle({ label, value, onChange }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm">{label}</span>
      <input type="checkbox" checked={value}
        onChange={e => onChange(e.target.checked)} />
    </div>
  )
}

function Preview({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
