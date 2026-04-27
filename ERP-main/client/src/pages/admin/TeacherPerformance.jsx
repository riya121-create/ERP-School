import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { ArrowLeft, Save, Star } from "lucide-react";

const CRITERIA = [
  { name: "Teaching Skills",      description: "Classroom instruction & delivery",       weight: 1 },
  { name: "Classroom Management", description: "Discipline & student engagement",         weight: 1 },
  { name: "Communication",        description: "Interaction with students & parents",     weight: 1 },
  { name: "Professionalism",      description: "Punctuality, attitude & collaboration",   weight: 1 },
];

const ratingColor = r => r >= 4.5 ? "text-emerald-400" : r >= 3.5 ? "text-blue-400" : r >= 2.5 ? "text-amber-400" : "text-red-400";

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={12} className={i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-700"} />
      ))}
    </div>
  );
}

export default function TeacherPerformance() {
  const navigate    = useNavigate();
  const { teacherId } = useParams();
  const [teacher, setTeacher]         = useState(null);
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading]         = useState(false);

  const [form, setForm] = useState({
    evaluationPeriod: "",
    criteria: CRITERIA,
    ratings: [],
    comments: "",
    overallRating: 3
  });

  const loadPerf = async () => {
    const res = await api.get(`/admin/teachers/${teacherId}/performance`);
    setPerformances(res.data.performances || []);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const tRes = await api.get(`/admin/teachers/${teacherId}`);
        setTeacher(tRes.data.teacher || tRes.data);
        await loadPerf();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to load data");
      }
    };
    load();
  }, [teacherId]);

  const setRating = (criterionName, score) => {
    setForm(f => ({
      ...f,
      ratings: f.ratings.filter(r => r.criterion !== criterionName).concat({ criterion: criterionName, score: parseInt(score) })
    }));
  };

  const getRating = name => form.ratings.find(r => r.criterion === name)?.score || 3;

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/admin/teachers/${teacherId}/performance`, { ...form, overallRating: parseFloat(form.overallRating) });
      setForm(f => ({ ...f, evaluationPeriod: "", ratings: [], comments: "", overallRating: 3 }));
      await loadPerf();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  if (!teacher) return <div className="flex items-center justify-center h-64 text-gray-600 text-sm">Loading…</div>;

  return (
    <div className="space-y-5 text-gray-100 max-w-5xl">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/admin/teachers")} className="p-2 rounded-xl bg-white/[0.05] border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Performance Evaluation</h1>
          <p className="text-sm text-gray-500 mt-0.5">{teacher.name}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">

        {/* FORM */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#161616] p-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">New Evaluation</h2>
          <form onSubmit={submit} className="space-y-4">

            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Evaluation Period *</label>
              <input value={form.evaluationPeriod} onChange={e => setForm(f => ({ ...f, evaluationPeriod: e.target.value }))} placeholder="e.g. Q1 2025, Academic Year 2024-25" required className="w-full bg-white/[0.05] border border-white/10 text-gray-200 placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition" />
            </div>

            {/* CRITERIA */}
            <div className="space-y-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Criteria (1–5)</p>
              {CRITERIA.map(c => (
                <div key={c.name} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-200">{c.name}</p>
                      <p className="text-xs text-gray-600">{c.description}</p>
                    </div>
                    <span className={`text-lg font-bold ${ratingColor(getRating(c.name))}`}>{getRating(c.name)}</span>
                  </div>
                  <input
                    type="range" min="1" max="5"
                    value={getRating(c.name)}
                    onChange={e => setRating(c.name, e.target.value)}
                    className="w-full accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-gray-700 mt-0.5">
                    <span>Poor</span><span>Excellent</span>
                  </div>
                </div>
              ))}
            </div>

            {/* OVERALL */}
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-200">Overall Rating</p>
                <div className="flex items-center gap-2">
                  <Stars rating={form.overallRating} />
                  <span className={`font-bold ${ratingColor(form.overallRating)}`}>{parseFloat(form.overallRating).toFixed(1)}</span>
                </div>
              </div>
              <input type="range" min="1" max="5" step="0.1" value={form.overallRating} onChange={e => setForm(f => ({ ...f, overallRating: e.target.value }))} className="w-full accent-indigo-500" />
            </div>

            {/* COMMENTS */}
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Feedback / Comments *</label>
              <textarea value={form.comments} onChange={e => setForm(f => ({ ...f, comments: e.target.value }))} rows={3} required placeholder="Detailed observations…" className="w-full bg-white/[0.05] border border-white/10 text-gray-200 placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition resize-none" />
            </div>

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition">
              <Save size={14} /> {loading ? "Saving…" : "Save Evaluation"}
            </button>
          </form>
        </div>

        {/* HISTORY */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#161616] p-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">History ({performances.length})</h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {performances.length === 0 ? (
              <div className="py-12 text-center text-gray-600 text-sm">No evaluations yet</div>
            ) : (
              performances.map(p => (
                <div key={p._id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-white text-sm">{p.evaluationPeriod}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{new Date(p.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${ratingColor(p.overallRating)}`}>{p.overallRating}</p>
                      <Stars rating={p.overallRating} />
                    </div>
                  </div>

                  {p.ratings?.length > 0 && (
                    <div className="space-y-1 mb-3">
                      {p.ratings.map((r, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-gray-500">{r.criterion}</span>
                          <span className={`font-semibold ${ratingColor(r.score)}`}>{r.score}/5</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {p.comments && <p className="text-xs text-gray-500 border-t border-white/[0.05] pt-2 mt-2">{p.comments}</p>}
                  {p.evaluatedBy && <p className="text-[11px] text-gray-700 mt-1">By: {p.evaluatedBy.name}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
