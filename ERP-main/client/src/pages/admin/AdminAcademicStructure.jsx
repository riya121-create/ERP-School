import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

/* =====================================================
   MAIN PAGE
===================================================== */
export default function AdminAcademicStructure() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTeacher, setActiveTeacher] = useState(null);

  useEffect(() => {
    api
      .get("/admin/academic-structure")
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-gray-500">Loading…</div>;
  }

  return (
    <div className="p-8 space-y-10 font-sans">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          📘 Academic Structure
        </h1>
        <p className="text-sm text-gray-500">
          Timetable-driven academic overview
        </p>
      </header>

      {Object.entries(data).map(([className, sections]) => (
        <ClassBlock
          key={className}
          className={className}
          sections={sections}
          onTeacherClick={setActiveTeacher}
        />
      ))}

      {/* ===== TEACHER WORKLOAD MODAL ===== */}
      {activeTeacher && (
        <TeacherWorkloadModal
          teacher={activeTeacher}
          onClose={() => setActiveTeacher(null)}
        />
      )}
    </div>
  );
}

/* =====================================================
   CLASS BLOCK
===================================================== */
function ClassBlock({ className, sections, onTeacherClick }) {
  const [sectionFilter, setSectionFilter] = useState("ALL");
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [teacherFilter, setTeacherFilter] = useState("ALL");

  const sectionOptions = ["ALL", ...Object.keys(sections)];

  const subjectOptions = useMemo(() => {
    const s = new Set();
    Object.values(sections).forEach(sec =>
      Object.keys(sec).forEach(sub => s.add(sub))
    );
    return ["ALL", ...Array.from(s)];
  }, [sections]);

  const teacherOptions = useMemo(() => {
    const s = new Set();
    Object.values(sections).forEach(sec =>
      Object.values(sec).forEach(info => {
        if (info.teacherName) s.add(info.teacherName);
      })
    );
    return ["ALL", ...Array.from(s)];
  }, [sections]);

  const filteredSections = useMemo(() => {
    const out = {};
    Object.entries(sections).forEach(([sec, subjects]) => {
      if (sectionFilter !== "ALL" && sec !== sectionFilter) return;

      const fs = {};
      Object.entries(subjects).forEach(([sub, info]) => {
        if (subjectFilter !== "ALL" && sub !== subjectFilter) return;
        if (
  teacherFilter !== "ALL" &&
  !info.teacherName?.split(", ").includes(teacherFilter)
) return;

        fs[sub] = info;
      });

      if (Object.keys(fs).length) out[sec] = fs;
    });
    return out;
  }, [sections, sectionFilter, subjectFilter, teacherFilter]);

  const summary = useMemo(() => {
    const subs = new Set();
    const teachers = new Set();
    Object.values(filteredSections).forEach(sec =>
      Object.entries(sec).forEach(([sub, info]) => {
        subs.add(sub);
        info.teacherName
  ?.split(", ")
  .forEach(t => teachers.add(t));

      })
    );
    return {
      sections: Object.keys(filteredSections).length,
      subjects: subs.size,
      teachers: teachers.size
    };
  }, [filteredSections]);

  if (!Object.keys(filteredSections).length) return null;

  return (
    <section className="border rounded-2xl p-6 bg-white shadow space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {className}
          </h2>
          <p className="text-sm text-gray-500">
            Sections: {summary.sections}
          </p>
        </div>

        <div className="flex gap-4">
          <Stat label="Subjects" value={summary.subjects} />
          <Stat label="Teachers" value={summary.teachers} />
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3">
        <Filter label="Section" value={sectionFilter} onChange={setSectionFilter} options={sectionOptions} />
        <Filter label="Subject" value={subjectFilter} onChange={setSubjectFilter} options={subjectOptions} />
        <Filter label="Teacher" value={teacherFilter} onChange={setTeacherFilter} options={teacherOptions} />
      </div>

      {/* SECTIONS */}
      <div className="space-y-6">
        {Object.entries(filteredSections).map(([sec, subjects]) => (
          <SectionBlock
            key={sec}
            section={sec}
            subjects={subjects}
            onTeacherClick={onTeacherClick}
          />
        ))}
      </div>
    </section>
  );
}

/* =====================================================
   SECTION BLOCK
===================================================== */
function SectionBlock({ section, subjects, onTeacherClick }) {
  return (
    <div className="border rounded-xl p-4">
      <h4 className="text-xs font-semibold tracking-wide uppercase text-gray-600 mb-3">
        Section {section}
      </h4>

      <table className="w-full text-sm border">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 border text-left text-xs uppercase tracking-wide text-gray-600">
              Subject
            </th>
            <th className="p-2 border text-left text-xs uppercase tracking-wide text-gray-600">
              Teacher
            </th>
            <th className="p-2 border text-center text-xs uppercase tracking-wide text-gray-600">
              Periods / Week
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(subjects).map(([sub, info]) => (
            <tr key={sub} className="hover:bg-gray-50">
              <td className="p-2 border font-medium">{sub}</td>
              <td className="p-2 border">
                <button
                  onClick={() => {
  if (!info.teacherId) return;
  onTeacherClick({
    id: info.teacherId,
    name: info.teacherName
  });
}}

                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  {info.teacherName}
                </button>
              </td>
              <td className="p-2 border text-center font-mono tabular-nums">
                {info.periodsPerWeek}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* =====================================================
   TEACHER WORKLOAD MODAL (DAY-WISE)
===================================================== */
function TeacherWorkloadModal({ teacher, onClose }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    api
      .get(`/admin/teachers/${teacher.id}/workload`)
      .then(res => setData(res.data));
  }, [teacher.id]);

  const dayOrder = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  const summary = useMemo(() => {
    if (!data?.days) return [];
    const map = {};
    Object.values(data.days).forEach(rows => {
      rows.forEach(r => {
        const key = `${r.subject}_${r.class}_${r.section}`;

if (!map[key]) {
  map[key] = {
    subject: r.subject,
    class: r.class,
    section: r.section,
    count: 0
  };
}

map[key].count++;

      });
    });
    return Object.values(map);
  }, [data]);

  if (!data) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg px-6 py-4 shadow">
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-4xl h-[88vh] rounded-2xl shadow-xl flex flex-col">

        {/* ================= HEADER ================= */}
        <div className="px-8 py-5 border-b flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
              {data.teacher.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {data.teacher}
              </h2>
              <p className="text-sm text-gray-500">
                Weekly Teaching Workload
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black text-2xl"
          >
            ✕
          </button>
        </div>

        {/* ================= SUMMARY STRIP ================= */}
        <div className="px-8 py-4 bg-gray-50 border-b flex gap-4 overflow-x-auto">
          {summary.map((s, i) => (
            <div
              key={i}
              className="min-w-[220px] rounded-xl border bg-white p-4"
            >
              <div className="font-semibold text-gray-800">
                {s.subject}
              </div>
              <div className="text-sm text-gray-500">
                Class {s.class} • Section {s.section}
              </div>
              <div className="mt-2 text-sm font-medium text-blue-700">
                {s.count} periods / week
              </div>
            </div>
          ))}

          <div className="min-w-[180px] rounded-xl border bg-white p-4 flex flex-col justify-center">
            <div className="text-sm text-gray-500">
              Total Load
            </div>
            <div className="text-2xl font-semibold text-gray-800">
              {data.totalPeriods}
            </div>
          </div>
        </div>

        {/* ================= DAY TIMELINE ================= */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">

          {dayOrder.map(day => {
            const rows = data.days[day] || [];
            return (
              <div key={day} className="flex gap-6">
                <div className="w-20 text-sm font-semibold text-gray-600 pt-2">
                  {day.slice(0,3).toUpperCase()}
                </div>

                <div className="flex-1">
                  {rows.length === 0 ? (
                    <div className="text-sm text-gray-400 py-2">
                      No classes scheduled
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {rows.map((r, i) => (
                        <div
                          key={i}
                          className="rounded-xl border bg-white px-4 py-3 min-w-[260px]"
                        >
                          <div className="font-semibold text-gray-800">
                            {r.subject}
                          </div>
                          <div className="text-sm text-gray-500">
                            Class {r.class} • Section {r.section}
                          </div>
                          <div className="mt-1 text-sm font-medium text-gray-700">
  {r.startTime} – {r.endTime}
</div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

        </div>

        {/* ================= FOOTER ================= */}
        <div className="px-8 py-4 border-t flex justify-between items-center text-sm font-semibold">
          <span>Total Periods / Week</span>
          <span className="text-lg">{data.totalPeriods}</span>
        </div>
      </div>
    </div>
  );
}





/* =====================================================
   SMALL UI
===================================================== */
function Filter({ label, value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="px-3 py-2 rounded-lg border bg-white text-sm font-medium"
    >
      {options.map(o => (
        <option key={o} value={o}>
          {o === "ALL" ? `All ${label}s` : o}
        </option>
      ))}
    </select>
  );
}

function Stat({ label, value }) {
  return (
    <div className="px-4 py-2 rounded-xl bg-gray-100 text-center">
      <div className="text-xl font-semibold tabular-nums">
        {value}
      </div>
      <div className="text-[11px] uppercase tracking-wide text-gray-500">
        {label}
      </div>
    </div>
  );
}
