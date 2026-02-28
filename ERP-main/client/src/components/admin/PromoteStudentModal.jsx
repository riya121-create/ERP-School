import { useEffect, useState } from "react";
import api from "../../services/api";

export default function PromoteStudentModal({ student, onClose, onSuccess }) {
  const [classes, setClasses] = useState([]);
  const [newClassId, setNewClassId] = useState("");

  useEffect(() => {
    api.get("/admin/classes").then(res => setClasses(res.data));
  }, []);

  const submit = async () => {
    if (!newClassId) {
      alert("Please select a class");
      return;
    }

    await api.post("/admin/students/promote", {
      studentId: student._id,
      newClassId
    });

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2">
          Promote Student
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          Select new class for <b>{student.name}</b>
        </p>

        <select
          className="w-full border rounded-lg p-3 mb-6"
          value={newClassId}
          onChange={e => setNewClassId(e.target.value)}
        >
          <option value="">Select class</option>
          {classes.map(c => (
            <option key={c._id} value={c._id}>
              Class {c.name}-{c.section}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            className="px-4 py-2 bg-black text-white rounded-lg"
          >
            Promote
          </button>
        </div>
      </div>
    </div>
  );
}
