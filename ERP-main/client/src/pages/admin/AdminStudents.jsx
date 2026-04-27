import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

import PromoteStudentModal from "../../components/admin/PromoteStudentModal";
import AssignTransportModal from "./AssignTransportModal";
import EditStudentModal from "../../components/admin/EditStudentModal";
import TCGenerateModal from "../../components/admin/TCGenerateModal";
import DocumentUploadModal from "../../components/admin/DocumentUploadModal";

/* =====================================================
   CONSTANTS
===================================================== */
const STATUS_TABS = [
  { key: "active",      label: "Active",      color: "emerald" },
  { key: "expelled",    label: "Expelled",    color: "red"     },
  { key: "transferred", label: "Transferred", color: "blue"    },
  { key: "alumni",      label: "Alumni",      color: "purple"  },
];

const TAB_STYLES = {
  emerald: { active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", dot: "bg-emerald-400" },
  red:     { active: "bg-red-500/20 text-red-400 border-red-500/30",             dot: "bg-red-400"     },
  blue:    { active: "bg-blue-500/20 text-blue-400 border-blue-500/30",          dot: "bg-blue-400"    },
  purple:  { active: "bg-purple-500/20 text-purple-400 border-purple-500/30",    dot: "bg-purple-400"  },
};

export default function AdminStudents() {
  const [status, setStatus]               = useState("active");
  const [students, setStudents]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [counts, setCounts]               = useState({});
  const [filters, setFilters]             = useState({ q: "", transport: "all" });

  const [promoteTarget, setPromoteTarget]     = useState(null);
  const [transportTarget, setTransportTarget] = useState(null);
  const [editTarget, setEditTarget]           = useState(null);
  const [tcTarget, setTcTarget]               = useState(null);
  const [docsTarget, setDocsTarget]           = useState(null);

  const navigate = useNavigate();

  /* ================= FETCH ================= */
  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/students?status=${status}`);
      setStudents(res.data || []);
    } catch (err) {
      console.error(err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  const loadCounts = useCallback(async () => {
    const res = await api.get("/admin/students/stats");
    setCounts(res.data || {});
  }, []);

  useEffect(() => { loadCounts(); }, [loadCounts]);
  useEffect(() => { loadStudents(); }, [loadStudents]);

  /* ================= FILTER ================= */
  const filteredStudents = useMemo(() => {
    const q = filters.q.toLowerCase();
    return students.filter(s => {
      const matchQuery =
        s.name?.toLowerCase().includes(q) ||
        s.admissionNo?.toLowerCase().includes(q) ||
        s.rollNo?.toLowerCase().includes(q);
      const matchTransport =
        filters.transport === "all" ||
        (filters.transport === "yes" && s.transport?.vehicle) ||
        (filters.transport === "no" && !s.transport?.vehicle);
      return matchQuery && matchTransport;
    });
  }, [students, filters]);

  /* ================= ACTIONS ================= */
  const expelStudent = async studentId => {
    const reason = prompt("Reason for expelling?");
    if (!reason) return;
    await api.post("/admin/students/expel", { studentId, reason });
    await loadStudents();
    await loadCounts();
  };

  const transferStudent = async studentId => {
    const schoolName = prompt("Transfer to which school?");
    if (!schoolName) return;
    await api.post("/admin/students/transfer", { studentId, schoolName });
    await loadStudents();
    await loadCounts();
  };

  /* ================= UI ================= */
  return (
    <div className="space-y-5 text-gray-100">

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Students</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all enrolled students</p>
        </div>
        <div className="text-sm text-gray-500 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
          {filteredStudents.length} result{filteredStudents.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* STATUS TABS */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map(t => {
          const isActive = status === t.key;
          const s = TAB_STYLES[t.color];
          return (
            <button
              key={t.key}
              onClick={() => setStatus(t.key)}
              className={`
                flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium border transition-all
                ${isActive
                  ? s.active
                  : "bg-white/[0.04] border-white/10 text-gray-400 hover:bg-white/[0.08] hover:text-gray-200"
                }
              `}
            >
              {isActive && <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />}
              {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-md font-semibold
                ${isActive ? "bg-white/20" : "bg-white/10 text-gray-500"}`}>
                {counts[t.key] || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* FILTER BAR */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            placeholder="Search name / roll / admission…"
            className="w-full bg-white/[0.05] border border-white/10 text-gray-200 placeholder-gray-600 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.08] transition"
            value={filters.q}
            onChange={e => setFilters(f => ({ ...f, q: e.target.value }))}
          />
        </div>

        <select
          className="bg-white/[0.05] border border-white/10 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition"
          value={filters.transport}
          onChange={e => setFilters(f => ({ ...f, transport: e.target.value }))}
        >
          <option value="all"  className="bg-[#1a1a1a]">All Transport</option>
          <option value="yes"  className="bg-[#1a1a1a]">Assigned</option>
          <option value="no"   className="bg-[#1a1a1a]">Not Assigned</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="rounded-xl border border-white/[0.08] overflow-hidden">

        {/* HEADER */}
        <div className="grid grid-cols-[2fr_1fr_1.2fr_1fr_1fr_auto] gap-3 px-5 py-3 bg-white/[0.04] border-b border-white/[0.06] text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div>Student</div>
          <div className="text-center">Class</div>
          <div className="text-center">Transport</div>
          <div className="text-center">Status</div>
          <div className="text-center">Transport</div>
          <div className="text-right pr-1">Actions</div>
        </div>

        {/* BODY */}
        <div className="divide-y divide-white/[0.05]">
          {loading ? (
            <div className="py-16 text-center text-gray-600 text-sm">Loading…</div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-16 text-center text-gray-600 text-sm">No students found</div>
          ) : (
            filteredStudents.map(s => (
              <div
                key={s._id}
                className="grid grid-cols-[2fr_1fr_1.2fr_1fr_1fr_auto] gap-3 px-5 py-3.5 text-sm items-center hover:bg-white/[0.03] transition"
              >
                {/* Student */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {s.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-100">{s.name}</p>
                    <p className="text-xs text-gray-600">{s.admissionNo}</p>
                  </div>
                </div>

                {/* Class */}
                <div className="text-center text-gray-300">
                  {s.classId ? `${s.classId.name}-${s.classId.section}` : "—"}
                </div>

                {/* Transport info */}
                <TransportBadge student={s} />

                {/* Status */}
                <div className="flex justify-center">
                  <StatusBadge status={s.academicStatus} />
                </div>

                {/* Transport action */}
                <div className="flex justify-center">
                  <button
                    onClick={() => setTransportTarget(s)}
                    className={`px-3 py-1 text-xs rounded-lg border font-medium transition
                      ${s.transport?.vehicle
                        ? "bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                      }`}
                  >
                    {s.transport?.vehicle ? "Change" : "Assign"}
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1">
                  {/* Eye button → full profile page */}
                  <button
                    title="View Profile"
                    onClick={() => navigate(`/admin/students/${s._id}`)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>

                  {/* Three-dot menu — active students get all actions */}
                  <ActionMenu
                    items={[
                      ...(status === "active" ? [
                        { label: "Edit",     icon: "✏️",  color: "green",  onClick: () => setEditTarget(s) },
                        { label: "Promote",  icon: "⬆️",  color: "yellow", onClick: () => setPromoteTarget(s) },
                        { label: "Transfer", icon: "🔄",  color: "blue",   onClick: () => transferStudent(s._id) },
                        { label: "TC",       icon: "📄",  color: "purple", onClick: () => setTcTarget(s) },
                        { label: "Docs",     icon: "📁",  color: "indigo", onClick: () => setDocsTarget(s) },
                        { label: "Expel",    icon: "🚫",  color: "red",    onClick: () => expelStudent(s._id) },
                      ] : [
                        { label: "TC",   icon: "📄", color: "purple", onClick: () => setTcTarget(s) },
                        { label: "Docs", icon: "📁", color: "indigo", onClick: () => setDocsTarget(s) },
                      ])
                    ]}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODALS & DRAWERS */}
      {promoteTarget && (
        <PromoteStudentModal student={promoteTarget} onClose={() => setPromoteTarget(null)} onSuccess={loadStudents} />
      )}
      {transportTarget && (
        <AssignTransportModal
          student={transportTarget}
          onClose={() => setTransportTarget(null)}
          onSuccess={() => { setTransportTarget(null); loadStudents(); }}
        />
      )}
      {editTarget && (
        <EditStudentModal student={editTarget} onClose={() => setEditTarget(null)} onSuccess={loadStudents} />
      )}
      {tcTarget && (
        <TCGenerateModal student={tcTarget} onClose={() => setTcTarget(null)} onSuccess={loadStudents} />
      )}
      {docsTarget && (
        <DocumentUploadModal student={docsTarget} onClose={() => setDocsTarget(null)} onSuccess={loadStudents} />
      )}
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

function TransportBadge({ student }) {
  if (student.transport?.vehicle) {
    return (
      <div className="text-xs text-center">
        <p className="font-medium text-indigo-400">{student.transport.routeName}</p>
        <p className="text-gray-600">{student.transport.stopName}</p>
      </div>
    );
  }
  return (
    <p className="text-xs text-gray-700 text-center">Not Assigned</p>
  );
}

function StatusBadge({ status }) {
  const map = {
    active:      "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    expelled:    "bg-red-500/15 text-red-400 border-red-500/25",
    transferred: "bg-blue-500/15 text-blue-400 border-blue-500/25",
    alumni:      "bg-purple-500/15 text-purple-400 border-purple-500/25",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${map[status] || "bg-gray-500/15 text-gray-400 border-gray-500/25"}`}>
      {status?.toUpperCase()}
    </span>
  );
}

/* Three-dot dropdown */
function ActionMenu({ items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const colorMap = {
    yellow: "text-amber-400 hover:bg-amber-500/10",
    blue:   "text-blue-400 hover:bg-blue-500/10",
    red:    "text-red-400 hover:bg-red-500/10",
    green:  "text-emerald-400 hover:bg-emerald-500/10",
    purple: "text-purple-400 hover:bg-purple-500/10",
    indigo: "text-indigo-400 hover:bg-indigo-500/10",
  };

  return (
    <div className="relative" ref={ref}>
      <button
        title="More actions"
        onClick={() => setOpen(o => !o)}
        className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="5"  cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 w-40 bg-[#1c1c1c] border border-white/10 rounded-xl shadow-2xl py-1 overflow-hidden">
          {items.map(item => (
            <button
              key={item.label}
              onClick={() => { item.onClick(); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm font-medium transition ${colorMap[item.color] || "text-gray-300 hover:bg-white/5"}`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
