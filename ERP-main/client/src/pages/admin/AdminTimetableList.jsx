import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Search, Edit2, Clock, BookOpen, User, Calendar } from "lucide-react";
import api from "../../services/api";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const DAY_SHORT = { Monday:"Mon", Tuesday:"Tue", Wednesday:"Wed", Thursday:"Thu", Friday:"Fri", Saturday:"Sat" };

const formatTime = (time) => {
  if (!time) return "";
  const [h, m] = time.split(":");
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
};

/* subject → consistent colour */
const SUBJECT_COLORS = [
  { bg: "bg-indigo-500/15",  text: "text-indigo-400",  border: "border-l-indigo-500"  },
  { bg: "bg-sky-500/15",     text: "text-sky-400",     border: "border-l-sky-500"     },
  { bg: "bg-violet-500/15",  text: "text-violet-400",  border: "border-l-violet-500"  },
  { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-l-emerald-500" },
  { bg: "bg-rose-500/15",    text: "text-rose-400",    border: "border-l-rose-500"    },
  { bg: "bg-amber-500/15",   text: "text-amber-400",   border: "border-l-amber-500"   },
  { bg: "bg-cyan-500/15",    text: "text-cyan-400",    border: "border-l-cyan-500"    },
  { bg: "bg-pink-500/15",    text: "text-pink-400",    border: "border-l-pink-500"    },
];
const colorMap = {};
let colorIdx = 0;
const getColor = (sub) => {
  if (!colorMap[sub]) colorMap[sub] = SUBJECT_COLORS[colorIdx++ % SUBJECT_COLORS.length];
  return colorMap[sub];
};

/* =====================================================
   MAIN
===================================================== */
export default function AdminTimetableList() {
  const [data, setData]         = useState([]);
  const [activeKey, setActiveKey] = useState(null);
  const [search, setSearch]     = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/timetable/admin/all")
      .then(res => setData(res.data))
      .catch(() => setData([]));
  }, []);

  /* normalise */
  const classes = useMemo(() => {
    const map = {};
    data.forEach(t => {
      if (!t?.classId) return;
      const key = `${t.classId.name}-${t.classId.section}`;
      if (!map[key]) map[key] = {
        key,
        className: t.classId.name,
        section: t.classId.section,
        updatedAt: t.updatedAt,
        days: {}
      };
      map[key].days[t.day] = t.periods || [];
      if (new Date(t.updatedAt) > new Date(map[key].updatedAt))
        map[key].updatedAt = t.updatedAt;
    });
    return Object.values(map);
  }, [data]);

  const filtered = useMemo(() => {
    if (!search.trim()) return classes;
    const q = search.toLowerCase();
    return classes.filter(c =>
      c.className.toLowerCase().includes(q) ||
      c.section.toLowerCase().includes(q) ||
      `${c.className}-${c.section}`.toLowerCase().includes(q)
    );
  }, [classes, search]);

  /* global stats */
  const totalPeriods = useMemo(() =>
    classes.reduce((s, c) => s + DAYS.reduce((ss, d) => ss + (c.days[d]?.length || 0), 0), 0),
  [classes]);

  return (
    <div className="space-y-5 text-gray-100">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Timetable</h1>
          <p className="text-sm text-gray-500 mt-0.5">Class & section schedule overview</p>
        </div>

        {/* stats */}
        <div className="flex gap-3">
          <StatPill icon={<BookOpen size={13} />} label="Classes" value={classes.length} />
          <StatPill icon={<Clock size={13} />}    label="Periods" value={totalPeriods}   />
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={15} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search class or section…"
          className="w-full bg-white/[0.05] border border-white/10 text-gray-200 placeholder-gray-600 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition"
        />
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-3">
              <Calendar size={20} className="text-gray-600" />
            </div>
            <p className="text-sm text-gray-600">No timetables found</p>
          </div>
        ) : (
          filtered.map(cls => {
            const open = activeKey === cls.key;
            const totalCls = DAYS.reduce((s, d) => s + (cls.days[d]?.length || 0), 0);
            const daysWithPeriods = DAYS.filter(d => cls.days[d]?.length > 0).length;

            return (
              <div
                key={cls.key}
                className={`rounded-2xl border transition-all overflow-hidden
                  ${open ? "border-indigo-500/30 bg-[#161616]" : "border-white/[0.07] bg-[#161616] hover:border-white/[0.12]"}`}
              >
                {/* ROW HEADER */}
                <button
                  onClick={() => setActiveKey(open ? null : cls.key)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition"
                >
                  <div className="flex items-center gap-4">
                    {/* avatar */}
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-indigo-400">{cls.className}</span>
                    </div>

                    <div className="text-left">
                      <p className="font-semibold text-white text-sm">
                        Class {cls.className}
                        <span className="text-gray-500 font-normal"> — Section {cls.section}</span>
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Updated {new Date(cls.updatedAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* mini stats */}
                    <div className="hidden sm:flex items-center gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1"><Clock size={12} />{totalCls} periods</span>
                      <span className="flex items-center gap-1"><Calendar size={12} />{daysWithPeriods} days</span>
                    </div>

                    {/* day dots */}
                    <div className="hidden md:flex gap-1">
                      {DAYS.map(d => (
                        <div
                          key={d}
                          title={d}
                          className={`w-1.5 h-1.5 rounded-full ${cls.days[d]?.length ? "bg-indigo-400" : "bg-white/10"}`}
                        />
                      ))}
                    </div>

                    <ChevronDown size={16} className={`text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {/* EXPANDED BODY */}
                {open && (
                  <div className="border-t border-white/[0.06]">

                    {/* action bar */}
                    <div className="flex items-center justify-between px-5 py-3 bg-white/[0.02] border-b border-white/[0.05]">
                      <div className="flex gap-2">
                        {DAYS.map(d => (
                          <span
                            key={d}
                            className={`text-[11px] px-2 py-0.5 rounded-md font-medium
                              ${cls.days[d]?.length
                                ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/25"
                                : "bg-white/[0.04] text-gray-700 border border-white/[0.06]"
                              }`}
                          >
                            {DAY_SHORT[d]}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => navigate(`/admin/timetable/create?class=${cls.className}&section=${cls.section}`)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
                      >
                        <Edit2 size={13} /> Edit Timetable
                      </button>
                    </div>

                    {/* TIMETABLE GRID */}
                    <div className="overflow-x-auto">
                      <div className="min-w-[700px] grid grid-cols-6 divide-x divide-white/[0.05]">
                        {DAYS.map(day => (
                          <div key={day}>
                            {/* day header */}
                            <div className="px-3 py-2.5 bg-white/[0.03] border-b border-white/[0.05] text-center">
                              <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                                {DAY_SHORT[day]}
                              </span>
                            </div>

                            {/* periods */}
                            <div className="p-3 space-y-2 min-h-[160px]">
                              {cls.days[day]?.length ? (
                                cls.days[day].map((p, i) => {
                                  const c = getColor(p.subject);
                                  return (
                                    <div
                                      key={i}
                                      className={`rounded-lg border-l-2 ${c.border} ${c.bg} px-2.5 py-2`}
                                    >
                                      <p className={`text-xs font-semibold ${c.text} truncate`}>{p.subject}</p>
                                      <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                                        <Clock size={10} />
                                        {formatTime(p.startTime)}–{formatTime(p.endTime)}
                                      </p>
                                      {p.teacherId?.name && (
                                        <p className="text-[11px] text-gray-600 mt-0.5 flex items-center gap-1 truncate">
                                          <User size={10} /> {p.teacherId.name}
                                        </p>
                                      )}
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="flex items-center justify-center h-full pt-6">
                                  <span className="text-[11px] text-gray-700">—</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* =====================================================
   SMALL
===================================================== */
function StatPill({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2">
      <span className="text-gray-500">{icon}</span>
      <div>
        <p className="text-[11px] text-gray-600 uppercase tracking-wider font-medium">{label}</p>
        <p className="text-base font-bold text-white leading-none">{value}</p>
      </div>
    </div>
  );
}
