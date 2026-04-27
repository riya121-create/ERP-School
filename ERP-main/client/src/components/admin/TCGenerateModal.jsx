import { useState } from "react";
import api from "../../services/api";
import { X, FileCheck, Download, CheckCircle } from "lucide-react";

export default function TCGenerateModal({ student, onClose, onSuccess }) {
  const [form, setForm]     = useState({ reason: "", lastDate: "", newSchool: "" });
  const [loading, setLoading] = useState(false);
  const [tcData, setTcData]   = useState(null);

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post(`/admin/students/${student._id}/tc`, form);
      setTcData(res.data.transferCertificate);
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to generate TC");
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!tcData) return;
    const content = `TRANSFER CERTIFICATE\n\nCertificate No: ${tcData.certificateNumber}\n\nStudent: ${tcData.studentName}\nAdmission No: ${tcData.admissionNo}\nClass: ${tcData.class}\nReason: ${tcData.reasonForLeaving}\nNew School: ${tcData.newSchool}\nLast Date: ${tcData.lastDateAttended}\nIssued: ${tcData.issuedDate}`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
    a.download = `TC-${tcData.studentName}-${tcData.certificateNumber}.txt`;
    a.click();
  };

  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#161616] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <FileCheck size={15} className="text-purple-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-sm">Transfer Certificate</h2>
              <p className="text-xs text-gray-500">{student.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition">
            <X size={15} />
          </button>
        </div>

        {!tcData ? (
          <form onSubmit={submit}>
            <div className="px-5 py-4 space-y-4">
              {/* student info strip */}
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/[0.04] border border-white/[0.07] p-3 text-xs">
                <div><span className="text-gray-600">Name</span><p className="text-white font-medium mt-0.5">{student.name}</p></div>
                <div><span className="text-gray-600">Admission No</span><p className="text-white font-medium mt-0.5">{student.admissionNo}</p></div>
                <div><span className="text-gray-600">Roll No</span><p className="text-white font-medium mt-0.5">{student.rollNo || "—"}</p></div>
                <div><span className="text-gray-600">Class</span><p className="text-white font-medium mt-0.5">{student.classId ? `${student.classId.name}-${student.classId.section}` : "—"}</p></div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">Reason for Leaving *</label>
                <textarea name="reason" value={form.reason} onChange={change} rows={3} required
                  placeholder="e.g. Transfer to another city…"
                  className="w-full bg-white/[0.05] border border-white/10 text-gray-200 placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500/60 transition resize-none" />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">Last Date of Attendance *</label>
                <input type="date" name="lastDate" value={form.lastDate} onChange={change} required
                  className="w-full bg-white/[0.05] border border-white/10 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500/60 transition" />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">New School Name</label>
                <input type="text" name="newSchool" value={form.newSchool} onChange={change}
                  placeholder="School transferring to"
                  className="w-full bg-white/[0.05] border border-white/10 text-gray-200 placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500/60 transition" />
              </div>
            </div>

            <div className="flex gap-3 px-5 py-4 border-t border-white/[0.08]">
              <button type="button" onClick={onClose}
                className="flex-1 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.06] text-sm font-medium transition">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-semibold transition">
                <FileCheck size={14} />
                {loading ? "Generating…" : "Generate TC"}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="px-5 py-4 space-y-4">
              <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                <CheckCircle size={20} className="text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-400 text-sm">TC Generated Successfully</p>
                  <p className="text-xs text-emerald-400/70 mt-0.5">Certificate No: {tcData.certificateNumber}</p>
                </div>
              </div>

              <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] p-4 space-y-2 text-sm">
                <InfoRow label="Student"  value={tcData.studentName} />
                <InfoRow label="Class"    value={tcData.class} />
                <InfoRow label="Reason"   value={tcData.reasonForLeaving} />
                <InfoRow label="New School" value={tcData.newSchool || "—"} />
                <InfoRow label="Issued"   value={new Date(tcData.issuedDate).toLocaleDateString("en-IN")} />
              </div>
            </div>

            <div className="flex gap-3 px-5 py-4 border-t border-white/[0.08]">
              <button onClick={onClose}
                className="flex-1 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.06] text-sm font-medium transition">
                Close
              </button>
              <button onClick={download}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition">
                <Download size={14} /> Download TC
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-gray-500 flex-shrink-0">{label}</span>
      <span className="text-gray-200 font-medium text-right">{value}</span>
    </div>
  );
}
