import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/services/api";

export default function StudentFeeOptions() {
  const [searchParams] = useSearchParams();
  const classId = searchParams.get("class");
  const serviceFromUrl = searchParams.get("service");

  const [students, setStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const [services, setServices] = useState({
    transport: false,
    hostel: false,
    mess: false,
  });

  /* ================= AUTO ENABLE SERVICE ================= */
  useEffect(() => {
    if (serviceFromUrl) {
      setServices(prev => ({
        ...prev,
        [serviceFromUrl]: true,
      }));
    }
  }, [serviceFromUrl]);

  /* ================= FETCH CLASS STUDENTS ================= */
  useEffect(() => {
    if (!classId) return;

    api
      .get(`/admin/classes/${classId}/students`)
      .then(res => {
        const active = res.data.filter(
          s =>
            s.academicStatus !== "archived" &&
            s.academicStatus !== "expelled" &&
            s.academicStatus !== "transferred"
        );
        setStudents(active);
        setSelectedIds(active.map(s => s._id)); // ✅ default SELECT ALL
      })
      .catch(() => {});
  }, [classId]);

  /* ================= SELECTION HANDLERS ================= */
  const toggleStudent = id => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === students.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map(s => s._id));
    }
  };

  /* ================= APPLY ================= */
  const applyServices = async () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one student");
      return;
    }

    await api.post("/admin/fees/apply", {
      classId,
      studentIds: selectedIds,
      services,
    });

    alert("Services applied successfully");
  };

  return (
    <div className="max-w-6xl space-y-8">

      {/* ===== HEADER ===== */}
      <div>
        <h1 className="text-3xl font-bold">
          Fee Allocation
        </h1>
        <p className="text-gray-500 mt-1">
          Apply optional services to selected students
        </p>
      </div>

      {/* ===== SERVICES ===== */}
      <section className="bg-white rounded-2xl border p-6 space-y-4">
        <h2 className="font-semibold text-lg">
          Optional Services
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          <ServiceToggle
            label="Transport"
            checked={services.transport}
            onChange={() =>
              setServices({ ...services, transport: !services.transport })
            }
          />
          <ServiceToggle
            label="Hostel"
            checked={services.hostel}
            onChange={() =>
              setServices({ ...services, hostel: !services.hostel })
            }
          />
          <ServiceToggle
            label="Mess"
            checked={services.mess}
            onChange={() =>
              setServices({ ...services, mess: !services.mess })
            }
          />
        </div>
      </section>

      {/* ===== STUDENT SELECTION ===== */}
      <section className="bg-white rounded-2xl border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">
            Select Students
          </h2>

          <button
            onClick={toggleSelectAll}
            className="text-sm font-semibold text-indigo-600 hover:underline"
          >
            {selectedIds.length === students.length
              ? "Unselect All"
              : "Select All"}
          </button>
        </div>

        <div className="divide-y">
          {students.map(s => (
            <div
              key={s._id}
              className="flex items-center justify-between py-3"
            >
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-gray-500">
                  Roll: {s.rollNo || "—"}
                </p>
              </div>

              <input
                type="checkbox"
                checked={selectedIds.includes(s._id)}
                onChange={() => toggleStudent(s._id)}
                className="w-4 h-4"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ===== ACTION ===== */}
      <div className="flex justify-end gap-3">
        <button className="btn-secondary">
          Cancel
        </button>
        <button
          onClick={applyServices}
          className="btn-primary"
        >
          Apply to {selectedIds.length} Students
        </button>
      </div>
    </div>
  );
}

/* ================= SMALL COMPONENT ================= */

function ServiceToggle({ label, checked, onChange }) {
  return (
    <div
      onClick={onChange}
      className={`cursor-pointer border rounded-xl p-5
        flex items-center justify-between
        ${checked
          ? "bg-indigo-50 border-indigo-500"
          : "hover:bg-gray-50"}
      `}
    >
      <p className="font-semibold">{label}</p>
      <input type="checkbox" checked={checked} readOnly />
    </div>
  );
}
