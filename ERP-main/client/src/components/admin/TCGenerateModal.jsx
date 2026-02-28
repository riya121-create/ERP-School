import { useState } from "react";
import api from "../../services/api";

export default function TCGenerateModal({ student, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    reason: "",
    lastDate: "",
    newSchool: ""
  });
  const [loading, setLoading] = useState(false);
  const [tcData, setTcData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post(`/admin/students/${student._id}/tc`, formData);
      setTcData(res.data.transferCertificate);
      onSuccess();
    } catch (error) {
      console.error("Failed to generate TC:", error);
      alert("Failed to generate transfer certificate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const downloadTC = () => {
    if (!tcData) return;

    // Create a simple text version of TC for download
    const tcContent = `
TRANSFER CERTIFICATE

Certificate Number: ${tcData.certificateNumber}

Student Details:
-----------------
Name: ${tcData.studentName}
Admission No: ${tcData.admissionNo}
Roll No: ${tcData.rollNo}
Class: ${tcData.class}
Date of Birth: ${tcData.dateOfBirth}
Date of Admission: ${tcData.admissionDate}
Last Date Attended: ${tcData.lastDateAttended}

Transfer Details:
-----------------
Reason for Leaving: ${tcData.reasonForLeaving}
New School: ${tcData.newSchool}

Parent Details:
---------------
Parent Name: ${tcData.parentName}
Parent Contact: ${tcData.parentContact}
Parent Address: ${tcData.parentAddress}

School Details:
---------------
School Name: ${tcData.schoolName}
School Address: ${tcData.schoolAddress}
School Phone: ${tcData.schoolPhone}
School Email: ${tcData.schoolEmail}

Certificate Status: ${tcData.status}
Issued Date: ${tcData.issuedDate}

Principal Signature: _________________

This certificate is issued on the basis of school records.
    `;

    // Create download link
    const blob = new Blob([tcContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TC-${tcData.studentName}-${tcData.certificateNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Generate Transfer Certificate</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {!tcData ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Student Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {student.name}
                </div>
                <div>
                  <span className="font-medium">Admission No:</span> {student.admissionNo}
                </div>
                <div>
                  <span className="font-medium">Roll No:</span> {student.rollNo}
                </div>
                <div>
                  <span className="font-medium">Class:</span> {student.classId?.name}-{student.classId?.section}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Reason for Leaving *</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className="w-full border rounded p-2"
                rows="3"
                placeholder="e.g., Transfer to another city, Financial reasons, etc."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Last Date of Attendance *</label>
              <input
                type="date"
                name="lastDate"
                value={formData.lastDate}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">New School Name</label>
              <input
                type="text"
                name="newSchool"
                value={formData.newSchool}
                onChange={handleChange}
                className="w-full border rounded p-2"
                placeholder="Name of the school student is transferring to"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate TC"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">✅ Transfer Certificate Generated</h3>
              <p className="text-sm text-green-700">
                Certificate Number: <strong>{tcData.certificateNumber}</strong>
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Certificate Details</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Student:</strong> {tcData.studentName}</div>
                <div><strong>Class:</strong> {tcData.class}</div>
                <div><strong>Reason:</strong> {tcData.reasonForLeaving}</div>
                <div><strong>New School:</strong> {tcData.newSchool}</div>
                <div><strong>Issued Date:</strong> {new Date(tcData.issuedDate).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={downloadTC}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                📥 Download TC
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
