import { useState } from "react"
import api from "../services/api"
import { useNavigate, useSearchParams } from "react-router-dom"
import useSidebarStore from "@/store/useSidebarStore";

function Login() {
  const [identifier, setIdentifier] = useState("") // email OR phone
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const [params] = useSearchParams()

  // 🎯 Role from landing page
  const intendedRole = params.get("as") // admin | teacher | student | parent

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await api.post("/auth/login", {
        // 🔑 BACKEND EXPECTS "email" — so we map here
        email: identifier,   // ✅ MAGIC LINE
        password,
        intendedRole
      })

      const { token, role, forcePasswordChange,sessionToken  } = res.data

      // 🔐 Save auth
      localStorage.setItem("token", token)
      localStorage.setItem("role", role)
      
//  ONLY FOR TEACHER
 if (role === "teacher" && sessionToken) {
        localStorage.setItem("teacherSessionToken", sessionToken);
      }
      // 🔁 First login password reset
      if (forcePasswordChange) {
        navigate("/change-password", { replace: true })
        return
      }

      // 🚀 Redirect by role
      switch (role) {
        case "admin":
            useSidebarStore.getState().open();
          navigate("/admin", { replace: true })
          
          break
        case "teacher":
          navigate("/teacher", { replace: true })
          break
        case "student":
          navigate("/student", { replace: true })
          break
        case "parent":
          navigate("/parent", { replace: true })
          break
        default:
          navigate("/login", { replace: true })
      }

    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Login failed. Please check credentials."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1220]">
      <form
        onSubmit={handleLogin}
        className="bg-white w-96 p-8 rounded-2xl shadow-xl"
      >
        <h2 className="text-2xl font-bold text-center">
          {intendedRole
            ? `${intendedRole.toUpperCase()} Login`
            : "Login"}
        </h2>

        <p className="text-sm text-gray-500 text-center mt-1 mb-6">
          Authorized institutional access only
        </p>

        {/* EMAIL / PHONE */}
        <input
          type="text"
          placeholder="Email or Phone Number"
          className="w-full mb-4 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="
            w-full py-3 rounded-xl
            bg-blue-600 hover:bg-blue-700
            text-white font-medium
            disabled:opacity-60
          "
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-xs text-gray-400 text-center mt-4">
          JN Public School • Secure Academic System
        </p>
      </form>
    </div>
  )
}

export default Login
