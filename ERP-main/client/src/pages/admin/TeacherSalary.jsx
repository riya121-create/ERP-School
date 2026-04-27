import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { ArrowLeft, Plus, Trash2, Save, DollarSign } from "lucide-react";

export default function TeacherSalary() {
  const navigate    = useNavigate();
  const { teacherId } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [salary, setSalary]   = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    basicSalary: "",
    allowances: [],
    deductions: [],
    effectiveDate: new Date().toISOString().split("T")[0]
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [tRes, sRes] = await Promise.all([
          api.get(`/admin/teachers/${teacherId}`),
          api.get(`/admin/teachers/${teacherId}/salary`),
        ]);
        setTeacher(tRes.data.teacher || tRes.data);
        if (sRes.data.salary) {
          const s = sRes.data.salary;
          setSalary(s);
          setForm({ basicSalary: s.basicSalary || "", allowances: s.allowances || [], deductions: s.deductions || [], effectiveDate: s.effectiveDate?.split("T")[0] || form.effectiveDate });
        }
      } catch (err) {
        alert(err.response?.data?.message || "Failed to load data");
      }
    };
    load();
  }, [teacherId]);

  const addRow = type => setForm(f => ({ ...f, [type]: [...f[type], { name: "", amount: "", type: "fixed" }] }));
  const removeRow = (type, i) => setForm(f => ({ ...f, [type]: f[type].filter((_, x) => x !== i) }));
  const updateRow = (type, i, field, val) => setForm(f => ({ ...f, [type]: f[type].map((r, x) => x === i ? { ...r, [field]: val } : r) }));

  const total = () => {
    const basic = parseFloat(form.basicSalary) || 0;
    const allow = form.allowances.reduce((s, a) => s + (parseFloat(a.amount) || 0), 0);
    const deduct = form.deductions.reduce((s, d) => s + (parseFloat(d.amount) || 0), 0);
    return basic + allow - deduct;
  };

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/admin/teachers/${teacherId}/salary`, { ...form, basicSalary: parseFloat(form.basicSalary) });
      navigate("/admin/teachers");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save salary");
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Salary Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{teacher.name}</p>
        </div>
      </div>

      {/* CURRENT SALARY STRIP */}
      {salary && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex flex-wrap gap-6 text-sm">
          <div><p className="text-xs text-gray-600 mb-0.5">Basic</p><p className="font-semibold text-white">₹{salary.basicSalary}</p></div>
          <div><p className="text-xs text-gray-600 mb-0.5">Allowances</p><p className="font-semibold text-emerald-400">+₹{salary.allowances?.reduce((s, a) => s + a.amount, 0) || 0}</p></div>
          <div><p className="text-xs text-gray-600 mb-0.5">Deductions</p><p className="font-semibold text-red-400">-₹{salary.deductions?.reduce((s, d) => s + d.amount, 0) || 0}</p></div>
          <div><p className="text-xs text-gray-600 mb-0.5">Net</p><p className="font-bold text-white text-base">₹{salary.totalSalary}</p></div>
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div className="rounded-2xl border border-white/[0.08] bg-[#161616] p-5 space-y-5">

          {/* BASIC */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block font-medium">Basic Salary *</label>
              <input type="number" value={form.basicSalary} onChange={e => setForm(f => ({ ...f, basicSalary: e.target.value }))} placeholder="₹ Amount" required className="w-full bg-white/[0.05] border border-white/10 text-gray-200 placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block font-medium">Effective Date *</label>
              <input type="date" value={form.effectiveDate} onChange={e => setForm(f => ({ ...f, effectiveDate: e.target.value }))} required className="w-full bg-white/[0.05] border border-white/10 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition" />
            </div>
          </div>

          {/* ALLOWANCES */}
          <SalarySection title="Allowances" color="emerald" rows={form.allowances} onAdd={() => addRow("allowances")} onRemove={i => removeRow("allowances", i)} onUpdate={(i, f, v) => updateRow("allowances", i, f, v)} />

          {/* DEDUCTIONS */}
          <SalarySection title="Deductions" color="red" rows={form.deductions} onAdd={() => addRow("deductions")} onRemove={i => removeRow("deductions", i)} onUpdate={(i, f, v) => updateRow("deductions", i, f, v)} />

          {/* TOTAL */}
          <div className="flex items-center justify-between rounded-xl bg-white/[0.04] border border-white/[0.07] px-4 py-3">
            <span className="text-sm text-gray-400 font-medium">Total Monthly Salary</span>
            <span className="text-xl font-bold text-white">₹{total().toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate("/admin/teachers")} className="px-5 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.06] text-sm font-medium transition">Cancel</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition">
            <Save size={14} /> {loading ? "Saving…" : "Save Salary"}
          </button>
        </div>
      </form>
    </div>
  );
}

function SalarySection({ title, color, rows, onAdd, onRemove, onUpdate }) {
  const addColor = color === "emerald" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20" : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20";
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">{title}</p>
        <button type="button" onClick={onAdd} className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-medium transition ${addColor}`}>
          <Plus size={12} /> Add
        </button>
      </div>
      {rows.length === 0 ? (
        <p className="text-xs text-gray-700 py-2">No {title.toLowerCase()} added</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-center">
              <input value={r.name} onChange={e => onUpdate(i, "name", e.target.value)} placeholder="Name" className="bg-white/[0.05] border border-white/10 text-gray-200 placeholder-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500/60 transition" />
              <input type="number" value={r.amount} onChange={e => onUpdate(i, "amount", e.target.value)} placeholder="Amount" className="bg-white/[0.05] border border-white/10 text-gray-200 placeholder-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500/60 transition" />
              <select value={r.type} onChange={e => onUpdate(i, "type", e.target.value)} className="bg-white/[0.05] border border-white/10 text-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none transition">
                <option value="fixed" className="bg-[#1a1a1a]">Fixed</option>
                <option value="percentage" className="bg-[#1a1a1a]">%</option>
              </select>
              <button type="button" onClick={() => onRemove(i)} className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition"><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
