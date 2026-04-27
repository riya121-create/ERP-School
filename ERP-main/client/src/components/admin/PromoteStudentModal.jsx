import { useEffect, useState } from "react";
import api from "../../services/api";
import { X, TrendingUp } from "lucide-react";

export default function PromoteStudentModal({ student, onClose, onSuccess }) {
  const [classes, setClasses]     = useState([]);
  const [newClassId, setNewClassId] = useState("");
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    api.get("/admin/classes").then(res => setClasses(res.data || []));
  }, []);

  const submit = async () => {
    if (!newClassId) return alert("Please select a class");
    setLoading(true);
    try {
      await api.post("/admin/students/promote", { studentId: student._id, newClassId });
      onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to promote student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#161616] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp size={15} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-sm">Promote Student</h2>
              <p className="text-xs text-gray-500">{student.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition">
            <X size={15} />
          </button>
        </div>

        {/* BODY */}
        <div className="px-5 py-4 space-y-4">
          {/* current class */}
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] px-4 py-3 text-sm">
            <p className="text-xs text-gray-600 mb-0.5">Current Class</p>
            <p className="font-semibold text-white">
              {student.classId ? `Class ${student.classId.name} - ${student.classId.section}` : "—"}
            </p>
          </div>

          {/* new class select */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block font-medium">Promote to *</label>
            <select
              value={newClassId}
              onChange={e => setNewClassId(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/10 text-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/60 transition"
            >
              <option value="" className="bg-[#1a1a1a]">Select new class</option>
              {classes.map(c => (
                <option key={c._id} value={c._id} className="bg-[#1a1a1a]">
                  Class {c.name} - {c.section}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex gap-3 px-5 py-4 border-t border-white/[0.08]">
          <button onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.06] text-sm font-medium transition">
            Cancel
          </button>
          <button onClick={submit} disabled={loading || !newClassId}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-sm font-semibold transition">
            <TrendingUp size={14} />
            {loading ? "Promoting…" : "Promote"}
          </button>
        </div>
      </div>
    </div>
  );
}
