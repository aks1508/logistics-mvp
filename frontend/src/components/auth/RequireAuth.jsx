import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isLoggedIn } from "../../lib/auth";

export default function RequireAuth() {
  const loc = useLocation();
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  return <Outlet />;
}
