import { useState } from "react";
import api from "../../services/api";
import {
  Upload, FileText, CheckCircle, AlertTriangle, X
} from "lucide-react";

export default function AdminTimetableCsvUploadAndPreview({ classId, section }) {

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  /* ================= FILE SELECT ================= */
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setPreview([]);
    setErrors([]);
    setConfirmed(false);
  };

  /* ================= PREVIEW ================= */
  const previewCsv = async () => {
    if (!file) return alert("⚠️ Please select a CSV file");
    if (!classId || !section) return alert("⚠️ Class & Section required");

    setLoading(true);

    const form = new FormData();
    form.append("file", file);
    form.append("classId", classId);
    form.append("section", section);

    try {
      const res = await api.post(
        "/timetable/admin/csv/preview",
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setPreview(res.data.preview || []);
      setErrors(res.data.errors || []);
    } catch (e) {
      alert(e.response?.data?.message || "CSV preview failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= CONFIRM SAVE ================= */
  const confirmUpload = async () => {
    if (!preview.length) return;

    setLoading(true);
    try {
      await api.post("/timetable/admin/week", {
        classId,
        section,
        days: preview
      });

      setConfirmed(true);
      alert("✅ Timetable uploaded successfully");
    } catch (e) {
      alert(e.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8">

      {/* ===== HEADER ===== */}
      <div className="flex items-center gap-3 mb-4">
        <Upload className="text-indigo-600" />
        <h2 className="text-xl font-bold text-gray-800">
          Upload Timetable via CSV
        </h2>
      </div>

      {/* ===== FILE INPUT ===== */}
      <div className="flex items-center gap-4 mb-6">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="border rounded-lg px-3 py-2 w-full"
        />

        <button
          onClick={previewCsv}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FileText size={16} />
          {loading ? "Checking..." : "Preview"}
        </button>
      </div>

      {/* ===== ERRORS ===== */}
      {errors.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
            <AlertTriangle size={16} /> Errors Found
          </h3>
          <ul className="list-disc ml-6 text-sm text-red-600 space-y-1">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ===== PREVIEW TABLE ===== */}
      {preview.length > 0 && (
        <>
          <h3 className="font-semibold text-gray-800 mb-3">
            Preview Timetable
          </h3>

          <div className="overflow-x-auto mb-6">
            <table className="w-full border border-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2">Day</th>
                  <th className="border px-3 py-2">Start</th>
                  <th className="border px-3 py-2">End</th>
                  <th className="border px-3 py-2">Subject</th>
                  <th className="border px-3 py-2">Teacher</th>
                </tr>
              </thead>
              <tbody>
                {preview.flatMap(d =>
                  d.periods.map((p, i) => (
                    <tr key={d.day + i}>
                      <td className="border px-3 py-2">{d.day}</td>
                      <td className="border px-3 py-2">{p.startTime}</td>
                      <td className="border px-3 py-2">{p.endTime}</td>
                      <td className="border px-3 py-2">{p.subject}</td>
                      <td className="border px-3 py-2">{p.teacherName}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ===== CONFIRM ===== */}
          {!confirmed && (
            <button
              onClick={confirmUpload}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
            >
              <CheckCircle size={16} />
              {loading ? "Uploading..." : "Confirm & Save"}
            </button>
          )}

          {confirmed && (
            <div className="mt-4 flex items-center gap-2 text-green-700 font-semibold">
              <CheckCircle size={18} /> Timetable saved successfully
            </div>
          )}
        </>
      )}
    </div>
  );
}
