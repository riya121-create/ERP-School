import { useState, useRef } from "react";
import api from "../../services/api";

export default function DocumentUploadModal({ student, onClose, onSuccess }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setDocuments(files);
  };

  const handleUpload = async () => {
    if (documents.length === 0) {
      alert("Please select files to upload");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      documents.forEach((file, index) => {
        formData.append(`documents`, file);
      });
      formData.append('documentType', 'student_document');

      const res = await api.post(`/admin/students/${student._id}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });

      alert("Documents uploaded successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to upload documents:", error);
      alert("Failed to upload documents. Please try again.");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = (index) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Upload Student Documents</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="font-semibold mb-2">Student Information</h3>
          <div className="text-sm">
            <div><strong>Name:</strong> {student.name}</div>
            <div><strong>Admission No:</strong> {student.admissionNo}</div>
            <div><strong>Class:</strong> {student.classId?.name}-{student.classId?.section}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Documents</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                📁 Choose Files
              </button>
              
              <p className="text-sm text-gray-500 mt-2">
                Supported formats: PDF, JPG, PNG, DOC, DOCX
              </p>
            </div>
          </div>

          {documents.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Selected Files:</h4>
              <div className="space-y-2">
                {documents.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">📄</span>
                      <div>
                        <div className="font-medium text-sm">{file.name}</div>
                        <div className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(2)} KB
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={loading || documents.length === 0}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Uploading..." : `Upload ${documents.length} File${documents.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
