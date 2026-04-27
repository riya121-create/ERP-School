import { useState, useEffect } from "react";
import api from "../../services/api";
import { X, Save, User, BookOpen, Users, Heart } from "lucide-react";

export default function EditStudentModal({ student, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", rollNo: "", admissionNo: "",
    classId: "", section: "", parentId: "", address: "",
    bloodGroup: "", dateOfBirth: "", gender: "",
    emergencyContact: "", medicalInfo: ""
  });
  const [loading, setLoading] = useState(false);
  const [classes, setClasses]   = useState([]);
  const [parents, setParents]   = useState([]);

  useEffect(() => {
    if (student) {
      setForm({
        name: student.name || "",
        email: student.email || "",
        phone: student.phone || "",
        rollNo: student.rollNo || "",
        admissionNo: student.admissionNo || "",
        classId: student.classId?._id || "",
        section: student.section || "",
        parentId: student.parentId || "",
        address: student.address || "",
        bloodGroup: student.bloodGroup || "",
        dateOfBirth: student.dateOfBirth?.split("T")[0] || student.dob?.split("T")[0] || "",
        gender: student.gender || "",
        emergencyContact: student.emergencyContact || "",
        medicalInfo: student.medicalInfo || ""
      });
    }
  }, [student]);

  useEffect(() => {
    Promise.all([api.get("/admin/classes"), api.get("/admin/parents").catch(() => ({ data: [] }))])
      .then(([cr, pr]) => { setClasses(cr.data || []); setParents(pr.data || []); });
  }, []);

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/admin/students/${student._id}`, form);
      onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update student");
    } finally {
      setLoading(false);
    }
  };

  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#161616] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-sm font-bold text-indigo-400">
              {student.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-semibold text-white">Edit Student</h2>
              <p className="text-xs text-gray-500">{student.name} · {student.admissionNo}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition">
            <X size={16} />
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={submit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Basic Info */}
          <Section title="Basic Info" icon={<User size={13} />}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name *"><DI name="name" value={form.name} onChange={change} required /></Field>
              <Field label="Email *"><DI name="email" type="email" value={form.email} onChange={change} required /></Field>
              <Field label="Phone"><DI name="phone" value={form.phone} onChange={change} /></Field>
              <Field label="Gender">
                <DS name="gender" value={form.gender} onChange={change}>
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </DS>
              </Field>
              <Field label="Date of Birth"><DI name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={change} /></Field>
              <Field label="Blood Group">
                <DS name="bloodGroup" value={form.bloodGroup} onChange={change}>
                  <option value="">Select</option>
                  {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(g => <option key={g} value={g}>{g}</option>)}
                </DS>
              </Field>
            </div>
          </Section>

          {/* Academic */}
          <Section title="Academic Info" icon={<BookOpen size={13} />}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Roll Number *"><DI name="rollNo" value={form.rollNo} onChange={change} required /></Field>
              <Field label="Admission Number *"><DI name="admissionNo" value={form.admissionNo} onChange={change} required /></Field>
              <Field label="Class *">
                <DS name="classId" value={form.classId} onChange={change} required>
                  <option value="">Select Class</option>
                  {classes.map(c => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
                </DS>
              </Field>
              <Field label="Section"><DI name="section" value={form.section} onChange={change} /></Field>
            </div>
          </Section>

          {/* Parent & Contact */}
          <Section title="Parent & Contact" icon={<Users size={13} />}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Parent">
                <DS name="parentId" value={form.parentId} onChange={change}>
                  <option value="">Select Parent</option>
                  {parents.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </DS>
              </Field>
              <Field label="Emergency Contact"><DI name="emergencyContact" value={form.emergencyContact} onChange={change} /></Field>
            </div>
            <Field label="Address">
              <textarea name="address" value={form.address} onChange={change} rows={2}
                className="w-full bg-white/[0.05] border border-white/10 text-gray-200 placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition resize-none" />
            </Field>
          </Section>

          {/* Medical */}
          <Section title="Medical Info" icon={<Heart size={13} />}>
            <Field label="Medical Information">
              <textarea name="medicalInfo" value={form.medicalInfo} onChange={change} rows={2}
                placeholder="Allergies, conditions, medications…"
                className="w-full bg-white/[0.05] border border-white/10 text-gray-200 placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition resize-none" />
            </Field>
          </Section>
        </form>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/[0.08] flex-shrink-0">
          <button type="button" onClick={onClose}
            className="px-5 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.06] text-sm font-medium transition">
            Cancel
          </button>
          <button onClick={submit} disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition">
            <Save size={14} />
            {loading ? "Saving…" : "Update Student"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* helpers */
function Section({ title, icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 pb-2 border-b border-white/[0.06]">
        <span className="text-indigo-400">{icon}</span>{title}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
function Field({ label, children }) {
  return <div><label className="block text-xs text-gray-500 mb-1.5 font-medium">{label}</label>{children}</div>;
}
function DI(props) {
  return <input {...props} className="w-full bg-white/[0.05] border border-white/10 text-gray-200 placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition" />;
}
function DS({ children, ...props }) {
  return (
    <select {...props} className="w-full bg-white/[0.05] border border-white/10 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition">
      {children}
    </select>
  );
}
