import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import api from "../../services/api";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const formatTime = (time) => {
  if (!time) return "";
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${m} ${ampm}`;
};

export default function AdminTimetableList() {
  const [data, setData] = useState([]);
  const [activeKey, setActiveKey] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/timetable/admin/all")
      .then(res => setData(res.data))
      .catch(() => setData([]));
  }, []);

  /* ================= NORMALIZE DATA ================= */
  const classes = useMemo(() => {
    const map = {};
    data.forEach(t => {
      if (!t?.classId) return;
      const key = `${t.classId.name}-${t.classId.section}`;
      if (!map[key]) {
        map[key] = {
          key,
          className: t.classId.name,
          section: t.classId.section,
          updatedAt: t.updatedAt,
          days: {}
        };
      }
      map[key].days[t.day] = t.periods || [];
      if (new Date(t.updatedAt) > new Date(map[key].updatedAt)) {
        map[key].updatedAt = t.updatedAt;
      }
    });
    return Object.values(map);
  }, [data]);

  /* ================= SEARCH FILTER ================= */
  const filteredClasses = useMemo(() => {
    if (!search.trim()) return classes;
    const q = search.toLowerCase();
    return classes.filter(cls =>
      cls.className.toLowerCase().includes(q) ||
      cls.section.toLowerCase().includes(q) ||
      `${cls.className}-${cls.section}`.toLowerCase().includes(q)
    );
  }, [classes, search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-sky-50 px-6 py-12">

      {/* ===== HEADER ===== */}
      <div className="max-w-7xl mx-auto mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Academic Timetable
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Smart class & section overview
        </p>
      </div>

      {/* ===== SEARCH ===== */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search class or section (10, A, 12-B)"
            className="
              w-full
              pl-12
              pr-4
              py-3.5
              rounded-2xl
              border border-white/60
              bg-white/70
              backdrop-blur
              shadow-lg
              focus:outline-none
              focus:ring-2
              focus:ring-indigo-500
            "
          />
        </div>
      </div>

      {/* ===== LIST ===== */}
      <div className="max-w-7xl mx-auto space-y-6">
        {filteredClasses.length ? (
          filteredClasses.map(cls => {
            const open = activeKey === cls.key;

            return (
              <div
                key={cls.key}
                className={`
                  rounded-3xl
                  border
                  bg-white
                  transition-all
                  ${open ? "shadow-2xl ring-1 ring-indigo-200" : "shadow-md"}
                `}
              >
                {/* HEADER */}
                <button
                  onClick={() => setActiveKey(open ? null : cls.key)}
                  className="w-full flex justify-between items-center px-8 py-6 hover:bg-indigo-50/40 transition"
                >
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900">
                      Class {cls.className}
                      <span className="text-gray-500 font-semibold">
                        {" "}— Section {cls.section}
                      </span>
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Updated {new Date(cls.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  {open ? <ChevronDown size={26} /> : <ChevronRight size={26} />}
                </button>

                {/* BODY */}
                {open && (
                  <>
                    {/* ACTION */}
                    <div className="flex justify-end px-8 py-4 border-t bg-gradient-to-r from-indigo-50 to-sky-50">
                      <button
                        onClick={() =>
                          navigate(`/admin/timetable/create?class=${cls.className}&section=${cls.section}`)
                        }
                        className="
                          bg-indigo-600
                          text-white
                          px-6
                          py-2.5
                          rounded-xl
                          font-bold
                          shadow-md
                          hover:bg-indigo-700
                        "
                      >
                        Edit Timetable
                      </button>
                    </div>

                    {/* GRID */}
                    <div className="overflow-x-auto border-t">
                      <div className="min-w-[1100px] grid grid-cols-6">
                        {DAYS.map(day => (
                          <div key={day} className="border-r last:border-r-0">
                            <div className="bg-indigo-900 text-white text-center py-3 font-extrabold tracking-wide">
                              {day}
                            </div>

                            <div className="p-4 space-y-4 min-h-[240px] bg-indigo-50/40">
                              {cls.days[day]?.length ? (
                                cls.days[day].map((p, i) => (
                                  <div
                                    key={i}
                                    className="
                                      bg-white
                                      rounded-2xl
                                      p-4
                                      shadow
                                      hover:shadow-xl
                                      border border-indigo-100
                                      transition
                                    "
                                  >
                                    <div className="text-lg font-extrabold text-gray-900">
                                      {p.subject}
                                    </div>
                                    <div className="inline-block mt-2 px-3 py-1 rounded-full text-sm font-bold bg-indigo-100 text-indigo-700">
                                      {formatTime(p.startTime)} – {formatTime(p.endTime)}
                                    </div>
                                    <div className="mt-2 text-sm font-semibold text-gray-700">
                                      👤 {p.teacherId?.name || "—"}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center text-gray-400 font-semibold pt-10">
                                  No Periods
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-500 font-semibold py-24">
            No class / section found
          </div>
        )}
      </div>
    </div>
  );
}
