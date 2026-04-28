import { useEffect, useState } from "react";
import { Download, FileText, FileImage, File, Search } from "lucide-react";
import api from "../../services/api";

function fmtDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function fmtSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ type }) {
  if (!type) return <File size={20} className="text-gray-400" />;
  if (type.includes("image")) return <FileImage size={20} className="text-emerald-400" />;
  if (type.includes("pdf"))   return <FileText size={20} className="text-rose-400" />;
  return <FileText size={20} className="text-indigo-400" />;
}

const CATEGORY_COLORS = {
  notes:      "bg-indigo-500/20 text-indigo-400",
  slides:     "bg-amber-500/20 text-amber-400",
  assignment: "bg-rose-500/20 text-rose-400",
  reference:  "bg-emerald-500/20 text-emerald-400",
  other:      "bg-gray-500/20 text-gray-400",
};

export default function StudentNotes() {
  const [notes,   setNotes]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [subject, setSubject] = useState("all");

  useEffect(() => {
    api.get("/student/notes")
      .then(r => setNotes(r.data || []))
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));
  }, []);

  const subjects = ["all", ...new Set(notes.map(n => n.subject).filter(Boolean))];

  const filtered = notes.filter(n => {
    const matchSearch  = !search  || n.title.toLowerCase().includes(search.toLowerCase()) || n.subject.toLowerCase().includes(search.toLowerCase());
    const matchSubject = subject === "all" || n.subject === subject;
    return matchSearch && matchSubject;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-40 text-gray-500 text-sm">Loading...</div>
  );

  return (
    <div className="space-y-6">
      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full bg-[#111111] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
        <select
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className="bg-[#111111] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50">
          {subjects.map(s => (
            <option key={s} value={s} className="bg-[#111111]">
              {s === "all" ? "All Subjects" : s}
            </option>
          ))}
        </select>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {["notes","slides","assignment","reference"].map(cat => {
          const count = notes.filter(n => n.category === cat).length;
          return (
            <div key={cat} className="bg-[#111111] border border-white/[0.08] rounded-2xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1 capitalize">{cat}</p>
              <p className="text-2xl font-bold text-white">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Notes Grid */}
      {filtered.length === 0 ? (
        <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-8 text-center">
          <p className="text-gray-500 text-sm">No study materials found.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((note, i) => (
            <div key={i} className="bg-[#111111] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                  <FileIcon type={note.fileType} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-200 truncate">{note.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{note.subject} &middot; {note.teacher}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize flex-shrink-0 ${CATEGORY_COLORS[note.category] || CATEGORY_COLORS.other}`}>
                  {note.category}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{fmtDate(note.uploadedAt)}{note.fileSize ? ` · ${fmtSize(note.fileSize)}` : ""}</span>
                <a
                  href={`http://localhost:5000/${note.fileUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/15 text-indigo-400 rounded-lg hover:bg-indigo-500/25 transition font-semibold">
                  <Download size={13} /> Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
