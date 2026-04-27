import { useState } from "react";
import api from "../../services/api";
import { Plus, CheckCircle, AlertCircle } from "lucide-react";

export default function CreateClass() {
  const [name, setName]       = useState("");
  const [section, setSection] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !section.trim()) {
      setError("Class name and section are required");
      return;
    }
    try {
      setLoading(true); setError(""); setSuccess(false);
      await api.post("/admin/classes", { name: name.trim(), section: section.trim().toUpperCase() });
      setName(""); setSection(""); setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create class. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 font-medium">Class *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. 10"
            className="w-full bg-white/[0.05] border border-white/10 text-gray-200 placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 font-medium">Section *</label>
          <input value={section} onChange={e => setSection(e.target.value)} placeholder="e.g. A"
            className="w-full bg-white/[0.05] border border-white/10 text-gray-200 placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition" />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/25 px-3 py-2 text-xs text-red-400">
          <AlertCircle size={13} /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25 px-3 py-2 text-xs text-emerald-400">
          <CheckCircle size={13} /> Class created successfully!
        </div>
      )}

      <button onClick={handleCreate} disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition">
        <Plus size={14} /> {loading ? "Creating…" : "Create Class"}
      </button>
    </div>
  );
}
