import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import {
  BookOpen, Users, GraduationCap, Clock,
  ChevronDown, X, BarChart2, Calendar
} from "lucide-react";

/* subject → consistent colour */
const SUBJECT_COLORS = [
  { bg: "bg-indigo-500/15",  text: "text-indigo-400",  border: "border-indigo-500/25"  },
  { bg: "bg-sky-500/15",     text: "text-sky-400",     border: "border-sky-500/25"     },
  { bg: "bg-violet-500/15",  text: "text-violet-400",  border: "border-violet-500/25"  },
  { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/25" },
  { bg: "bg-rose-500/15",    text: "text-rose-400",    border: "border-rose-500/25"    },
  { bg: "bg-amber-500/15",   text: "text-amber-400",   border: "border-amber-500/25"   },
  { bg: "bg-cyan-500/15",    text: "text-cyan-400",    border: "border-cyan-500/25"    },
  { bg: "bg-pink-500/15",    text: "text-pink-400",    border: "border-pink-500/25"    },
];

function subjectColor(name, map) {
  if (!map[name]) {
    const keys = Object.keys(map);
    map[name] = SUBJECT_COLORS[keys.length % SUBJECT_COLORS.length];
  }
  return map[name];
}

/* =====================================================
   MAIN PAGE
===================================================== */
export default function AdminAcademicStructure() {
  const [data, setData]               = useState({});
  const [loading, setLoading]         = useState(true);
  const [activeTeacher, setActiveTeacher] = useState(null);
  const [search, setSearch]           = useState("");

  useEffect(() => {
    api.get("/admin/academic-structure")
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  /* global stats */
  const globalStats = useMemo(() => {
    let classes = 0, sections = 0, subjects = new Set(), teachers = new Set();
    Object.values(data).forEach(secs => {
      classes++;
      Object.values(secs).forEach(subMap => {
        sections++;
        Object.entries(subMap).forEach(([sub, info]) => {
          subjects.add(sub);
          info.teacherName?.split(", ").forEach(t => teachers.add(t));
        });
      });
    });
    return { classes, sections, subjects: subjects.size, teachers: teachers.size };
  }, [data]);

  const colorMap = useMemo(() => ({}), []);

  const filteredEntries = useMemo(() =>
    Object.entries(data).filter(([cls]) =>
      cls.toLowerCase().includes(search.toLowerCase())
    ), [data, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-600 text-sm">
        Loading academic structure…
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-100">

      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Academic Structure</h1>
          <p className="text-sm text-gray-500 mt-0.5">Timetable-driven subject & teacher overview</p>
        </div>

        {/* search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            placeholder="Search class…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-white/[0.05] border border-white/10 text-gray-200 placeholder-gray-600 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition w-52"
          />
        </div>
      </div>

      {/* ===== GLOBAL STATS ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<GraduationCap size={16} />} label="Classes"  value={globalStats.classes}  color="indigo" />
        <StatCard icon={<BarChart2    size={16} />} label="Sections" value={globalStats.sections} color="sky"    />
        <StatCard icon={<BookOpen     size={16} />} label="Subjects" value={globalStats.subjects}  color="violet"/>
        <StatCard icon={<Users        size={16} />} label="Teachers" value={globalStats.teachers}  color="emerald"/>
      </div>

      {/* ===== CLASS BLOCKS ===== */}
      <div className="space-y-4">
        {filteredEntries.map(([className, sections]) => (
          <ClassBlock
            key={className}
            className={className}
            sections={sections}
            colorMap={colorMap}
            onTeacherClick={setActiveTeacher}
          />
        ))}
      </div>

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
   STAT CARD
===================================================== */
const STAT_COLORS = {
  indigo:  { bg: "bg-indigo-500/10",  text: "text-indigo-400",  border: "border-indigo-500/20"  },
  sky:     { bg: "bg-sky-500/10",     text: "text-sky-400",     border: "border-sky-500/20"     },
  violet:  { bg: "bg-violet-500/10",  text: "text-violet-400",  border: "border-violet-500/20"  },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
};

function StatCard({ icon, label, value, color }) {
  const c = STAT_COLORS[color];
  return (
    <div className={`flex items-center gap-3 rounded-xl border ${c.border} ${c.bg} px-4 py-3`}>
      <div className={`${c.text}`}>{icon}</div>
      <div>
        <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">{label}</p>
        <p className="text-xl font-bold text-white leading-none mt-0.5">{value}</p>
      </div>
    </div>
  );
}

/* =====================================================
   CLASS BLOCK (collapsible)
===================================================== */
function ClassBlock({ className, sections, colorMap, onTeacherClick }) {
  const [open, setOpen]             = useState(true);
  const [sectionFilter, setSectionFilter] = useState("ALL");
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [teacherFilter, setTeacherFilter] = useState("ALL");

  const sectionOptions = ["ALL", ...Object.keys(sections)];

  const subjectOptions = useMemo(() => {
    const s = new Set();
    Object.values(sections).forEach(sec => Object.keys(sec).forEach(sub => s.add(sub)));
    return ["ALL", ...Array.from(s)];
  }, [sections]);

  const teacherOptions = useMemo(() => {
    const s = new Set();
    Object.values(sections).forEach(sec =>
      Object.values(sec).forEach(info => info.teacherName?.split(", ").forEach(t => s.add(t)))
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
        if (teacherFilter !== "ALL" && !info.teacherName?.split(", ").includes(teacherFilter)) return;
        fs[sub] = info;
      });
      if (Object.keys(fs).length) out[sec] = fs;
    });
    return out;
  }, [sections, sectionFilter, subjectFilter, teacherFilter]);

  const summary = useMemo(() => {
    const subs = new Set(), teachers = new Set();
    let totalPeriods = 0;
    Object.values(filteredSections).forEach(sec =>
      Object.entries(sec).forEach(([sub, info]) => {
        subs.add(sub);
        info.teacherName?.split(", ").forEach(t => teachers.add(t));
        totalPeriods += info.periodsPerWeek || 0;
      })
    );
    return { sections: Object.keys(filteredSections).length, subjects: subs.size, teachers: teachers.size, totalPeriods };
  }, [filteredSections]);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#161616] overflow-hidden">

      {/* CLASS HEADER */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center">
            <span className="text-sm font-bold text-indigo-400">{className.replace(/\D/g, "") || className.charAt(0)}</span>
          </div>
          <div className="text-left">
            <p className="font-semibold text-white text-sm">{className}</p>
            <p className="text-xs text-gray-600">{summary.sections} section{summary.sections !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* mini stats */}
          <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><BookOpen size={12} />{summary.subjects} subjects</span>
            <span className="flex items-center gap-1"><Users size={12} />{summary.teachers} teachers</span>
            <span className="flex items-center gap-1"><Clock size={12} />{summary.totalPeriods} periods/wk</span>
          </div>
          <ChevronDown size={16} className={`text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="border-t border-white/[0.06] px-5 py-4 space-y-4">

          {/* FILTERS */}
          <div className="flex flex-wrap gap-2">
            <DarkSelect label="Section" value={sectionFilter} onChange={setSectionFilter} options={sectionOptions} />
            <DarkSelect label="Subject" value={subjectFilter} onChange={setSubjectFilter} options={subjectOptions} />
            <DarkSelect label="Teacher" value={teacherFilter} onChange={setTeacherFilter} options={teacherOptions} />
          </div>

          {/* SECTIONS */}
          <div className="space-y-3">
            {Object.entries(filteredSections).map(([sec, subjects]) => (
              <SectionBlock
                key={sec}
                section={sec}
                subjects={subjects}
                colorMap={colorMap}
                onTeacherClick={onTeacherClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* =====================================================
   SECTION BLOCK
===================================================== */
function SectionBlock({ section, subjects, colorMap, onTeacherClick }) {
  const rows = Object.entries(subjects);

  return (
    <div className="rounded-xl border border-white/[0.06] overflow-hidden">
      {/* section label */}
      <div className="px-4 py-2 bg-white/[0.03] border-b border-white/[0.06] flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
          Section {section}
        </span>
        <span className="text-[11px] text-gray-600">{rows.length} subject{rows.length !== 1 ? "s" : ""}</span>
      </div>

      {/* table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-600">Subject</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-600">Teacher</th>
              <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-600">Periods / Week</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {rows.map(([sub, info]) => {
              const c = subjectColor(sub, colorMap);
              return (
                <tr key={sub} className="hover:bg-white/[0.03] transition">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
                      {sub}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {info.teacherId ? (
                      <button
                        onClick={() => onTeacherClick({ id: info.teacherId, name: info.teacherName })}
                        className="flex items-center gap-2 group"
                      >
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-400 flex-shrink-0">
                          {info.teacherName?.charAt(0)}
                        </div>
                        <span className="text-indigo-400 group-hover:text-indigo-300 group-hover:underline transition text-sm">
                          {info.teacherName}
                        </span>
                      </button>
                    ) : (
                      <span className="text-gray-600 text-sm">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.05] text-white font-semibold text-sm tabular-nums">
                      {info.periodsPerWeek}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =====================================================
   TEACHER WORKLOAD MODAL
===================================================== */
function TeacherWorkloadModal({ teacher, onClose }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/admin/teachers/${teacher.id}/workload`).then(res => setData(res.data));
  }, [teacher.id]);

  const DAY_ORDER = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  const summary = useMemo(() => {
    if (!data?.days) return [];
    const map = {};
    Object.values(data.days).forEach(rows =>
      rows.forEach(r => {
        const key = `${r.subject}_${r.class}_${r.section}`;
        if (!map[key]) map[key] = { subject: r.subject, class: r.class, section: r.section, count: 0 };
        map[key].count++;
      })
    );
    return Object.values(map);
  }, [data]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#161616] border border-white/10 w-full max-w-3xl max-h-[88vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* HEADER */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-base">
              {data?.teacher?.charAt(0) ?? "…"}
            </div>
            <div>
              <h2 className="font-semibold text-white">{data?.teacher ?? "Loading…"}</h2>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <Calendar size={11} /> Weekly Teaching Workload
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition">
            <X size={18} />
          </button>
        </div>

        {!data ? (
          <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">Loading…</div>
        ) : (
          <>
            {/* SUMMARY STRIP */}
            <div className="px-6 py-3 border-b border-white/[0.06] flex gap-3 overflow-x-auto">
              {summary.map((s, i) => (
                <div key={i} className="min-w-[180px] rounded-xl bg-white/[0.04] border border-white/[0.07] px-4 py-3 flex-shrink-0">
                  <p className="font-semibold text-white text-sm">{s.subject}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Class {s.class} · Sec {s.section}</p>
                  <p className="mt-2 text-xs font-semibold text-indigo-400">{s.count} periods / week</p>
                </div>
              ))}
              <div className="min-w-[140px] rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-4 py-3 flex-shrink-0 flex flex-col justify-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total Load</p>
                <p className="text-2xl font-bold text-indigo-400 mt-1">{data.totalPeriods}</p>
                <p className="text-[11px] text-gray-600">periods / week</p>
              </div>
            </div>

            {/* DAY TIMELINE */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {DAY_ORDER.map(day => {
                const rows = data.days[day] || [];
                return (
                  <div key={day} className="flex gap-4">
                    <div className="w-12 flex-shrink-0 pt-1">
                      <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                        {day.slice(0, 3)}
                      </span>
                    </div>
                    <div className="flex-1">
                      {rows.length === 0 ? (
                        <div className="text-xs text-gray-700 py-2 italic">No classes</div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {rows.map((r, i) => (
                            <div key={i} className="rounded-xl bg-white/[0.04] border border-white/[0.07] px-3 py-2.5 min-w-[200px]">
                              <p className="font-semibold text-white text-sm">{r.subject}</p>
                              <p className="text-xs text-gray-500 mt-0.5">Class {r.class} · Sec {r.section}</p>
                              <p className="mt-1.5 text-xs text-indigo-400 font-medium flex items-center gap-1">
                                <Clock size={11} /> {r.startTime} – {r.endTime}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* FOOTER */}
            <div className="px-6 py-3 border-t border-white/[0.06] flex justify-between items-center text-sm">
              <span className="text-gray-500">Total Periods / Week</span>
              <span className="font-bold text-white text-lg">{data.totalPeriods}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* =====================================================
   SMALL UI
===================================================== */
function DarkSelect({ label, value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-white/[0.05] border border-white/10 text-gray-300 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-indigo-500/60 transition"
    >
      {options.map(o => (
        <option key={o} value={o} className="bg-[#1a1a1a]">
          {o === "ALL" ? `All ${label}s` : o}
        </option>
      ))}
    </select>
  );
}
