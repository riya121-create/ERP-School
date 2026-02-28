import { X } from "lucide-react";

export default function StudentProfileDrawer({ student, onClose }) {
  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      {/* PANEL */}
      <div className="w-full sm:w-[420px] bg-white h-full shadow-xl animate-slideIn">

        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-lg font-semibold">{student.name}</h2>
            <p className="text-xs text-gray-500">
              Admission No: {student.admissionNo}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 space-y-6 text-sm">

          {/* BASIC */}
          <Section title="Basic Info">
            <Item label="Email" value={student.email || "—"} />
            <Item label="Phone" value={student.phone || "—"} />
            <Item label="Gender" value={student.gender || "—"} />
            <Item
              label="Date of Birth"
              value={
                student.dob
                  ? new Date(student.dob).toLocaleDateString("en-IN")
                  : "—"
              }
            />
          </Section>

          {/* ACADEMIC */}
          <Section title="Academic Info">
            <Item
              label="Current Class"
              value={
                student.classId
                  ? `${student.classId.name}-${student.classId.section}`
                  : "—"
              }
            />
            <Item label="Roll No" value={student.rollNo || "—"} />
            <Item label="Status" value={student.academicStatus.toUpperCase()} />
            <Item label="Reason" value={student.statusReason || "—"} />
            <Item
              label="Updated At"
              value={
                student.statusChangedAt
                  ? new Date(student.statusChangedAt).toLocaleDateString("en-IN")
                  : "—"
              }
            />
          </Section>

          {/* PARENT */}
          <Section title="Parent Info">
            <Item label="Parent Name" value={student.parentName || "—"} />
            <Item label="Parent Phone" value={student.parentPhone || "—"} />
          </Section>

        </div>
      </div>
    </div>
  );
}

/* =========================
   SMALL HELPERS
========================= */

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Item({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
