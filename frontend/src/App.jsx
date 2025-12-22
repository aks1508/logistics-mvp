import { Routes, Route, Navigate } from "react-router-dom";
import PageShell from "./components/layout/PageShell";
import RequireAuth from "./components/auth/RequireAuth";
import RequireRole from "./components/auth/RequireRole";

import LoginPage from "./pages/LoginPage";
import JobsPage from "./pages/JobsPage";
import JobDetailPage from "./pages/JobDetailPage";
import CreateJobPage from "./pages/CreateJobPage";

import ClientJobsPage from "./pages/ClientJobsPage";
import ClientCreateJobPage from "./pages/ClientCreateJobPage";
import ClientJobDetailPage from "./pages/ClientJobDetailPage";

export default function App() {
  return (
    <PageShell>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<LoginPage />} />

        <Route element={<RequireAuth />}>
          {/* Admin + Driver */}
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />

          {/* Admin only */}
          <Route element={<RequireRole roles={["admin"]} />}>
            <Route path="/jobs/new" element={<CreateJobPage />} />
          </Route>

          {/* Client only */}
          <Route element={<RequireRole roles={["client"]} />}>
            <Route path="/client/jobs" element={<ClientJobsPage />} />
            <Route path="/client/jobs/:id" element={<ClientJobDetailPage />} />
            <Route path="/client/jobs/new" element={<ClientCreateJobPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </PageShell>
  );
}
