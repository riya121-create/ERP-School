import { useEffect, useState } from "react";
import api from "../../services/api";
import { UserCheck, CheckCircle, AlertCircle } from "lucide-react";

export default function AssignTeacher() {
  const [classes, setClasses]   = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classId, setClassId]   = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);

  useEffect(() => {
    api.get("/admin/classes").then(r => setClasses(r.data || []));
    api.get("/admin/teachers").then(r => setTeachers(r.data || []));
  }, []);

  const assign = async () => {
    if (!classId || !teacherId) { setError("Please select both class and teacher"); return; }
    try {
      setLoading(true); setError(""); setSuccess(false);
      await api.post("/admin/teachers/assign", { classId, teacherId });
      setClassId(""); setTeacherId(""); setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to assign teacher. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-500 mb-1.5 font-medium">Class</label>
        <select value={classId} onChange={e => setClassId(e.target.value)}
          className="w-full bg-white/[0.05] border border-white/10 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500/60 transition">
          <option value="" className="bg-[#1a1a1a]">Select class</option>
          {classes.map(c => <option key={c._id} value={c._id} className="bg-[#1a1a1a]">Class {c.name} – {c.section}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1.5 font-medium">Teacher</label>
        <select value={teacherId} onChange={e => setTeacherId(e.target.value)}
          className="w-full bg-white/[0.05] border border-white/10 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500/60 transition">
          <option value="" className="bg-[#1a1a1a]">Select teacher</option>
          {teachers.map(t => <option key={t._id} value={t._id} className="bg-[#1a1a1a]">{t.name}{t.department ? ` · ${t.department}` : ""}</option>)}
        </select>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/25 px-3 py-2 text-xs text-red-400">
          <AlertCircle size={13} /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25 px-3 py-2 text-xs text-emerald-400">
          <CheckCircle size={13} /> Teacher assigned successfully!
        </div>
      )}

      <button onClick={assign} disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-semibold transition">
        <UserCheck size={14} /> {loading ? "Assigning…" : "Assign Teacher"}
      </button>
    </div>
  );
}
