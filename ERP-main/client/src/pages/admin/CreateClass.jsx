import { useState } from "react";
import api from "../../services/api";

/* =====================================================
   CREATE CLASS — PRODUCTION / FAANG INTERNAL
===================================================== */
export default function CreateClass() {
  const [name, setName] = useState("");
  const [section, setSection] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !section.trim()) {
      setError("Class name and section are required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess(false);

      await api.post("/admin/classes", {
        name: name.trim(),
        section: section.trim().toUpperCase()
      });

      setName("");
      setSection("");
      setSuccess(true);

      // auto-hide success
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create class. Try again."
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
          Create Class
        </h3>
        <p className="text-sm text-gray-500">
          Define a new academic class & section
        </p>
      </div>

      {/* FORM */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Class"
          placeholder="e.g. 10"
          value={name}
          onChange={setName}
        />

        <Input
          label="Section"
          placeholder="e.g. A"
          value={section}
          onChange={setSection}
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
          Class created successfully
        </div>
      )}

      {/* ACTION */}
      <button
        onClick={handleCreate}
        disabled={loading}
        className="
          w-full py-2.5 rounded-lg
          bg-black text-white text-sm font-medium
          hover:bg-gray-800 transition
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        {loading ? "Creating…" : "Create Class"}
      </button>
    </div>
  );
}

/* =====================================================
   INPUT
===================================================== */
function Input({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        {label}
      </label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full px-3 py-2 rounded-lg
          border border-gray-300
          text-sm
          focus:outline-none focus:ring-2 focus:ring-black/20
        "
      />
    </div>
  );
}
