import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  Search, Plus, Users, UserCheck, UserX,
  Eye, MoreHorizontal, Edit2, BookOpen,
  DollarSign, Calendar, BarChart2, Trash2
} from "lucide-react";

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch]     = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/admin/teachers")
      .then(res => setTeachers(res.data))
      .catch(() => {});
  }, []);

  const filtered = teachers.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.email?.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount   = teachers.filter(t => t.isActive).length;
  const inactiveCount = teachers.length - activeCount;

  const handleDelete = async (teacherId, name) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/teachers/${teacherId}`);
      setTeachers(prev => prev.filter(t => t._id !== teacherId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete teacher");
    }
  };

  return (
    <div className="space-y-5 text-gray-100">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Teachers</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage faculty & assignments</p>
        </div>
        <button
          onClick={() => navigate("/admin/teachers/add")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition self-start sm:self-auto"
        >
          <Plus size={15} /> Add Teacher
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={<Users size={15} />}     label="Total"    value={teachers.length} color="indigo"  />
        <StatCard icon={<UserCheck size={15} />} label="Active"   value={activeCount}     color="emerald" />
        <StatCard icon={<UserX size={15} />}     label="Inactive" value={inactiveCount}   color="red"     />
      </div>

      {/* SEARCH */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full bg-white/[0.05] border border-white/10 text-gray-200 placeholder-gray-600 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition"
        />
      </div>

      {/* TABLE */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#161616] overflow-hidden">

        {/* header */}
        <div className="grid grid-cols-[2.5fr_1.5fr_1fr_1fr_auto] gap-3 px-5 py-3 bg-white/[0.03] border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-gray-600">
          <div>Teacher</div>
          <div>Department</div>
          <div>Contact</div>
          <div className="text-center">Status</div>
          <div className="text-right pr-1">Actions</div>
        </div>

        {/* rows */}
        <div className="divide-y divide-white/[0.04]">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Users size={24} className="text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-600">No teachers found</p>
            </div>
          ) : (
            filtered.map(t => (
              <div
                key={t._id}
                className="grid grid-cols-[2.5fr_1.5fr_1fr_1fr_auto] gap-3 px-5 py-3.5 items-center hover:bg-white/[0.02] transition text-sm"
              >
                {/* teacher info */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {t.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-100">{t.name}</p>
                    <p className="text-xs text-gray-600">{t.email}</p>
                  </div>
                </div>

                {/* department */}
                <div className="text-gray-400 text-sm">{t.department || "—"}</div>

                {/* contact */}
                <div className="text-gray-500 text-sm">{t.phone || "—"}</div>

                {/* status */}
                <div className="flex justify-center">
                  <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border
                    ${t.isActive
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                      : "bg-red-500/15 text-red-400 border-red-500/25"
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${t.isActive ? "bg-emerald-400" : "bg-red-400"}`} />
                    {t.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* actions */}
                <div className="flex items-center justify-end gap-1">
                  {/* Eye / View */}
                  <button
                    title="View Profile"
                    onClick={() => navigate(`/admin/teachers/edit/${t._id}`)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition"
                  >
                    <Eye size={15} />
                  </button>

                  {/* Three-dot menu */}
                  <ActionMenu
                    items={[
                      { label: "Edit",        icon: <Edit2 size={13} />,      color: "blue",   onClick: () => navigate(`/admin/teachers/edit/${t._id}`) },
                      { label: "Subjects",    icon: <BookOpen size={13} />,   color: "green",  onClick: () => navigate(`/admin/teachers/${t._id}/subjects`) },
                      { label: "Salary",      icon: <DollarSign size={13} />, color: "purple", onClick: () => navigate(`/admin/teachers/${t._id}/salary`) },
                      { label: "Leave",       icon: <Calendar size={13} />,   color: "amber",  onClick: () => navigate(`/admin/teachers/${t._id}/leave`) },
                      { label: "Performance", icon: <BarChart2 size={13} />,  color: "indigo", onClick: () => navigate(`/admin/teachers/${t._id}/performance`) },
                      { label: "Delete",      icon: <Trash2 size={13} />,     color: "red",    onClick: () => handleDelete(t._id, t.name) },
                    ]}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ===== STAT CARD ===== */
const STAT_COLORS = {
  indigo:  { bg: "bg-indigo-500/10",  text: "text-indigo-400",  border: "border-indigo-500/20"  },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  red:     { bg: "bg-red-500/10",     text: "text-red-400",     border: "border-red-500/20"     },
};
function StatCard({ icon, label, value, color }) {
  const c = STAT_COLORS[color];
  return (
    <div className={`flex items-center gap-3 rounded-xl border ${c.border} ${c.bg} px-4 py-3`}>
      <span className={c.text}>{icon}</span>
      <div>
        <p className="text-[11px] text-gray-600 uppercase tracking-wider font-medium">{label}</p>
        <p className="text-xl font-bold text-white leading-none mt-0.5">{value}</p>
      </div>
    </div>
  );
}

/* ===== THREE-DOT MENU ===== */
function ActionMenu({ items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const colorMap = {
    blue:   "text-blue-400 hover:bg-blue-500/10",
    green:  "text-emerald-400 hover:bg-emerald-500/10",
    purple: "text-purple-400 hover:bg-purple-500/10",
    amber:  "text-amber-400 hover:bg-amber-500/10",
    indigo: "text-indigo-400 hover:bg-indigo-500/10",
    red:    "text-red-400 hover:bg-red-500/10",
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition"
        title="More actions"
      >
        <MoreHorizontal size={15} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 w-44 bg-[#1c1c1c] border border-white/10 rounded-xl shadow-2xl py-1 overflow-hidden">
          {items.map(item => (
            <button
              key={item.label}
              onClick={() => { item.onClick(); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm font-medium transition ${colorMap[item.color] || "text-gray-300 hover:bg-white/5"}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
