import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function ParentDashboardEnhanced() {
  const navigate = useNavigate();
  const [parentData, setParentData] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchParentData();
  }, []);

  const fetchParentData = async () => {
    try {
      const res = await api.get("/parent-dashboard/dashboard");
      setParentData(res.data.parent);
      setChildren(res.data.children || []);
    } catch (error) {
      console.error("Failed to fetch parent data:", error);
      // Don't set any demo data - show error message instead
      setParentData(null);
      setChildren([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">Parent Dashboard</h1>
              <p className="text-gray-400 mt-2">
                Welcome back, {parentData?.name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/login");
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </motion.div>

        {/* Children Selector */}
        {children.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold mb-4">Select Child</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {children.map((child) => (
                  <div
                    key={child._id}
                    className="bg-white/5 rounded-lg p-4 cursor-pointer hover:bg-white/10 transition border border-white/20"
                    onClick={() => setSelectedChild(child)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {child.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold">{child.name}</h4>
                        <p className="text-gray-400">
                          Class {child.classId?.name} - Section {child.section}
                        </p>
                        <p className="text-sm text-gray-500">
                          Roll No: {child.rollNo}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

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
                { id: "overview", label: "🏠 Overview", icon: "🏠" },
                { id: "attendance", label: "📊 Attendance", icon: "📊" },
                { id: "homework", label: "📝 Homework", icon: "📝" },
                { id: "exams", label: "📚 Exams", icon: "📚" },
                { id: "fees", label: "💰 Fees", icon: "💰" },
                { id: "announcements", label: "📢 Announcements", icon: "📢" }
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
          {activeTab === "overview" && <OverviewTab children={children} navigate={navigate} />}
          {activeTab === "attendance" && <AttendanceTab children={children} />}
          {activeTab === "homework" && <HomeworkTab children={children} />}
          {activeTab === "exams" && <ExamsTab children={children} />}
          {activeTab === "fees" && <FeesTab children={children} />}
          {activeTab === "announcements" && <AnnouncementsTab children={children} />}
        </motion.div>
      </div>
    </div>
  );
}

/* ================= TAB COMPONENTS ================= */

function OverviewTab({ children, navigate }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/5 rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-blue-400">👦 Children</h3>
          <p className="text-3xl font-bold mt-2">{children.length}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-green-400">📅 Today's Attendance</h3>
          <p className="text-3xl font-bold mt-2">
            {children.filter(child => {
              const today = new Date().toISOString().split('T')[0];
              return child.attendance?.today?.some(a => a.studentId.toString() === child._id && a.status === 'present');
            }).length} / {children.length}
          </p>
          <p className="text-sm text-gray-400">Present today</p>
        </div>
        <div className="bg-white/5 rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-yellow-400">📝 Pending Homework</h3>
          <p className="text-3xl font-bold mt-2">
            {children.reduce((total, child) => {
              return total + (child.homework?.pending || 0);
            }, 0)}
          </p>
          <p className="text-sm text-gray-400">Across all children</p>
        </div>
        <div className="bg-white/5 rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-red-400">💰 Pending Fees</h3>
          <p className="text-3xl font-bold mt-2">
            ₹{children.reduce((total, child) => {
              return total + (child.fees?.pending || 0);
            }, 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-400">Total pending amount</p>
        </div>
      </div>

      {/* Children Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children.map((child) => (
          <div key={child._id} className="bg-white/5 rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {child.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{child.name}</h3>
                <p className="text-gray-400">
                  {child.classId?.name} - Section {child.section}
                </p>
                <p className="text-sm text-gray-500">
                  Roll No: {child.rollNo}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Today's Attendance:</span>
                <span className="text-green-400 font-medium">
                  {child.attendance?.today?.some(a => a.studentId.toString() === child._id && a.status === 'present') ? 'Present' : 'Absent'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Pending Homework:</span>
                <span className="text-yellow-400 font-medium">{child.homework?.pending || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Upcoming Exam:</span>
                <span className="text-blue-400 font-medium">
                  {child.exams?.upcoming?.[0]?.subject || 'None'}
                </span>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => navigate(`/parent/child-profile/${child._id}`)}
                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-center"
              >
                👤 View Full Profile
              </button>
              <button
                onClick={() => navigate(`/parent/attendance/${child._id}`)}
                className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition text-center"
              >
                📊 View Attendance
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AttendanceTab({ children }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">📊 Attendance Tracking</h2>
      
      <div className="text-center py-12">
        <p className="text-gray-400">Attendance data will be loaded from API...</p>
        <p className="text-sm text-gray-500 mt-2">This will show real attendance records from the database</p>
      </div>
    </div>
  );
}

function HomeworkTab({ children }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">📝 Homework & Assignments</h2>
      
      <div className="text-center py-12">
        <p className="text-gray-400">Homework data will be loaded from API...</p>
        <p className="text-sm text-gray-500 mt-2">This will show real homework assignments from the database</p>
      </div>
    </div>
  );
}

function ExamsTab({ children }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">📚 Exams & Results</h2>
      
      <div className="text-center py-12">
        <p className="text-gray-400">Exam data will be loaded from API...</p>
        <p className="text-sm text-gray-500 mt-2">This will show real exam schedules and results from the database</p>
      </div>
    </div>
  );
}

function FeesTab({ children }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">💰 Fee Management</h2>
      
      <div className="text-center py-12">
        <p className="text-gray-400">Fee data will be loaded from API...</p>
        <p className="text-sm text-gray-500 mt-2">This will show real fee structure and payment status from the database</p>
      </div>
    </div>
  );
}

function AnnouncementsTab({ children }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">📢 School Announcements</h2>
      
      <div className="text-center py-12">
        <p className="text-gray-400">Announcements will be loaded from API...</p>
        <p className="text-sm text-gray-500 mt-2">This will show real school announcements from the database</p>
      </div>
    </div>
  );
}
