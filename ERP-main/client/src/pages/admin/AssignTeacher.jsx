import { useEffect, useState } from "react";
import api from "../../services/api";

/* =====================================================
   ASSIGN CLASS TEACHER — PRODUCTION / FAANG INTERNAL
===================================================== */
export default function AssignTeacher() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [classId, setClassId] = useState("");
  const [teacherId, setTeacherId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    api.get("/admin/classes").then(res => {
      setClasses(res.data || []);
    });

    api.get("/admin/teachers").then(res => {
      setTeachers(res.data || []);
    });
  }, []);

  /* ================= ACTION ================= */

  const assign = async () => {
    if (!classId || !teacherId) {
      setError("Please select both class and teacher");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess(false);

      await api.post("/admin/teachers/assign", {
        classId,
        teacherId
      });

      setClassId("");
      setTeacherId("");
      setSuccess(true);

      // auto hide success
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to assign teacher. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <div>
        <h3 className="text-base font-semibold">
          Assign Class Teacher
        </h3>
        <p className="text-sm text-gray-500">
          Allocate one teacher as class in-charge
        </p>
      </div>

      {/* FORM */}
      <div className="space-y-4">

        <SelectField
          label="Class"
          value={classId}
          onChange={setClassId}
          placeholder="Select class"
          options={classes.map(cls => ({
            value: cls._id,
            label: `Class ${cls.name} - ${cls.section}`
          }))}
        />

        <SelectField
          label="Teacher"
          value={teacherId}
          onChange={setTeacherId}
          placeholder="Select teacher"
          options={teachers.map(t => ({
            value: t._id,
            label: `${t.name}${t.department ? ` • ${t.department}` : ""}`
          }))}
        />
      </div>

      {/* FEEDBACK */}
      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="text-sm text-green-600">
          Teacher assigned successfully
        </div>
      )}

      {/* ACTION */}
      <button
        onClick={assign}
        disabled={loading}
        className="
          w-full py-2.5 rounded-lg
          bg-black text-white text-sm font-medium
          hover:bg-gray-800 transition
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        {loading ? "Assigning…" : "Assign Teacher"}
      </button>
    </div>
  );
}

/* =====================================================
   SELECT FIELD
===================================================== */
function SelectField({ label, value, onChange, options, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        {label}
      </label>

      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="
          w-full px-3 py-2 rounded-lg
          border border-gray-300 bg-white
          text-sm
          focus:outline-none focus:ring-2 focus:ring-black/20
        "
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
