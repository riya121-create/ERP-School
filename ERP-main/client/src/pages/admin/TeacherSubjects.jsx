import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { ArrowLeft, BookOpen, Save } from "lucide-react";

export default function TeacherSubjects() {
  const navigate    = useNavigate();
  const { teacherId } = useParams();
  const [teacher, setTeacher]           = useState(null);
  const [subjects, setSubjects]         = useState([]);
  const [selected, setSelected]         = useState([]);
  const [loading, setLoading]           = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [tRes, sRes, tsRes] = await Promise.all([
          api.get(`/admin/teachers/${teacherId}`),
          api.get("/admin/subjects"),
          api.get(`/admin/teachers/${teacherId}/subjects`),
        ]);
        setTeacher(tRes.data.teacher || tRes.data);
        setSubjects(sRes.data || []);
        setSelected(tsRes.data.subjects?.map(s => s._id) || []);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to load data");
      }
    };
    load();
  }, [teacherId]);

  const toggle = id => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/admin/teachers/${teacherId}/subjects`, { subjectIds: selected });
      navigate("/admin/teachers");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign subjects");
    } finally {
      setLoading(false);
    }
  };

  if (!teacher) return <div className="flex items-center justify-center h-64 text-gray-600 text-sm">Loading…</div>;

  return (
    <div className="space-y-5 text-gray-100 max-w-3xl">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/admin/teachers")} className="p-2 rounded-xl bg-white/[0.05] border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Assign Subjects</h1>
          <p className="text-sm text-gray-500 mt-0.5">{teacher.name}</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">

        {/* SELECTED PILLS */}
        {selected.length > 0 && (
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-medium">Assigned ({selected.length})</p>
            <div className="flex flex-wrap gap-2">
              {selected.map(id => {
                const s = subjects.find(x => x._id === id);
                return s ? (
                  <span key={id} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-medium">
                    {s.name}
                    <button type="button" onClick={() => toggle(id)} className="text-indigo-500 hover:text-indigo-300">×</button>
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* SUBJECT GRID */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#161616] p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-4 font-medium">Available Subjects</p>
          {subjects.length === 0 ? (
            <p className="text-sm text-gray-600 text-center py-8">No subjects found</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {subjects.map(s => {
                const isSelected = selected.includes(s._id);
                return (
                  <label
                    key={s._id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition
                      ${isSelected
                        ? "border-indigo-500/40 bg-indigo-500/10"
                        : "border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05]"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(s._id)}
                      className="mt-0.5 accent-indigo-500"
                    />
                    <div>
                      <p className={`text-sm font-medium ${isSelected ? "text-indigo-300" : "text-gray-300"}`}>{s.name}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{s.code} · {s.department}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate("/admin/teachers")} className="px-5 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.06] text-sm font-medium transition">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition">
            <Save size={14} /> {loading ? "Saving…" : "Save Subjects"}
          </button>
        </div>
      </form>
    </div>
  );
}
