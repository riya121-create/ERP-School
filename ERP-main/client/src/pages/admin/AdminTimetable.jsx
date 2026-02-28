import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";
import {
  Plus, Save, Trash2, Clock, BookOpen, User
} from "lucide-react";
import AdminTimetableCsvUploadAndPreview from "./AdminTimetableCsvUploadAndPreview";


const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DEFAULT_DURATION = 50;

/* ================= HELPERS ================= */
const addMinutes = (time, min) => {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m + min, 0, 0);
  return d.toTimeString().slice(0, 5);
};

const hasOverlap = (periods) => {
  for (let i = 0; i < periods.length; i++) {
    for (let j = i + 1; j < periods.length; j++) {
      const a = periods[i], b = periods[j];
      if (
        a.startTime && a.endTime &&
        b.startTime && b.endTime &&
        a.startTime < b.endTime &&
        a.endTime > b.startTime
      ) return true;
    }
  }
  return false;
};

/* ================= COMPONENT ================= */
export default function AdminTimetable() {

  /* ---------- EDIT MODE ---------- */
  const [params] = useSearchParams();
  const editClass = params.get("class");
  const editSection = params.get("section");
  const isEdit = Boolean(editClass && editSection);

  /* ---------- STATE ---------- */
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classId, setClassId] = useState("");
  const [section, setSection] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showCsv, setShowCsv] = useState(false);

  const [week, setWeek] = useState(
    DAYS.reduce((a, d) => ({ ...a, [d]: [] }), {})
  );

  /* ================= LOAD MASTER DATA ================= */
  useEffect(() => {
    api.get("/admin/classes").then(r => setClasses(r.data));
    api.get("/admin/teachers").then(r => setTeachers(r.data));
  }, []);

  /* ================= AUTO SELECT CLASS (EDIT MODE) ================= */
  useEffect(() => {
    if (!isEdit || !classes.length) return;

    const c = classes.find(
      x => x.name === editClass && x.section === editSection
    );

    if (c) {
      setClassId(c._id);
      setSection(c.section);
    }
  }, [classes, isEdit, editClass, editSection]);

  /* ================= LOAD EXISTING TIMETABLE ================= */
  useEffect(() => {
    if (!isEdit || !classId) return;

    api.get("/timetable/admin/by-class", {
      params: { classId, section }
    }).then(res => {
      const blank = DAYS.reduce((a, d) => ({ ...a, [d]: [] }), {});
      res.data.forEach(r => {
        blank[r.day] = r.periods || [];
      });
      setWeek(blank);
    });
  }, [isEdit, classId, section]);

  /* ================= ACTIONS ================= */
  const addPeriod = (day) => {
    if (!classId) return alert("⚠️ Select class first");

    setWeek(w => ({
      ...w,
      [day]: [...w[day], {
        startTime: "",
        endTime: "",
        subject: "",
        teacherId: "",
        autoEnd: true
      }]
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
        p.endTime = val;
        p.autoEnd = false;
      } else {
        p[field] = val;
      }

      arr[i] = p;
      arr.sort((a, b) => a.startTime.localeCompare(b.startTime));
      return { ...w, [day]: arr };
    });
  };

  const removePeriod = (day, i) => {
    setWeek(w => ({
      ...w,
      [day]: w[day].filter((_, x) => x !== i)
    }));
  };

  /* ================= SAVE ================= */
  const saveAll = async () => {
    if (!classId) return alert("⚠️ Select class");

    for (const d of DAYS) {
      for (const p of week[d]) {
        if (!p.startTime || !p.endTime || !p.subject || !p.teacherId) {
          return alert(`⚠️ Fill all fields on ${d}`);
        }
      }
      if (hasOverlap(week[d])) {
        return alert(`⛔ Time overlap on ${d}`);
      }
    }

    setIsSaving(true);

    const payload = DAYS
      .map(d => ({ day: d, periods: week[d] }))
      .filter(x => x.periods.length);

    try {
      await api[isEdit ? "put" : "post"](
        isEdit ? "/timetable/admin/update-week" : "/timetable/admin/week",
        { classId, section, days: payload }
      );
      alert(isEdit ? "✅ Timetable Updated" : "✅ Timetable Published");
    } catch (e) {
      alert(e.response?.data?.message || "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* ===== HEADER ===== */}
      <div className="bg-white rounded-xl shadow p-6 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            {isEdit ? "Edit Timetable" : "Create Timetable"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manual + Bulk CSV timetable management
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowCsv(true)}
            disabled={!classId && !isEdit}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-semibold"
          >
            📂 Bulk Upload (CSV)
          </button>

          <button
            onClick={saveAll}
            disabled={isSaving || (!isEdit && !classId)}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2"
          >
            <Save size={18} className={isSaving ? "animate-spin" : ""} />
            {isSaving ? "Saving..." : isEdit ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      {/* ===== CLASS SELECT ===== */}
      {!isEdit && (
        <select
          className="mb-6 px-4 py-2.5 rounded-lg border bg-white"
          value={classId}
          onChange={e => {
            const id = e.target.value;
            setClassId(id);
            const c = classes.find(x => x._id === id);
            setSection(c?.section || "");
          }}
        >
          <option value="">Select Class</option>
          {classes.map(c => (
            <option key={c._id} value={c._id}>
              {c.name} - {c.section}
            </option>
          ))}
        </select>
      )}

      {/* ===== WEEK GRID ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {DAYS.map(day => (
          <div key={day} className="bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold mb-3">{day}</h3>

            {week[day].map((p, i) => (
              <div key={i} className="border rounded-lg p-3 mb-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="time"
                    className="input"
                    value={p.startTime}
                    onChange={e => update(day, i, "startTime", e.target.value)}
                  />
                  <input
                    type="time"
                    className="input"
                    value={p.endTime}
                    onChange={e => update(day, i, "endTime", e.target.value)}
                  />
                </div>

                <input
                  placeholder="Subject"
                  className="input w-full"
                  value={p.subject}
                  onChange={e => update(day, i, "subject", e.target.value)}
                />

                <div className="flex gap-2">
                  <select
                    className="input flex-1"
                    value={p.teacherId}
                    onChange={e => update(day, i, "teacherId", e.target.value)}
                  >
                    <option value="">Teacher</option>
                    {teachers.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => removePeriod(day, i)}
                    className="text-red-500 px-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => addPeriod(day)}
              className="w-full border-2 border-dashed rounded-lg py-2 text-indigo-600 font-semibold"
            >
              <Plus size={16} className="inline mr-1" /> Add Period
            </button>
          </div>
        ))}
      </div>

      {/* ===== CSV MODAL ===== */}
      {showCsv && (
        <AdminTimetableCsvUploadAndPreview
          classId={classId}
          section={section}
          onClose={() => setShowCsv(false)}
        />
      )}

      <style>{`
        .input{
          border:1px solid #e5e7eb;
          border-radius:8px;
          padding:8px 10px;
          font-size:14px;
        }
      `}</style>
    </div>
  );
}
