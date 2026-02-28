import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function ChangePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      return alert("Password must be at least 8 characters");
    }

    if (newPassword !== confirm) {
      return alert("Passwords do not match");
    }

    try {
      await api.post("/auth/change-password", {
        newPassword, // ✅ BACKEND MATCH
      });

      alert("Password updated successfully");

      // 🔐 force re-login after password change
      localStorage.clear();
      navigate("/login", { replace: true });

    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Password update failed"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1220]">
      <form
        onSubmit={submit}
        className="bg-white p-8 rounded-2xl w-96 shadow-xl"
      >
        <h2 className="text-2xl font-bold text-center mb-4">
          Change Password
        </h2>

        <p className="text-sm text-gray-500 text-center mb-6">
          First login security step
        </p>

        <input
          type="password"
          placeholder="New Password"
          className="w-full p-3 border rounded mb-3"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full p-3 border rounded mb-5"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        <button className="w-full py-3 bg-blue-600 text-white rounded-xl">
          Update Password
        </button>
      </form>
    </div>
  );
}

export default ChangePassword;
