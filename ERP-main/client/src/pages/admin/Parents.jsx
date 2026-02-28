import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Parents() {
  const [parents, setParents] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadParents();
  }, []);

  const loadParents = async () => {
    try {
      const res = await api.get("/admin/parents");
      setParents(res.data.parents || []);
    } catch (error) {
      console.error("Failed to load parents:", error);
    }
  };

  const filtered = parents.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = parents.filter(p => p.isActive).length;

  const handleDelete = async (parentId) => {
    if (!confirm("Are you sure you want to delete this parent?")) return;
    
    try {
      await api.delete(`/admin/parents/${parentId}`);
      alert("Parent deleted successfully");
      setParents(parents.filter(p => p._id !== parentId));
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete parent");
    }
  };

  const handleResetPassword = async (parentId) => {
    if (!confirm("Are you sure you want to reset this parent's password to 'parent123'?")) return;
    
    try {
      await api.post(`/admin/parents/${parentId}/reset-password`);
      alert("Password reset successfully to 'parent123'");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reset password");
    }
  };

  const Stat = ({ label, value, color = "blue" }) => (
    <div className={`bg-${color}-50 p-4 rounded-lg border border-${color}-200`}>
      <div className={`text-2xl font-bold text-${color}-600`}>{value}</div>
      <div className={`text-sm text-${color}-600`}>{label}</div>
    </div>
  );

  const Th = ({ children }) => (
    <th className="text-left p-3 font-semibold bg-gray-50">{children}</th>
  );

  const StatusBadge = ({ active }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
    }`}>
      {active ? "Active" : "Inactive"}
    </span>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Parents</h1>
          <p className="text-gray-500 mt-1">Manage parent accounts and student links</p>
        </div>
        <button
          onClick={() => navigate("/admin/parents/add")}
          className="px-4 py-2 bg-black text-white rounded-lg hover:opacity-90"
        >
          + Add Parent
        </button>
      </div>

      {/* ===== STATS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Stat label="Total Parents" value={parents.length} />
        <Stat label="Active Parents" value={activeCount} color="green" />
        <Stat label="Inactive Parents" value={parents.length - activeCount} color="red" />
      </div>

      {/* ===== SEARCH ===== */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search parents by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border rounded-lg"
        />
      </div>

      {/* ===== TABLE ===== */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <Th>Parent</Th>
              <Th>Contact</Th>
              <Th>Linked Students</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  No parents found
                </td>
              </tr>
            ) : (
              filtered.map(parent => (
                <tr key={parent._id} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-medium">{parent.name}</div>
                    <div className="text-sm text-gray-500">
                      {parent.email || "No email"}
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="text-sm">{parent.phone}</div>
                    <div className="text-xs text-gray-500">
                      {parent.address || "No address"}
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="text-sm">
                      {parent.linkedStudents?.length || 0} students
                    </div>
                    {parent.linkedStudents?.length > 0 && (
                      <div className="text-xs text-gray-500">
                        {parent.linkedStudents.map(s => s.name).join(", ")}
                      </div>
                    )}
                  </td>

                  <td className="p-4">
                    <StatusBadge active={parent.isActive !== false} />
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/admin/parents/edit/${parent._id}`)}
                        className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => navigate(`/admin/parents/${parent._id}/link-student`)}
                        className="px-3 py-1 text-xs bg-green-100 hover:bg-green-200 rounded"
                      >
                        Link Student
                      </button>
                      <button
                        onClick={() => handleResetPassword(parent._id)}
                        className="px-3 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 rounded"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={() => handleDelete(parent._id)}
                        className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Parents;
