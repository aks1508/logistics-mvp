import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { clearAuth, getUser, isLoggedIn } from "../../lib/auth";

export default function PageShell({ children }) {
  const nav = useNavigate();
  const location = useLocation();
  const user = getUser();
  const loggedIn = isLoggedIn();

  function logout() {
    clearAuth();
    nav("/login");
  }

  const isAdmin = user?.role === "admin";
  const isDriver = user?.role === "driver";
  const isClient = user?.role === "client";

  const linkClass = (pathPrefix) => {
    const active =
      pathPrefix === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(pathPrefix);

    return `rounded-xl px-3 py-2 text-sm hover:bg-white/10 ${
      active ? "bg-white/10" : ""
    }`;
  };

  return (
    <div className="min-h-full bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600/20 ring-1 ring-indigo-500/30 flex items-center justify-center">
              🚚
            </div>
            <div>
              <div className="text-lg font-semibold leading-tight">
                Logistics MVP
              </div>
              <div className="text-xs text-white/60">
                Admin • Driver • Client
              </div>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            {!loggedIn ? (
              <Link to="/login" className={linkClass("/login")}>
                Login
              </Link>
            ) : (
              <>
                {/* Admin + Driver links */}
                {(isAdmin || isDriver) && (
                  <Link to="/jobs" className={linkClass("/jobs")}>
                    Jobs
                  </Link>
                )}

                {/* Admin-only */}
                {isAdmin && (
                  <Link to="/jobs/new" className={linkClass("/jobs/new")}>
                    Create Job
                  </Link>
                )}

                {/* Client-only */}
                {isClient && (
                  <Link to="/client/jobs" className={linkClass("/client/jobs")}>
                    My Jobs
                  </Link>
                )}

                <div className="hidden sm:block text-sm text-white/60">
                  {user?.name} • {user?.role}
                </div>

                <Button variant="ghost" onClick={logout}>
                  Logout
                </Button>
              </>
            )}
          </nav>
        </header>

        {children}
      </div>
    </div>
  );
}
