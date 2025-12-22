import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { api } from "../lib/api";
import { Link } from "react-router-dom";

function statusTone(status) {
  if (status === "DELIVERED") return "success";
  if (status === "ON_ROUTE" || status === "PICKED_UP") return "info";
  if (status === "ASSIGNED") return "warn";
  return "neutral";
}

export default function ClientJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    setBusy(true);
    try {
      // Backend: GET /client/jobs (mounted at /client)
      const res = await api.get("/client/jobs");
      setJobs(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load client jobs");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold">My Jobs</div>
          <div className="text-sm text-white/60">Jobs you created</div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={load} disabled={busy}>
            Refresh
          </Button>
          <Link to="/client/jobs/new">
            <Button>Create Job</Button>
          </Link>
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
        <Card className="p-6">No jobs yet.</Card>
      ) : (
        <div className="grid gap-3">
          {jobs.map((job) => (
            <Link
              key={job._id}
              to={`/client/jobs/${job._id}`}
              className="block"
            >
              <Card className="p-4 hover: bg-white/10 transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">
                      {job.clientName || "Job"} •{" "}
                      <span className="text-white/70">{job._id}</span>
                    </div>

                    <div className="mt-1 text-sm text-white/60">
                      <div className="truncate">
                        Pickup: {job.pickup?.address || "-"}
                      </div>
                      <div className="truncate">
                        Drop: {job.drop?.address || "-"}
                      </div>
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
