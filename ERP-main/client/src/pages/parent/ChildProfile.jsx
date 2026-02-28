import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

export default function ChildProfile() {
  const navigate = useNavigate();
  const { childId } = useParams();
  const [childData, setChildData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchChildData();
  }, [childId]);

  const fetchChildData = async () => {
    try {
      const res = await api.get(`/parent-dashboard/child-profile/${childId}`);
      setChildData(res.data);
      setFormData(res.data);
    } catch (error) {
      console.error("Failed to fetch child data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.put(`/parent-dashboard/child-profile/${childId}`, formData);
      setChildData(formData);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center">
        <div className="text-white">Loading child profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/parent/enhanced")}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold">Child Profile</h1>
            </div>
            <div className="flex items-center gap-4">
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
                  >
                    💾 Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setFormData(childData);
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition"
                  >
                    ✖ Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  ✏️ Edit Profile
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Profile Photo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                {childData?.photo ? (
                  <img 
                    src={childData.photo} 
                    alt={childData.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-4xl font-bold">
                    {childData?.name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold">{childData?.name}</h2>
              <p className="text-gray-400">
                Class {childData?.classId?.name} - Section {childData?.section}
              </p>
              <p className="text-sm text-gray-500">
                Roll No: {childData?.rollNo} | Admission No: {childData?.admissionNo}
              </p>
              {editing && (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Update Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleInputChange('photo', e.target.files[0])}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-2 border border-white/20">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "basic", label: "👤 Basic Info", icon: "👤" },
                { id: "personal", label: "📋 Personal Details", icon: "📋" },
                { id: "academic", label: "🎓 Academic Details", icon: "🎓" },
                { id: "transport", label: "🚌 Transport Details", icon: "🚌" },
                { id: "contact", label: "📞 Contact Info", icon: "📞" },
                { id: "emergency", label: "🆘 Emergency", icon: "🆘" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg transition ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "bg-white/10 hover:bg-white/20 text-gray-300"
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20"
        >
          {activeTab === "basic" && <BasicInfoTab childData={childData} formData={formData} editing={editing} handleInputChange={handleInputChange} />}
          {activeTab === "personal" && <PersonalDetailsTab childData={childData} formData={formData} editing={editing} handleInputChange={handleInputChange} />}
          {activeTab === "academic" && <AcademicDetailsTab childData={childData} formData={formData} editing={editing} handleInputChange={handleInputChange} />}
          {activeTab === "transport" && <TransportDetailsTab childData={childData} formData={formData} editing={editing} handleInputChange={handleInputChange} />}
          {activeTab === "contact" && <ContactInfoTab childData={childData} formData={formData} editing={editing} handleInputChange={handleInputChange} />}
          {activeTab === "emergency" && <EmergencyContactTab childData={childData} formData={formData} editing={editing} handleInputChange={handleInputChange} />}
        </motion.div>
      </div>
    </div>
  );
}

/* ================= TAB COMPONENTS ================= */

function BasicInfoTab({ childData, formData, editing, handleInputChange }) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold mb-6">👤 Basic Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Full Name</label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            disabled={!editing}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Date of Birth</label>
          <input
            type="date"
            value={formData.dateOfBirth || ''}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            disabled={!editing}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Gender</label>
          <select
            value={formData.gender || ''}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            disabled={!editing}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Blood Group</label>
          <select
            value={formData.bloodGroup || ''}
            onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
            disabled={!editing}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
          >
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function PersonalDetailsTab({ childData, formData, editing, handleInputChange }) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold mb-6">📋 Personal Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Address</label>
          <textarea
            value={formData.address || ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
            disabled={!editing}
            rows={3}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">City</label>
          <input
            type="text"
            value={formData.city || ''}
            onChange={(e) => handleInputChange('city', e.target.value)}
            disabled={!editing}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">State</label>
          <input
            type="text"
            value={formData.state || ''}
            onChange={(e) => handleInputChange('state', e.target.value)}
            disabled={!editing}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">PIN Code</label>
          <input
            type="text"
            value={formData.pinCode || ''}
            onChange={(e) => handleInputChange('pinCode', e.target.value)}
            disabled={!editing}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  );
}

function AcademicDetailsTab({ childData, formData, editing, handleInputChange }) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold mb-6">🎓 Academic Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Class</label>
          <input
            type="text"
            value={formData.classId?.name || ''}
            disabled
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg opacity-50"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Section</label>
          <input
            type="text"
            value={formData.section || ''}
            disabled
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg opacity-50"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Roll Number</label>
          <input
            type="text"
            value={formData.rollNo || ''}
            disabled
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg opacity-50"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Admission Number</label>
          <input
            type="text"
            value={formData.admissionNo || ''}
            disabled
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg opacity-50"
          />
        </div>
      </div>
      
      {/* Academic Performance Summary */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/20 mt-6">
        <h4 className="text-lg font-semibold mb-4">Academic Performance</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-400">Overall Percentage</p>
            <p className="text-2xl font-bold text-green-400">85.5%</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">Total Attendance</p>
            <p className="text-2xl font-bold text-blue-400">92%</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">Rank in Class</p>
            <p className="text-2xl font-bold text-purple-400">5th</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TransportDetailsTab({ childData, formData, editing, handleInputChange }) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold mb-6">🚌 Transport Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Transport Facility</label>
          <select
            value={formData.transportFacility || ''}
            onChange={(e) => handleInputChange('transportFacility', e.target.value)}
            disabled={!editing}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
          >
            <option value="">Select Transport</option>
            <option value="School Bus">School Bus</option>
            <option value="Private Van">Private Van</option>
            <option value="Auto">Auto</option>
            <option value="Walking">Walking</option>
            <option value="None">No Transport</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Route Number</label>
          <input
            type="text"
            value={formData.routeNumber || ''}
            onChange={(e) => handleInputChange('routeNumber', e.target.value)}
            disabled={!editing}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Driver Name</label>
          <input
            type="text"
            value={formData.driverName || ''}
            onChange={(e) => handleInputChange('driverName', e.target.value)}
            disabled={!editing}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Driver Contact</label>
          <input
            type="text"
            value={formData.driverContact || ''}
            onChange={(e) => handleInputChange('driverContact', e.target.value)}
            disabled={!editing}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  );
}

function ContactInfoTab({ childData, formData, editing, handleInputChange }) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold mb-6">📞 Contact Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Father's Name</label>
          <input
            type="text"
            value={formData.fatherName || ''}
            onChange={(e) => handleInputChange('fatherName', e.target.value)}
            disabled={!editing}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Father's Contact</label>
          <input
            type="text"
            value={formData.fatherContact || ''}
            onChange={(e) => handleInputChange('fatherContact', e.target.value)}
            disabled={!editing}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Mother's Name</label>
          <input
            type="text"
            value={formData.motherName || ''}
            onChange={(e) => handleInputChange('motherName', e.target.value)}
            disabled={!editing}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Mother's Contact</label>
          <input
            type="text"
            value={formData.motherContact || ''}
            onChange={(e) => handleInputChange('motherContact', e.target.value)}
            disabled={!editing}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  );
}

function EmergencyContactTab({ childData, formData, editing, handleInputChange }) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold mb-6">🆘 Emergency Contact</h3>
      
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">⚠️</span>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-yellow-400">Emergency Information</h4>
            <p className="text-sm text-gray-300">Keep this information updated for emergency situations</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Emergency Contact Name</label>
          <input
            type="text"
            value={formData.emergencyContactName || ''}
            onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
            disabled={!editing}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Relationship</label>
          <select
            value={formData.emergencyRelationship || ''}
            onChange={(e) => handleInputChange('emergencyRelationship', e.target.value)}
            disabled={!editing}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
          >
            <option value="">Select Relationship</option>
            <option value="Grandparent">Grandparent</option>
            <option value="Uncle/Aunt">Uncle/Aunt</option>
            <option value="Sibling">Sibling</option>
            <option value="Neighbor">Neighbor</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Emergency Contact Number</label>
          <input
            type="text"
            value={formData.emergencyContactNumber || ''}
            onChange={(e) => handleInputChange('emergencyContactNumber', e.target.value)}
            disabled={!editing}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Medical Information</label>
          <textarea
            value={formData.medicalInfo || ''}
            onChange={(e) => handleInputChange('medicalInfo', e.target.value)}
            disabled={!editing}
            rows={3}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
            placeholder="Allergies, medications, chronic conditions, etc."
          />
        </div>
      </div>
    </div>
  );
}
