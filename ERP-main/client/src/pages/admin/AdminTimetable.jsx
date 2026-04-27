import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { Plus, Save, Trash2, Upload, Clock } from "lucide-react";
import AdminTimetableCsvUploadAndPreview from "./AdminTimetableCsvUploadAndPreview";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DEFAULT_DURATION = 50;

const DAY_SHORT = { Monday:"Mon", Tuesday:"Tue", Wednesday:"Wed", Thursday:"Thu", Friday:"Fri", Saturday:"Sat" };

const addMinutes = (time, min) => {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m + min, 0, 0);
  return d.toTimeString().slice(0, 5);
};

const hasOverlap = (periods) => {
  for (let i = 0; i < periods.length; i++)
    for (let j = i + 1; j < periods.length; j++) {
      const a = periods[i], b = periods[j];
      if (a.startTime && a.endTime && b.startTime && b.endTime &&
          a.startTime < b.endTime && a.endTime > b.startTime) return true;
    }
  return false;
};

const formatTime = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
};

/* subject → colour index */
const SUBJECT_COLORS = [
  "border-l-indigo-500 bg-indigo-500/5",
  "border-l-sky-500 bg-sky-500/5",
  "border-l-violet-500 bg-violet-500/5",
  "border-l-emerald-500 bg-emerald-500/5",
  "border-l-rose-500 bg-rose-500/5",
  "border-l-amber-500 bg-amber-500/5",
];
const subColorMap = {};
let subColorIdx = 0;
const getSubjectColor = (sub) => {
  if (!subColorMap[sub]) subColorMap[sub] = SUBJECT_COLORS[subColorIdx++ % SUBJECT_COLORS.length];
  return subColorMap[sub];
};

/* =====================================================
   MAIN
===================================================== */
export default function AdminTimetable() {
  const [params] = useSearchParams();
  const editClass   = params.get("class");
  const editSection = params.get("section");
  const isEdit      = Boolean(editClass && editSection);

  const [classes,  setClasses]  = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classId,  setClassId]  = useState("");
  const [section,  setSection]  = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showCsv,  setShowCsv]  = useState(false);
  const [activeDay, setActiveDay] = useState("Monday");

  const [week, setWeek] = useState(DAYS.reduce((a, d) => ({ ...a, [d]: [] }), {}));

  useEffect(() => {
    api.get("/admin/classes").then(r => setClasses(r.data));
    api.get("/admin/teachers").then(r => setTeachers(r.data));
  }, []);

  useEffect(() => {
    if (!isEdit || !classes.length) return;
    const c = classes.find(x => x.name === editClass && x.section === editSection);
    if (c) { setClassId(c._id); setSection(c.section); }
  }, [classes, isEdit, editClass, editSection]);

  useEffect(() => {
    if (!isEdit || !classId) return;
    api.get("/timetable/admin/by-class", { params: { classId, section } }).then(res => {
      const blank = DAYS.reduce((a, d) => ({ ...a, [d]: [] }), {});
      res.data.forEach(r => { blank[r.day] = r.periods || []; });
      setWeek(blank);
    });
  }, [isEdit, classId, section]);

  /* ===== ACTIONS ===== */
  const addPeriod = (day) => {
    if (!classId) return alert("Select a class first");
    setWeek(w => ({
      ...w,
      [day]: [...w[day], { startTime: "", endTime: "", subject: "", teacherId: "", autoEnd: true }]
    }));
  };

  const update = (day, i, field, val) => {
    setWeek(w => {
      const arr = [...w[day]];
      const p = { ...arr[i] };
      if (field === "startTime") {
        p.startTime = val;
        if (p.autoEnd) p.endTime = addMinutes(val, DEFAULT_DURATION);
      } else if (field === "endTime") {
        p.endTime = val; p.autoEnd = false;
      } else {
        p[field] = val;
      }
      arr[i] = p;
      arr.sort((a, b) => a.startTime.localeCompare(b.startTime));
      return { ...w, [day]: arr };
    });
  };

  const removePeriod = (day, i) =>
    setWeek(w => ({ ...w, [day]: w[day].filter((_, x) => x !== i) }));

  const saveAll = async () => {
    if (!classId) return alert("Select a class");
    for (const d of DAYS) {
      for (const p of week[d])
        if (!p.startTime || !p.endTime || !p.subject || !p.teacherId)
          return alert(`Fill all fields on ${d}`);
      if (hasOverlap(week[d])) return alert(`Time overlap on ${d}`);
    }
    setIsSaving(true);
    const payload = DAYS.map(d => ({ day: d, periods: week[d] })).filter(x => x.periods.length);
    try {
      await api[isEdit ? "put" : "post"](
        isEdit ? "/timetable/admin/update-week" : "/timetable/admin/week",
        { classId, section, days: payload }
      );
      alert(isEdit ? "Timetable Updated" : "Timetable Published");
    } catch (e) {
      alert(e.response?.data?.message || "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  /* total periods across all days */
  const totalPeriods = DAYS.reduce((s, d) => s + week[d].length, 0);

  /* ===== UI ===== */
  return (
    <div className="space-y-5 text-gray-100">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isEdit ? "Edit Timetable" : "Create Timetable"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Manual + Bulk CSV timetable management</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowCsv(true)}
            disabled={!classId && !isEdit}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-40 transition"
          >
            <Upload size={15} /> Bulk CSV
          </button>

          <button
            onClick={saveAll}
            disabled={isSaving || (!isEdit && !classId)}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition"
          >
            <Save size={15} className={isSaving ? "animate-spin" : ""} />
            {isSaving ? "Saving…" : isEdit ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      {/* CLASS SELECT + STATS ROW */}
      <div className="flex flex-wrap items-center gap-3">
        {!isEdit && (
          <select
            className="bg-white/[0.05] border border-white/10 text-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/60 transition"
            value={classId}
            onChange={e => {
              const id = e.target.value;
              setClassId(id);
              const c = classes.find(x => x._id === id);
              setSection(c?.section || "");
            }}
          >
            <option value="" className="bg-[#1a1a1a]">Select Class</option>
            {classes.map(c => (
              <option key={c._id} value={c._id} className="bg-[#1a1a1a]">
                Class {c.name} — {c.section}
              </option>
            ))}
          </select>
        )}

        {isEdit && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold">
            Class {editClass} — Section {editSection}
          </div>
        )}

        {totalPeriods > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white/[0.04] border border-white/[0.07] px-3 py-2 rounded-xl">
            <Clock size={13} /> {totalPeriods} period{totalPeriods !== 1 ? "s" : ""} total
          </div>
        )}
      </div>

      {/* DAY TABS */}
      <div className="flex gap-1 flex-wrap">
        {DAYS.map(day => {
          const count = week[day].length;
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition
                ${activeDay === day
                  ? "bg-indigo-600 text-white"
                  : "bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:bg-white/[0.08] hover:text-gray-200"
                }`}
            >
              {DAY_SHORT[day]}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-md font-semibold
                  ${activeDay === day ? "bg-white/20 text-white" : "bg-white/10 text-gray-500"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ACTIVE DAY PANEL */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#161616] overflow-hidden">
        {/* day header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{activeDay}</span>
            <span className="text-xs text-gray-600">{week[activeDay].length} period{week[activeDay].length !== 1 ? "s" : ""}</span>
          </div>
          <button
            onClick={() => addPeriod(activeDay)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/25 transition"
          >
            <Plus size={13} /> Add Period
          </button>
        </div>

        <div className="p-5 space-y-3 min-h-[200px]">
          {week[activeDay].length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
                <Clock size={18} className="text-gray-600" />
              </div>
              <p className="text-sm text-gray-600">No periods yet</p>
              <button
                onClick={() => addPeriod(activeDay)}
                className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition"
              >
                + Add first period
              </button>
            </div>
          ) : (
            week[activeDay].map((p, i) => (
              <PeriodRow
                key={i}
                period={p}
                index={i}
                teachers={teachers}
                onUpdate={(field, val) => update(activeDay, i, field, val)}
                onRemove={() => removePeriod(activeDay, i)}
              />
            ))
          )}
        </div>
      </div>

      {/* ALL DAYS MINI OVERVIEW */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {DAYS.map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`rounded-xl border p-3 text-left transition
              ${activeDay === day
                ? "border-indigo-500/40 bg-indigo-500/10"
                : "border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06]"
              }`}
          >
            <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${activeDay === day ? "text-indigo-400" : "text-gray-600"}`}>
              {DAY_SHORT[day]}
            </p>
            {week[day].length === 0 ? (
              <p className="text-xs text-gray-700">Empty</p>
            ) : (
              <div className="space-y-1">
                {week[day].slice(0, 3).map((p, i) => (
                  <div key={i} className={`text-xs px-2 py-1 rounded-md border-l-2 ${getSubjectColor(p.subject || "—")}`}>
                    <p className="font-medium text-gray-300 truncate">{p.subject || "—"}</p>
                    {p.startTime && <p className="text-gray-600">{formatTime(p.startTime)}</p>}
                  </div>
                ))}
                {week[day].length > 3 && (
                  <p className="text-[11px] text-gray-600">+{week[day].length - 3} more</p>
                )}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* CSV MODAL */}
      {showCsv && (
        <AdminTimetableCsvUploadAndPreview
          classId={classId}
          section={section}
          onClose={() => setShowCsv(false)}
        />
      )}
    </div>
  );
}

/* =====================================================
   PERIOD ROW
===================================================== */
function PeriodRow({ period, index, teachers, onUpdate, onRemove }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Period {index + 1}</span>
        <button
          onClick={onRemove}
          className="p-1 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] text-gray-600 mb-1 block">Start Time</label>
          <input
            type="time"
            value={period.startTime}
            onChange={e => onUpdate("startTime", e.target.value)}
            className="w-full bg-white/[0.05] border border-white/10 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition"
          />
        </div>
        <div>
          <label className="text-[11px] text-gray-600 mb-1 block">End Time</label>
          <input
            type="time"
            value={period.endTime}
            onChange={e => onUpdate("endTime", e.target.value)}
            className="w-full bg-white/[0.05] border border-white/10 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition"
          />
        </div>
      </div>

      <div>
        <label className="text-[11px] text-gray-600 mb-1 block">Subject</label>
        <input
          placeholder="e.g. Mathematics"
          value={period.subject}
          onChange={e => onUpdate("subject", e.target.value)}
          className="w-full bg-white/[0.05] border border-white/10 text-gray-200 placeholder-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition"
        />
      </div>

      <div>
        <label className="text-[11px] text-gray-600 mb-1 block">Teacher</label>
        <select
          value={period.teacherId}
          onChange={e => onUpdate("teacherId", e.target.value)}
          className="w-full bg-white/[0.05] border border-white/10 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition"
        >
          <option value="" className="bg-[#1a1a1a]">Select Teacher</option>
          {teachers.map(t => (
            <option key={t._id} value={t._id} className="bg-[#1a1a1a]">{t.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
