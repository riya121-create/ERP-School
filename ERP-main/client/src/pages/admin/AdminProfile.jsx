import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { ArrowLeft, User, Mail, KeyRound, Save, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function AdminProfile() {
  const navigate = useNavigate();

  const adminEmail = localStorage.getItem("email") || "admin@school.com";
  const adminName  = adminEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  /* change password state */
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [showPw, setShowPw]       = useState({ current: false, newPass: false, confirm: false });
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState("");

  const toggleShow = field => setShowPw(p => ({ ...p, [field]: !p[field] }));

  const changePassword = async e => {
    e.preventDefault();
    setError(""); setSuccess(false);
    if (passwords.newPass.length < 8) return setError("Password must be at least 8 characters");
    if (passwords.newPass !== passwords.confirm) return setError("Passwords do not match");

    setLoading(true);
    try {
      await api.post("/auth/change-password", { newPassword: passwords.newPass });
      setSuccess(true);
      setPasswords({ current: "", newPass: "", confirm: "" });
      setTimeout(() => {
        localStorage.clear();
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Password update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 text-gray-100 max-w-xl">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white/[0.05] border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">Account details & security settings</p>
        </div>
      </div>

      {/* PROFILE CARD */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#161616] p-6">
        <div className="flex items-center gap-4">
          {/* avatar */}
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl font-bold text-indigo-400 flex-shrink-0">
            {adminEmail.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-bold text-white">{adminName}</p>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
              <Mail size={13} /> {adminEmail}
            </p>
            <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
              <ShieldCheck size={11} /> Administrator
            </span>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-white/[0.06] grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] p-3">
            <p className="text-[11px] text-gray-600 uppercase tracking-wider mb-1">Email</p>
            <p className="text-sm text-gray-200 font-medium">{adminEmail}</p>
          </div>
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] p-3">
            <p className="text-[11px] text-gray-600 uppercase tracking-wider mb-1">Role</p>
            <p className="text-sm text-gray-200 font-medium">Admin</p>
          </div>
        </div>
      </div>

      {/* CHANGE PASSWORD */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#161616] p-6">
        <div className="flex items-center gap-2 mb-5">
          <KeyRound size={15} className="text-amber-400" />
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Change Password</h2>
        </div>

        <form onSubmit={changePassword} className="space-y-3">
          <PwField
            label="New Password *"
            value={passwords.newPass}
            show={showPw.newPass}
            onToggle={() => toggleShow("newPass")}
            onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))}
            placeholder="Min. 8 characters"
          />
          <PwField
            label="Confirm Password *"
            value={passwords.confirm}
            show={showPw.confirm}
            onToggle={() => toggleShow("confirm")}
            onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
            placeholder="Re-enter new password"
          />

          {/* strength indicator */}
          {passwords.newPass && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                    passwords.newPass.length >= i * 3
                      ? passwords.newPass.length >= 12 ? "bg-emerald-500"
                        : passwords.newPass.length >= 8 ? "bg-amber-500"
                        : "bg-red-500"
                      : "bg-white/[0.08]"
                  }`} />
                ))}
              </div>
              <p className="text-[11px] text-gray-600">
                {passwords.newPass.length < 8 ? "Too short" : passwords.newPass.length < 12 ? "Good" : "Strong"}
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-2.5 text-sm text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-4 py-2.5 text-sm text-emerald-400">
              Password updated! Redirecting to login…
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition mt-2">
            <Save size={14} />
            {loading ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

function PwField({ label, value, show, onToggle, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5 font-medium">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className="w-full bg-white/[0.05] border border-white/10 text-gray-200 placeholder-gray-600 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-indigo-500/60 transition"
        />
        <button type="button" onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition">
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}
