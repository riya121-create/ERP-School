import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../services/api";

export default function AddStudentBulk() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const uploadStudents = async () => {
    if (!file) {
      alert("Please select a CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("classId", classId);

    setLoading(true);
    setMessage("");

    try {
      const res = await api.post(
        "/student/bulk-upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setMessage(
        `✅ ${res.data.totalStudents} students uploaded successfully`
      );

      // optional: redirect after 2 sec
      setTimeout(() => {
        navigate(`/admin/classes/${classId}`);
      }, 2000);
    } catch (err) {
      console.error(err);
      setMessage("❌ Upload failed. Check CSV format.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-xl">
      <h1 className="text-3xl font-bold mb-2">
        Bulk Upload Students
      </h1>

      <p className="text-gray-500 mb-6">
        Upload CSV file to add multiple students
      </p>

      <input
        type="file"
        accept=".csv"
        onChange={e => setFile(e.target.files[0])}
        className="mb-4"
      />

      <button
        onClick={uploadStudents}
        disabled={loading}
        className="px-6 py-2 bg-indigo-600 text-white rounded hover:opacity-90"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {message && (
        <p className="mt-4 font-semibold">
          {message}
        </p>
      )}
    </div>
  );
}
