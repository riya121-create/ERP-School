import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function TeacherLeave() {
  const navigate = useNavigate();
  const { teacherId } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    leaveType: "casual",
    startDate: "",
    endDate: "",
    reason: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get teacher info
        const teacherRes = await api.get(`/admin/teachers/${teacherId}`);
        setTeacher(teacherRes.data.teacher);

        // Get leave history
        const leavesRes = await api.get(`/admin/teachers/${teacherId}/leave`);
        setLeaves(leavesRes.data.leaves || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        console.error("Error response:", error.response);
        console.error("Error status:", error.response?.status);
        console.error("Error data:", error.response?.data);
        alert(`Failed to load data: ${error.response?.data?.message || error.message}`);
      }
    };

    fetchData();
  }, [teacherId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(`/admin/teachers/${teacherId}/leave`, formData);
      alert("Leave request submitted successfully!");
      
      // Reset form
      setFormData({
        leaveType: "casual",
        startDate: "",
        endDate: "",
        reason: ""
      });

      // Refresh leaves list
      const leavesRes = await api.get(`/admin/teachers/${teacherId}/leave`);
      setLeaves(leavesRes.data.leaves || []);
    } catch (error) {
      console.error("Failed to submit leave:", error);
      alert(error.response?.data?.message || "Failed to submit leave request");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLeave = async (leaveId, status) => {
    const comments = prompt(`Enter comments for ${status}:`);
    if (!comments) return;

    try {
      await api.post(`/admin/leave/${leaveId}/approve`, { status, comments });
      alert(`Leave ${status} successfully!`);
      
      // Refresh leaves list
      const leavesRes = await api.get(`/admin/teachers/${teacherId}/leave`);
      setLeaves(leavesRes.data.leaves || []);
    } catch (error) {
      console.error("Failed to approve leave:", error);
      alert(error.response?.data?.message || "Failed to approve leave");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getLeaveTypeColor = (type) => {
    switch (type) {
      case 'sick': return 'bg-red-50 text-red-600';
      case 'maternity': return 'bg-pink-50 text-pink-600';
      case 'paternity': return 'bg-blue-50 text-blue-600';
      case 'earned': return 'bg-purple-50 text-purple-600';
      case 'unpaid': return 'bg-gray-50 text-gray-600';
      default: return 'bg-green-50 text-green-600';
    }
  };

  if (!teacher) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Leave Management</h1>
          <p className="text-gray-500 mt-1">
            Manage leaves for: <span className="font-semibold">{teacher.name}</span>
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/teachers")}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Back to Teachers
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* LEAVE REQUEST FORM */}
        <div className="bg-white rounded-xl shadow p-8">
          <h2 className="text-lg font-semibold mb-4">Request Leave</h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Leave Type</label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData(prev => ({ ...prev, leaveType: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual Leave</option>
                  <option value="earned">Earned Leave</option>
                  <option value="maternity">Maternity Leave</option>
                  <option value="paternity">Paternity Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Reason *</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={4}
                  placeholder="Enter reason for leave"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit Leave Request"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* LEAVE HISTORY */}
        <div className="bg-white rounded-xl shadow p-8">
          <h2 className="text-lg font-semibold mb-4">Leave History</h2>
          <div className="space-y-3">
            {leaves.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No leave requests found
              </div>
            ) : (
              leaves.map(leave => (
                <div key={leave._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(leave.leaveType)}`}>
                        {leave.leaveType.toUpperCase()}
                      </span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                        {leave.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium mb-1">Reason: {leave.reason}</p>
                    {leave.comments && (
                      <p className="text-gray-600">
                        <strong>Comments:</strong> {leave.comments}
                      </p>
                    )}
                    {leave.approvedBy && (
                      <p className="text-gray-600">
                        <strong>Approved by:</strong> {leave.approvedBy.name}
                      </p>
                    )}
                  </div>
                  {leave.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleApproveLeave(leave._id, 'approved')}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproveLeave(leave._id, 'rejected')}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherLeave;
