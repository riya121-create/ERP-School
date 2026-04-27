import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import {
  ArrowLeft, User, BookOpen, Bus, Phone, Mail,
  Calendar, Hash, MapPin, Users, FileText, Edit2,
  TrendingUp, ArrowRightLeft, FileCheck, FolderOpen, UserX
} from "lucide-react";
import PromoteStudentModal   from "../../components/admin/PromoteStudentModal";
import AssignTransportModal  from "./AssignTransportModal";
import EditStudentModal      from "../../components/admin/EditStudentModal";
import TCGenerateModal       from "../../components/admin/TCGenerateModal";
import DocumentUploadModal   from "../../components/admin/DocumentUploadModal";

/* status colours */
const STATUS = {
  active:      { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/25", dot: "bg-emerald-400" },
  expelled:    { bg: "bg-red-500/15",     text: "text-red-400",     border: "border-red-500/25",     dot: "bg-red-400"     },
  transferred: { bg: "bg-blue-500/15",    text: "text-blue-400",    border: "border-blue-500/25",    dot: "bg-blue-400"    },
  alumni:      { bg: "bg-purple-500/15",  text: "text-purple-400",  border: "border-purple-500/25",  dot: "bg-purple-400"  },
};

export default function StudentProfile() {
  const { studentId } = useParams();
  const navigate      = useNavigate();

  const [student, setStudent]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  /* modals */
  const [showEdit,      setShowEdit]      = useState(false);
  const [showPromote,   setShowPromote]   = useState(false);
  const [showTransport, setShowTransport] = useState(false);
  const [showTC,        setShowTC]        = useState(false);
  const [showDocs,      setShowDocs]      = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/students/${studentId}`);
      setStudent(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load student");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [studentId]);

  const expel = async () => {
    const reason = prompt("Reason for expelling?");
    if (!reason) return;
    await api.post("/admin/students/expel", { studentId, reason });
    load();
  };

  const transfer = async () => {
    const schoolName = prompt("Transfer to which school?");
    if (!schoolName) return;
    await api.post("/admin/students/transfer", { studentId, schoolName });
    load();
  };

  if (loading) return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 w-48 bg-white/[0.06] rounded-lg" />
      <div className="h-40 rounded-2xl bg-white/[0.05]" />
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="h-28 rounded-xl bg-white/[0.05]" />)}
      </div>
    </div>
  );

  if (error || !student) return (
    <div className="space-y-4 text-gray-100">
      <button onClick={() => navigate("/admin/students")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition">
        <ArrowLeft size={15} /> Back to Students
      </button>
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-400 text-sm">{error || "Student not found"}</div>
    </div>
  );

  const sc = STATUS[student.academicStatus] || STATUS.active;
  const isActive = student.academicStatus === "active";
  const className = student.classId ? `${student.classId.name} - ${student.classId.section}` : "—";

  return (
    <div className="space-y-5 text-gray-100 max-w-4xl">

      {/* BACK */}
      <button
        onClick={() => navigate("/admin/students")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition group"
      >
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Students
      </button>

      {/* HERO CARD */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#161616] overflow-hidden">
        {/* top accent bar */}
        <div className={`h-1 w-full ${sc.dot === "bg-emerald-400" ? "bg-gradient-to-r from-emerald-500 to-teal-500" : sc.dot === "bg-red-400" ? "bg-gradient-to-r from-red-500 to-rose-500" : sc.dot === "bg-blue-400" ? "bg-gradient-to-r from-blue-500 to-sky-500" : "bg-gradient-to-r from-purple-500 to-violet-500"}`} />

        <div className="p-6 flex flex-col sm:flex-row sm:items-start gap-5">
          {/* avatar */}
          <div className="w-20 h-20 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-3xl font-bold text-indigo-400 flex-shrink-0">
            {student.name?.charAt(0).toUpperCase()}
          </div>

          {/* info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{student.name}</h1>
              <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${sc.bg} ${sc.text} ${sc.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} animate-pulse`} />
                {student.academicStatus?.toUpperCase()}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><Hash size={13} /> {student.admissionNo}</span>
              {student.rollNo && <span className="flex items-center gap-1.5"><Hash size={13} /> Roll {student.rollNo}</span>}
              {student.classId && <span className="flex items-center gap-1.5"><BookOpen size={13} /> {className}</span>}
              {student.email && <span className="flex items-center gap-1.5"><Mail size={13} /> {student.email}</span>}
            </div>
          </div>

          {/* action buttons */}
          <div className="flex flex-wrap gap-2 flex-shrink-0">
            {isActive && (
              <>
                <ActionBtn icon={<Edit2 size={13} />}          label="Edit"     color="indigo" onClick={() => setShowEdit(true)} />
                <ActionBtn icon={<TrendingUp size={13} />}     label="Promote"  color="emerald" onClick={() => setShowPromote(true)} />
                <ActionBtn icon={<ArrowRightLeft size={13} />} label="Transfer" color="blue"   onClick={transfer} />
                <ActionBtn icon={<FileCheck size={13} />}      label="TC"       color="purple" onClick={() => setShowTC(true)} />
                <ActionBtn icon={<FolderOpen size={13} />}     label="Docs"     color="amber"  onClick={() => setShowDocs(true)} />
                <ActionBtn icon={<UserX size={13} />}          label="Expel"    color="red"    onClick={expel} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* INFO GRID */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Personal */}
        <InfoCard title="Personal Info" icon={<User size={14} />} color="indigo">
          <InfoRow label="Gender"       value={student.gender} />
          <InfoRow label="Date of Birth" value={student.dob ? new Date(student.dob).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : null} />
          <InfoRow label="Phone"        value={student.phone} />
          <InfoRow label="Email"        value={student.email} />
          {student.address && <InfoRow label="Address" value={student.address} />}
        </InfoCard>

        {/* Academic */}
        <InfoCard title="Academic Info" icon={<BookOpen size={14} />} color="sky">
          <InfoRow label="Class"        value={className} />
          <InfoRow label="Roll No"      value={student.rollNo} />
          <InfoRow label="Admission No" value={student.admissionNo} />
          <InfoRow label="Status"       value={student.academicStatus?.toUpperCase()} highlight={sc.text} />
          {student.statusReason && <InfoRow label="Reason" value={student.statusReason} />}
          {student.statusChangedAt && (
            <InfoRow label="Changed On" value={new Date(student.statusChangedAt).toLocaleDateString("en-IN")} />
          )}
        </InfoCard>

        {/* Parent */}
        <InfoCard title="Parent Info" icon={<Users size={14} />} color="violet">
          <InfoRow label="Parent Name"  value={student.parentName} />
          <InfoRow label="Parent Phone" value={student.parentPhone} />
          <InfoRow label="Parent Email" value={student.parentEmail} />
        </InfoCard>

        {/* Transport */}
        <InfoCard title="Transport" icon={<Bus size={14} />} color="amber">
          {student.transport?.vehicle ? (
            <>
              <InfoRow label="Route"   value={student.transport.routeName} />
              <InfoRow label="Stop"    value={student.transport.stopName} />
              <InfoRow label="Vehicle" value={student.transport.vehicle} />
            </>
          ) : (
            <p className="text-sm text-gray-600 py-2">Not assigned</p>
          )}
          <button
            onClick={() => setShowTransport(true)}
            className={`mt-3 w-full py-1.5 rounded-lg text-xs font-semibold border transition
              ${student.transport?.vehicle
                ? "bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                : "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
              }`}
          >
            {student.transport?.vehicle ? "Change Transport" : "Assign Transport"}
          </button>
        </InfoCard>

        {/* Documents */}
        <InfoCard title="Documents" icon={<FileText size={14} />} color="emerald">
          {student.documents?.length > 0 ? (
            <div className="space-y-1.5">
              {student.documents.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{d.name || d.type}</span>
                  {d.url && (
                    <a href={d.url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 transition">View</a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600 py-2">No documents uploaded</p>
          )}
          <button
            onClick={() => setShowDocs(true)}
            className="mt-3 w-full py-1.5 rounded-lg text-xs font-semibold border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition"
          >
            Upload Documents
          </button>
        </InfoCard>

        {/* Joining */}
        <InfoCard title="Enrollment" icon={<Calendar size={14} />} color="rose">
          <InfoRow label="Joined On" value={student.createdAt ? new Date(student.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" }) : null} />
          <InfoRow label="Last Updated" value={student.updatedAt ? new Date(student.updatedAt).toLocaleDateString("en-IN") : null} />
        </InfoCard>
      </div>

      {/* MODALS */}
      {showEdit && (
        <EditStudentModal student={student} onClose={() => setShowEdit(false)} onSuccess={load} />
      )}
      {showPromote && (
        <PromoteStudentModal student={student} onClose={() => setShowPromote(false)} onSuccess={load} />
      )}
      {showTransport && (
        <AssignTransportModal student={student} onClose={() => setShowTransport(false)} onSuccess={() => { setShowTransport(false); load(); }} />
      )}
      {showTC && (
        <TCGenerateModal student={student} onClose={() => setShowTC(false)} onSuccess={load} />
      )}
      {showDocs && (
        <DocumentUploadModal student={student} onClose={() => setShowDocs(false)} onSuccess={load} />
      )}
    </div>
  );
}

/* ===== HELPERS ===== */
function InfoCard({ title, icon, color, children }) {
  const colors = {
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    sky:    "text-sky-400 bg-sky-500/10 border-sky-500/20",
    violet: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    amber:  "text-amber-400 bg-amber-500/10 border-amber-500/20",
    emerald:"text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    rose:   "text-rose-400 bg-rose-500/10 border-rose-500/20",
  };
  const c = colors[color] || colors.indigo;
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#161616] p-4">
      <div className={`flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider ${c.split(" ")[0]}`}>
        <span className={`p-1.5 rounded-lg border ${c.split(" ").slice(1).join(" ")}`}>{icon}</span>
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, highlight }) {
  if (!value || value === "—") return (
    <div className="flex justify-between text-xs">
      <span className="text-gray-600">{label}</span>
      <span className="text-gray-700">—</span>
    </div>
  );
  return (
    <div className="flex justify-between text-xs gap-3">
      <span className="text-gray-500 flex-shrink-0">{label}</span>
      <span className={`font-medium text-right truncate ${highlight || "text-gray-200"}`}>{value}</span>
    </div>
  );
}

function ActionBtn({ icon, label, color, onClick }) {
  const colors = {
    indigo:  "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20",
    emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20",
    blue:    "bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20",
    purple:  "bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20",
    amber:   "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20",
    red:     "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20",
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${colors[color]}`}
    >
      {icon} {label}
    </button>
  );
}
