import { useState, useRef } from "react";
import api from "../../services/api";
import { X, Upload, FolderOpen, Trash2, FileText } from "lucide-react";

export default function DocumentUploadModal({ student, onClose, onSuccess }) {
  const [files, setFiles]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef(null);

  const onSelect = e => setFiles(Array.from(e.target.files));
  const remove   = i => setFiles(f => f.filter((_, x) => x !== i));

  const upload = async () => {
    if (!files.length) return;
    setLoading(true);
    try {
      const fd = new FormData();
      files.forEach(f => fd.append("documents", f));
      fd.append("documentType", "student_document");
      await api.post(`/admin/students/${student._id}/documents`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: e => setProgress(Math.round((e.loaded * 100) / e.total)),
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#161616] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <FolderOpen size={15} className="text-amber-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-sm">Upload Documents</h2>
              <p className="text-xs text-gray-500">{student.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition">
            <X size={15} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* student strip */}
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] border border-white/[0.07] p-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
              {student.name?.charAt(0)}
            </div>
            <div className="text-xs">
              <p className="font-medium text-white">{student.name}</p>
              <p className="text-gray-600">{student.admissionNo} · {student.classId ? `${student.classId.name}-${student.classId.section}` : ""}</p>
            </div>
          </div>

          {/* drop zone */}
          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-white/[0.12] hover:border-indigo-500/50 rounded-xl p-6 text-center cursor-pointer transition group"
          >
            <input ref={inputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={onSelect} className="hidden" />
            <Upload size={24} className="text-gray-600 group-hover:text-indigo-400 mx-auto mb-2 transition" />
            <p className="text-sm text-gray-500 group-hover:text-gray-400 transition">Click to choose files</p>
            <p className="text-xs text-gray-700 mt-1">PDF, JPG, PNG, DOC, DOCX</p>
          </div>

          {/* file list */}
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl bg-white/[0.04] border border-white/[0.07] px-3 py-2.5">
                  <FileText size={15} className="text-indigo-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate">{f.name}</p>
                    <p className="text-xs text-gray-600">{(f.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={() => remove(i)} className="p-1 rounded text-gray-600 hover:text-red-400 transition">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* progress */}
          {loading && (
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>Uploading…</span><span>{progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex gap-3 px-5 py-4 border-t border-white/[0.08]">
          <button onClick={onClose} disabled={loading}
            className="flex-1 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.06] text-sm font-medium transition disabled:opacity-50">
            Cancel
          </button>
          <button onClick={upload} disabled={loading || !files.length}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-semibold transition">
            <Upload size={14} />
            {loading ? "Uploading…" : `Upload ${files.length || ""} File${files.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
