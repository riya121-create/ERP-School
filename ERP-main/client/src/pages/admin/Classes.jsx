import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Users, UserPlus, BookOpen } from "lucide-react";

function Classes() {
  const [classes, setClasses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/admin/classes")
      .then(res => setClasses(res.data))
      .catch(() => {});
  }, []);

  const openAddStudentModal = classId => {
    setSelectedClassId(classId);
    setShowAddModal(true);
  };

  return (
    <div className="space-y-10">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Classes
          </h1>
          <p className="text-gray-500 mt-2">
            Manage classes, sections, teachers & students
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur px-6 py-3 rounded-xl shadow">
          <p className="text-sm text-gray-500">
            Total Classes
          </p>
          <p className="text-2xl font-bold text-indigo-600">
            {classes.length}
          </p>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      {classes.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {classes.map(cls => (
            <ClassCard
              key={cls._id}
              cls={cls}
              onView={() =>
                navigate(`/admin/classes/${cls._id}`)
              }
              onAddStudent={() =>
                openAddStudentModal(cls._id)
              }
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
            navigate(
              `/admin/classes/${selectedClassId}/add-student`
            );
          }}
          onBulk={() => {
            setShowAddModal(false);
            navigate(
              `/admin/classes/${selectedClassId}/add-student/bulk`
            );
          }}
        />
      )}
    </div>
  );
}

/* =========================
   CLASS CARD – PREMIUM
========================= */
function ClassCard({ cls, onView, onAddStudent }) {
  return (
    <div className="relative group rounded-3xl bg-white/80 backdrop-blur border shadow-lg hover:shadow-2xl transition-all p-6 overflow-hidden">

      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-indigo-500 to-purple-500" />

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Class {cls.name}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Section {cls.section}
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          Active
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 my-6">
        <Metric
          icon={<Users size={18} />}
          label="Students"
          value={cls.studentCount ?? "—"}
        />
        <Metric
          icon={<BookOpen size={18} />}
          label="Class Teacher"
          value={cls.teacherId?.name || "Unassigned"}
        />
      </div>

      <div className="flex gap-3 mt-6">
        <PrimaryButton
          label="View Students"
          onClick={onView}
        />
        <SecondaryButton
          label="Add Student"
          onClick={onAddStudent}
        />
      </div>
    </div>
  );
}

/* =========================
   MODAL – MANUAL / BULK
========================= */
function AddStudentModal({ onClose, onManual, onBulk }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur flex items-center justify-center">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">

        <h2 className="text-2xl font-bold mb-2">
          Add Students
        </h2>
        <p className="text-gray-500 mb-6">
          Choose how you want to add students
        </p>

        <div className="space-y-4">
          <button
            onClick={onManual}
            className="w-full flex items-center gap-4 p-5 rounded-2xl border hover:border-indigo-500 hover:bg-indigo-50 transition"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <UserPlus size={22} />
            </div>
            <div className="text-left">
              <p className="font-semibold">
                Add Manually
              </p>
              <p className="text-sm text-gray-500">
                Add one student at a time
              </p>
            </div>
          </button>

          <button
            onClick={onBulk}
            className="w-full flex items-center gap-4 p-5 rounded-2xl border hover:border-purple-500 hover:bg-purple-50 transition"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Users size={22} />
            </div>
            <div className="text-left">
              <p className="font-semibold">
                Bulk Upload
              </p>
              <p className="text-sm text-gray-500">
                Upload Excel / CSV file
              </p>
            </div>
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-6 text-sm text-gray-500 hover:text-black"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* =========================
   SMALL COMPONENTS
========================= */
function Metric({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
      <div className="text-indigo-600">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">
          {label}
        </p>
        <p className="font-semibold truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

function PrimaryButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 transition"
    >
      <Users size={16} />
      {label}
    </button>
  );
}

function SecondaryButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border hover:bg-gray-100 transition"
    >
      <UserPlus size={16} />
      {label}
    </button>
  );
}

/* =========================
   EMPTY STATE
========================= */
function EmptyState() {
  return (
    <div className="bg-white rounded-3xl p-16 text-center shadow-lg max-w-2xl mx-auto">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
        <BookOpen size={28} />
      </div>

      <h2 className="text-2xl font-bold mb-3">
        No classes created yet
      </h2>
      <p className="text-gray-500 max-w-md mx-auto">
        Start by creating your first class to manage students,
        assign teachers, and track attendance seamlessly.
      </p>
    </div>
  );
}

export default Classes;
