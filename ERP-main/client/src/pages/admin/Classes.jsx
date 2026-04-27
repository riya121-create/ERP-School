import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Users, UserPlus, BookOpen, GraduationCap, ChevronRight } from "lucide-react";

/* colour palette per class number (cycles) */
const CLASS_ACCENTS = [
  { from: "from-indigo-500", to: "to-violet-500", glow: "shadow-indigo-500/20",  ring: "border-indigo-500/30",  text: "text-indigo-400",  bg: "bg-indigo-500/10"  },
  { from: "from-sky-500",    to: "to-cyan-500",   glow: "shadow-sky-500/20",     ring: "border-sky-500/30",     text: "text-sky-400",     bg: "bg-sky-500/10"     },
  { from: "from-violet-500", to: "to-purple-500", glow: "shadow-violet-500/20",  ring: "border-violet-500/30",  text: "text-violet-400",  bg: "bg-violet-500/10"  },
  { from: "from-emerald-500",to: "to-teal-500",   glow: "shadow-emerald-500/20", ring: "border-emerald-500/30", text: "text-emerald-400", bg: "bg-emerald-500/10" },
  { from: "from-rose-500",   to: "to-pink-500",   glow: "shadow-rose-500/20",    ring: "border-rose-500/30",    text: "text-rose-400",    bg: "bg-rose-500/10"    },
  { from: "from-amber-500",  to: "to-orange-500", glow: "shadow-amber-500/20",   ring: "border-amber-500/30",   text: "text-amber-400",   bg: "bg-amber-500/10"   },
];

function getAccent(index) {
  return CLASS_ACCENTS[index % CLASS_ACCENTS.length];
}

/* =====================================================
   MAIN PAGE
===================================================== */
function Classes() {
  const [classes, setClasses]         = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [search, setSearch]           = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    api.get("/admin/classes")
      .then(res => setClasses(res.data))
      .catch(() => {});
  }, []);

  const filtered = classes.filter(c =>
    `Class ${c.name} Section ${c.section}`.toLowerCase().includes(search.toLowerCase())
  );

  const openAddStudentModal = classId => {
    setSelectedClassId(classId);
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6 text-gray-100">

      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Classes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage classes, sections, teachers & students</p>
        </div>

        {/* stat pill */}
        <div className="flex items-center gap-3 bg-white/[0.05] border border-white/10 rounded-xl px-5 py-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <GraduationCap size={16} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Total Classes</p>
            <p className="text-xl font-bold text-white leading-none mt-0.5">{classes.length}</p>
          </div>
        </div>
      </div>

      {/* ===== SEARCH ===== */}
      <div className="relative max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          placeholder="Search class or section…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white/[0.05] border border-white/10 text-gray-200 placeholder-gray-600 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.08] transition"
        />
      </div>

      {/* ===== GRID ===== */}
      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((cls, i) => (
            <ClassCard
              key={cls._id}
              cls={cls}
              accent={getAccent(i)}
              onView={() => navigate(`/admin/classes/${cls._id}`)}
              onAddStudent={() => openAddStudentModal(cls._id)}
            />
          ))}
        </div>
      )}

      {/* ===== ADD STUDENT MODAL ===== */}
      {showAddModal && (
        <AddStudentModal
          onClose={() => setShowAddModal(false)}
          onManual={() => {
            setShowAddModal(false);
            navigate(`/admin/classes/${selectedClassId}/add-student`);
          }}
          onBulk={() => {
            setShowAddModal(false);
            navigate(`/admin/classes/${selectedClassId}/add-student/bulk`);
          }}
        />
      )}
    </div>
  );
}

/* =========================
   CLASS CARD
========================= */
function ClassCard({ cls, accent, onView, onAddStudent }) {
  return (
    <div className={`
      relative group rounded-2xl bg-[#161616] border border-white/[0.07]
      hover:border-white/[0.14] hover:shadow-xl ${accent.glow}
      transition-all duration-200 overflow-hidden
    `}>
      {/* top gradient bar */}
      <div className={`h-0.5 w-full bg-gradient-to-r ${accent.from} ${accent.to}`} />

      <div className="p-5">
        {/* title row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${accent.bg} flex items-center justify-center flex-shrink-0`}>
              <span className={`text-sm font-bold ${accent.text}`}>{cls.name}</span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-white leading-tight">
                Class {cls.name}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Section {cls.section}</p>
            </div>
          </div>

          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        </div>

        {/* metrics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-1">
              <Users size={13} className="text-gray-500" />
              <span className="text-[11px] text-gray-500 uppercase tracking-wide font-medium">Students</span>
            </div>
            <p className="text-lg font-bold text-white">{cls.studentCount ?? "—"}</p>
          </div>

          <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={13} className="text-gray-500" />
              <span className="text-[11px] text-gray-500 uppercase tracking-wide font-medium">Teacher</span>
            </div>
            <p className="text-sm font-semibold text-white truncate">
              {cls.teacherId?.name || (
                <span className="text-gray-600 font-normal">Unassigned</span>
              )}
            </p>
          </div>
        </div>

        {/* actions */}
        <div className="flex gap-2">
          <button
            onClick={onView}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
          >
            <Users size={14} />
            View Students
          </button>

          <button
            onClick={onAddStudent}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-white/[0.06] border border-white/10 text-gray-300 hover:bg-white/[0.10] hover:text-white transition"
          >
            <UserPlus size={14} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================
   ADD STUDENT MODAL
========================= */
function AddStudentModal({ onClose, onManual, onBulk }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#161616] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">

        <h2 className="text-lg font-bold text-white mb-1">Add Students</h2>
        <p className="text-sm text-gray-500 mb-5">Choose how you want to add students</p>

        <div className="space-y-3">
          <button
            onClick={onManual}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/[0.08] hover:border-indigo-500/50 hover:bg-indigo-500/5 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/25 transition">
              <UserPlus size={18} />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-white text-sm">Add Manually</p>
              <p className="text-xs text-gray-500 mt-0.5">Add one student at a time</p>
            </div>
            <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400 transition" />
          </button>

          <button
            onClick={onBulk}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/[0.08] hover:border-violet-500/50 hover:bg-violet-500/5 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-500/25 transition">
              <Users size={18} />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-white text-sm">Bulk Upload</p>
              <p className="text-xs text-gray-500 mt-0.5">Upload Excel / CSV file</p>
            </div>
            <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400 transition" />
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full text-sm text-gray-600 hover:text-gray-400 transition py-1"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* =========================
   EMPTY STATE
========================= */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
        <BookOpen size={24} className="text-indigo-400" />
      </div>
      <h2 className="text-lg font-semibold text-white mb-2">No classes yet</h2>
      <p className="text-sm text-gray-600 max-w-xs">
        Start by creating your first class to manage students, assign teachers, and track attendance.
      </p>
    </div>
  );
}

export default Classes;
