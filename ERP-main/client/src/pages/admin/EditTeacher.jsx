import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { ArrowLeft, Save } from "lucide-react";

export default function EditTeacher() {
  const navigate    = useNavigate();
  const { teacherId } = useParams();
  const [loading, setLoading] = useState(false);
  const [teacher, setTeacher] = useState(null);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", employeeId: "",
    department: "", qualification: "", experience: "",
    gender: "", joiningDate: "", address: "", isActive: true
  });

  useEffect(() => {
    api.get(`/admin/teachers/${teacherId}`)
      .then(res => {
        const d = res.data;
        setTeacher(d);
        setForm({
          name: d.name || "", email: d.email || "", phone: d.phone || "",
          employeeId: d.employeeId || "", department: d.department || "",
          qualification: d.qualification || "", experience: d.experience || "",
          gender: d.gender || "", joiningDate: d.joiningDate?.split("T")[0] || "",
          address: d.address || "", isActive: d.isActive !== false
        });
      })
      .catch(() => { alert("Failed to load teacher"); navigate("/admin/teachers"); });
  }, [teacherId, navigate]);

  const change = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setLoading(true);
    try {
      await api.put(`/admin/teachers/${teacherId}`, form);
      navigate("/admin/teachers");
    } catch (err) {
      alert(err.response?.data?.message || "Error updating teacher");
    } finally {
      setLoading(false);
    }
  };

  if (!teacher) return (
    <div className="flex items-center justify-center h-64 text-gray-600 text-sm">Loading…</div>
  );

  return (
    <div className="space-y-5 text-gray-100 max-w-3xl">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/admin/teachers")}
          className="p-2 rounded-xl bg-white/[0.05] border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Edit Teacher</h1>
          <p className="text-sm text-gray-500 mt-0.5">Update information for {teacher.name}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#161616] p-6 space-y-6">

        {/* BASIC INFO */}
        <Section title="Basic Information">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Full Name *"><DarkInput name="name" value={form.name} onChange={change} /></Field>
            <Field label="Email *"><DarkInput name="email" type="email" value={form.email} onChange={change} /></Field>
            <Field label="Phone"><DarkInput name="phone" value={form.phone} onChange={change} /></Field>
            <Field label="Employee ID *"><DarkInput name="employeeId" value={form.employeeId} onChange={change} /></Field>
          </div>
        </Section>

        {/* PROFESSIONAL */}
        <Section title="Professional Details">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Department *"><DarkInput name="department" value={form.department} onChange={change} /></Field>
            <Field label="Qualification"><DarkInput name="qualification" value={form.qualification} onChange={change} /></Field>
            <Field label="Experience (Years)"><DarkInput name="experience" type="number" value={form.experience} onChange={change} /></Field>
            <Field label="Gender">
              <DarkSelect name="gender" value={form.gender} onChange={change}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </DarkSelect>
            </Field>
            <Field label="Joining Date"><DarkInput name="joiningDate" type="date" value={form.joiningDate} onChange={change} /></Field>
            <Field label="Status">
              <DarkSelect name="isActive" value={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.value === "true" })}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </DarkSelect>
            </Field>
          </div>
        </Section>

        {/* ADDRESS */}
        <Section title="Address">
          <Field label="Address">
            <textarea
              name="address"
              value={form.address}
              onChange={change}
              rows={3}
              placeholder="Enter full address"
              className="w-full bg-white/[0.05] border border-white/10 text-gray-200 placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition resize-none"
            />
          </Field>
        </Section>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => navigate("/admin/teachers")}
            className="px-5 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.06] text-sm font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition"
          >
            <Save size={14} />
            {loading ? "Saving…" : "Update Teacher"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== HELPERS ===== */
function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 pb-2 border-b border-white/[0.06]">{title}</h2>
      {children}
    </div>
  );
}
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5 font-medium">{label}</label>
      {children}
    </div>
  );
}
function DarkInput({ ...props }) {
  return (
    <input
      {...props}
      className="w-full bg-white/[0.05] border border-white/10 text-gray-200 placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition"
    />
  );
}
function DarkSelect({ children, ...props }) {
  return (
    <select
      {...props}
      className="w-full bg-white/[0.05] border border-white/10 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition"
    >
      {children}
    </select>
  );
}
