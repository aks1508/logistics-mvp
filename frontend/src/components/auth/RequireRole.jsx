import { Navigate, Outlet } from "react-router-dom";
import { getUser } from "../../lib/auth";

export default function RequireRole({ roles = [] }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (roles.length && !roles.includes(user.role)) return <Navigate to="/jobs" replace />;
  return <Outlet />;
}
