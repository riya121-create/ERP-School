import { Navigate, Outlet, useLocation } from "react-router-dom";

function ProtectedRoute({ role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  const location = useLocation();

  /* =========================
     NOT LOGGED IN
  ========================= */
  if (!token) {
    return (
      <Navigate
        to={`/login?as=${role || ""}`}
        replace
        state={{ from: location }}
      />
    );
  }

  /* =========================
     ROLE MISMATCH
  ========================= */
  if (role && userRole !== role) {
    // 🔒 prevent admin entering teacher, etc
    return <Navigate to="/" replace />;
  }

  /* =========================
     ALLOWED
  ========================= */
  return <Outlet />;
}

export default ProtectedRoute;
