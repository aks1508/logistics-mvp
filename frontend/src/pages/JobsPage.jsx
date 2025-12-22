import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { api } from "../lib/api";
import { getUser } from "../lib/auth";

function statusTone(status) {
  if (status === "DELIVERED") return "success";
  if (status === "ON_ROUTE" || status === "PICKED_UP") return "info";
  if (status === "ASSIGNED") return "warn";
  return "neutral";
}

export default function JobsPage() {
  const user = getUser();
  const isAdmin = user?.role === "admin";

  const [jobs, setJobs] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    setBusy(true);
    try {
      const res = await api.get("/jobs");
      setJobs(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load jobs");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const countByStatus = useMemo(() => {
    const map = {};
    for (const j of jobs) map[j.status] = (map[j.status] || 0) + 1;
    return map;
  }, [jobs]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold">Jobs</div>
          <div className="text-sm text-white/60">
            {isAdmin ? "All jobs in the system" : "Only your assigned jobs"}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(countByStatus).map(([k, v]) => (
              <Badge key={k} tone={statusTone(k)}>
                {k}: {v}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" onClick={load} disabled={busy}>
            Refresh
          </Button>
          {isAdmin ? (
            <Link to="/jobs/new">
              <Button>Create Job</Button>
            </Link>
          ) : null}
        </div>
      </div>

      {error ? (
        <Card className="p-4">
          <div className="text-red-200">{error}</div>
        </Card>
      ) : null}

      {busy ? (
        <Card className="p-6">Loading…</Card>
      ) : jobs.length === 0 ? (
        <Card className="p-6">No jobs found.</Card>
      ) : (
        <div className="grid gap-3">
          {jobs.map((job) => (
            <Link key={job._id} to={`/jobs/${job._id}`}>
              <Card className="p-4 hover:bg-white/10 transition">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold">
                      {job.clientName || "Client"} • <span className="text-white/70">{job._id}</span>
                    </div>
                    <div className="text-sm text-white/60">
                      Pickup: {job.pickup?.address || "-"} → Drop: {job.drop?.address || "-"}
                    </div>
                    <div className="mt-2 text-xs text-white/50">
                      Driver: {job.assignedDriver?.name || "Not assigned"}
                    </div>
                  </div>

                  <Badge tone={statusTone(job.status)}>{job.status}</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
