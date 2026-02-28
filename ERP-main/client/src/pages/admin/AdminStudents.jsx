import { useEffect, useState, useCallback, useMemo } from "react";
import api from "../../services/api";

import StudentProfileDrawer from "../../components/admin/StudentProfileDrawer";
import PromoteStudentModal from "../../components/admin/PromoteStudentModal";
import AssignTransportModal 
from "./AssignTransportModal";


/* =====================================================
   CONSTANTS
===================================================== */
const STATUS_TABS = [
  { key: "active", label: "Active" },
  { key: "expelled", label: "Expelled" },
  { key: "transferred", label: "Transferred" },
  { key: "alumni", label: "Alumni" }
];

export default function AdminStudents() {
  const [status, setStatus] = useState("active");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({});
  const [filters, setFilters] = useState({ q: "", transport: "all" });

  const [selectedStudent, setSelectedStudent] = useState(null); // View
  const [promoteTarget, setPromoteTarget] = useState(null);     // Promote
  const [transportTarget, setTransportTarget] = useState(null); // Assign Transport

  /* ================= FETCH STUDENTS ================= */

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

  /* ================= FETCH COUNTS ================= */

  const loadCounts = useCallback(async () => {
    const res = await api.get("/admin/students/stats");
    setCounts(res.data || {});
  }, []);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Students</h1>

      {/* STATUS TABS */}
      <div className="flex gap-3 flex-wrap">
        {STATUS_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setStatus(t.key)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition
              ${status === t.key ? "bg-black text-white" : "bg-white border hover:bg-gray-50"}`}
          >
            {t.label} ({counts[t.key] || 0})
          </button>
        ))}
      </div>

      {/* FILTER BAR */}
      <div className="grid grid-cols-2 gap-3 max-w-2xl">
        <input
          placeholder="Search name / roll / admission"
          className="border p-2 rounded"
          value={filters.q}
          onChange={e => setFilters(f => ({ ...f, q: e.target.value }))}
        />

        <select
          className="border p-2 rounded"
          value={filters.transport}
          onChange={e =>
            setFilters(f => ({ ...f, transport: e.target.value }))
          }
        >
          <option value="all">All Transport</option>
          <option value="yes">Assigned</option>
          <option value="no">Not Assigned</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border overflow-auto max-h-[70vh]">

        {/* HEADER */}
        <div className="grid grid-cols-6 gap-2 px-4 py-3 bg-gray-100 text-sm font-semibold sticky top-0">
          <div>Student</div>
          <div className="text-center">Class</div>
          <div className="text-center">Transport</div>
          <div className="text-center">Status</div>
          <div className="text-center">Transport Action</div>
          <div className="text-right">Actions</div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading…</div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No students found</div>
        ) : (
          filteredStudents.map(s => (
            <div
              key={s._id}
              className="grid grid-cols-6 gap-2 px-4 py-3 border-b text-sm hover:bg-gray-50"
            >
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-gray-500">{s.admissionNo}</p>
              </div>

              <div className="text-center">
                {s.classId
                  ? `${s.classId.name}-${s.classId.section}`
                  : "—"}
              </div>

              <TransportBadge student={s} />
              <StatusBadge status={s.academicStatus} />

              {/* ASSIGN / CHANGE TRANSPORT */}
              <div className="text-center">
                {s.transport?.vehicle ? (
                  <Action
                    label="Change"
                    color="blue"
                    onClick={() => setTransportTarget(s)}
                  />
                ) : (
                  <Action
                    label="Assign"
                    color="yellow"
                    onClick={() => setTransportTarget(s)}
                  />
                )}
              </div>

              {/* ACTIONS */}
              <div className="text-right space-x-2">
                <Action
                  label="View"
                  onClick={() => setSelectedStudent(s)}
                />

                {status === "active" && (
                  <>
                    <Action
                      label="Promote"
                      color="yellow"
                      onClick={() => setPromoteTarget(s)}
                    />
                    <Action
                      label="Transfer"
                      color="blue"
                      onClick={() => transferStudent(s._id)}
                    />
                    <Action
                      label="Expel"
                      color="red"
                      onClick={() => expelStudent(s._id)}
                    />
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* DRAWERS & MODALS */}

      {selectedStudent && (
        <StudentProfileDrawer
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}

      {promoteTarget && (
        <PromoteStudentModal
          student={promoteTarget}
          onClose={() => setPromoteTarget(null)}
          onSuccess={loadStudents}
        />
      )}

      {transportTarget && (
        <AssignTransportModal
          student={transportTarget}
          onClose={() => setTransportTarget(null)}
          onSuccess={() => {
            setTransportTarget(null);
            loadStudents();
          }}
        />
      )}
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

function TransportBadge({ student }) {
  return student.transport?.vehicle ? (
    <div className="text-xs text-center">
      <p className="font-medium text-indigo-600">
        {student.transport.routeName}
      </p>
      <p className="text-gray-500">{student.transport.stopName}</p>
    </div>
  ) : (
    <span className="text-xs text-gray-400 text-center">
      Not Assigned
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    active: "bg-green-100 text-green-700",
    expelled: "bg-red-100 text-red-700",
    transferred: "bg-blue-100 text-blue-700",
    alumni: "bg-purple-100 text-purple-700"
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${map[status]}`}>
      {status.toUpperCase()}
    </span>
  );
}

function Action({ label, onClick, color }) {
  const colors = {
    yellow: "bg-yellow-100 hover:bg-yellow-200",
    blue: "bg-blue-100 hover:bg-blue-200",
    red: "bg-red-100 hover:bg-red-200"
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-xs rounded border transition ${
        colors[color] || "hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );
}
