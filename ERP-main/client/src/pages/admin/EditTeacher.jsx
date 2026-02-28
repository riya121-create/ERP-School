import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function EditTeacher() {
  const navigate = useNavigate();
  const { teacherId } = useParams();
  const [loading, setLoading] = useState(false);
  const [teacher, setTeacher] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    employeeId: "",
    department: "",
    qualification: "",
    experience: "",
    gender: "",
    joiningDate: "",
    address: "",
    isActive: true
  });

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await api.get(`/admin/teachers/${teacherId}`);
        const teacherData = res.data;
        setTeacher(teacherData);
        setForm({
          name: teacherData.name || "",
          email: teacherData.email || "",
          phone: teacherData.phone || "",
          employeeId: teacherData.employeeId || "",
          department: teacherData.department || "",
          qualification: teacherData.qualification || "",
          experience: teacherData.experience || "",
          gender: teacherData.gender || "",
          joiningDate: teacherData.joiningDate?.split('T')[0] || "",
          address: teacherData.address || "",
          isActive: teacherData.isActive !== false
        });
      } catch (error) {
        console.error("Failed to fetch teacher:", error);
        alert("Failed to load teacher data");
        navigate("/admin/teachers");
      }
    };

    fetchTeacher();
  }, [teacherId, navigate]);

  const change = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setLoading(true);
    try {
      await api.put(`/admin/teachers/${teacherId}`, form);
      alert("Teacher updated successfully");
      navigate("/admin/teachers");
    } catch (err) {
      alert(err.response?.data?.message || "Error updating teacher");
    } finally {
      setLoading(false);
    }
  };

  if (!teacher) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">Loading teacher data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Edit Teacher</h1>
          <p className="text-gray-500 mt-1">Update teacher information</p>
        </div>
        <button
          onClick={() => navigate("/admin/teachers")}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Back to Teachers
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-8">
        {/* BASIC INFORMATION */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={change}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={change}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={change}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Employee ID *</label>
              <input
                type="text"
                name="employeeId"
                value={form.employeeId}
                onChange={change}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
          </div>
        </div>

        {/* PROFESSIONAL DETAILS */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Professional Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Department *</label>
              <input
                type="text"
                name="department"
                value={form.department}
                onChange={change}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Qualification</label>
              <input
                type="text"
                name="qualification"
                value={form.qualification}
                onChange={change}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Experience (Years)</label>
              <input
                type="number"
                name="experience"
                value={form.experience}
                onChange={change}
                className="w-full border rounded-lg px-3 py-2"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={change}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Joining Date</label>
              <input
                type="date"
                name="joiningDate"
                value={form.joiningDate}
                onChange={change}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="isActive"
                value={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* ADDRESS */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Address</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={change}
              className="w-full border rounded-lg px-3 py-2"
              rows={3}
              placeholder="Enter full address"
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => navigate("/admin/teachers")}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="px-6 py-2 bg-black text-white rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Teacher"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditTeacher;
