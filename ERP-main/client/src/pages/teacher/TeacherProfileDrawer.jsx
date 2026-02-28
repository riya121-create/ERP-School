import api from "../../services/api";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

function TeacherProfileDrawer({ open, onClose, teacher }) {
  const navigate = useNavigate();

  if (!open) return null;

  const handleLogout = async () => {
  try {
    const sessionToken = localStorage.getItem("teacherSessionToken");

    if (sessionToken) {
      await api.post(
        "/teacher/logout",
        {},
        {
          headers: {
            "x-session-token": sessionToken
          }
        }
      );
    }
  } catch (err) {
    console.error("Logout failed", err);
  } finally {
    // 🧹 clear all auth/session data
    localStorage.removeItem("token");
    localStorage.removeItem("teacherSessionToken");
    onClose();
    navigate("/", { replace: true });
  }
};


  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
      />

      {/* DRAWER */}
      <aside
        className="
          fixed top-0 right-0 h-full w-[380px]
          bg-[#0B1220] text-white z-50
          shadow-2xl flex flex-col
        "
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <h2 className="text-lg font-semibold">Teacher Profile</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold">
              {teacher?.name?.[0] || "T"}
            </div>
            <div>
              <p className="font-semibold text-lg">{teacher?.name}</p>
              <p className="text-sm text-gray-400">
                {teacher?.department || "Teacher"}
              </p>
            </div>
          </div>

          <Info label="Email" value={teacher?.email} />
          <Info label="Employee ID" value={teacher?.employeeId} />
          <Info label="Qualification" value={teacher?.qualification} />
          <Info
            label="Experience"
            value={`${teacher?.experience || 0} years`}
          />
        </div>

        {/* ACTIONS */}
        <div className="p-6 border-t border-white/10 space-y-3">
          <button
            onClick={() => {
              onClose();
              navigate("/change-password");
            }}
            className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20"
          >
            Change Password
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex justify-between text-sm text-gray-300">
      <span>{label}</span>
      <span className="text-white font-medium">
        {value || "—"}
      </span>
    </div>
  );
}

export default TeacherProfileDrawer;
