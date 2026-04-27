import { useEffect, useState } from "react";
import api from "../../services/api";
import BackButton from "../../components/BackButton";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const formatTime = (time) => {
  if (!time) return "";
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${m} ${ampm}`;
};

export default function TeacherTimetablePage() {
  const [dayMap, setDayMap] = useState({});

  useEffect(() => {
    api.get("/timetable/teacher").then(res => {
      const map = {};
      res.data.forEach(t => {
        if (!map[t.day]) map[t.day] = [];
        map[t.day].push(t);
      });
      setDayMap(map);
    });
  }, []);

  return (
    <div className="text-white">

      {/* ===== HEADER ===== */}
      <div className="max-w-[1600px] mx-auto mb-12">
        <BackButton to="/teacher" label="Dashboard" />
        <h1 className="text-4xl font-extrabold tracking-tight">
          📅 My Weekly Timetable
        </h1>
        <p className="text-gray-400 mt-2">
          Complete teaching schedule · All classes & periods
        </p>
      </div>

      {/* ===== GRID ===== */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

        {DAYS.map(day => {
          const entries = dayMap[day] || [];

          return (
            <div
              key={day}
              className="
                rounded-3xl p-6
                bg-gradient-to-br from-white/10 to-white/5
                border border-white/10
                backdrop-blur-xl
                shadow-2xl
              "
            >
              {/* DAY HEADER */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-extrabold">{day}</h2>
                <span className="text-xs text-gray-400">
                  {entries.length} class{entries.length !== 1 && "es"}
                </span>
              </div>

              {/* DAY CONTENT */}
              {entries.length ? (
                <div className="space-y-6">
                  {entries.map((entry, i) => (
                    <div
                      key={i}
                      className="
                        rounded-2xl p-5
                        bg-black/30
                        border border-white/10
                      "
                    >
                      {/* CLASS */}
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-blue-400">
                          Class {entry.classId.name} – Section {entry.classId.section}
                        </p>
                      </div>

                      {/* PERIODS */}
                      <div className="space-y-3">
                        {entry.periods.map((p, idx) => (
                          <div
                            key={idx}
                            className="
                              flex justify-between items-center
                              px-4 py-3
                              rounded-xl
                              bg-white/5
                              hover:bg-white/10
                              transition
                            "
                          >
                            <div>
                              <p className="font-semibold">
                                {p.subject}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatTime(p.startTime)} – {formatTime(p.endTime)}
                              </p>
                            </div>

                            <span className="text-xs text-gray-500">
                              {formatTime(p.startTime)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No classes assigned
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
