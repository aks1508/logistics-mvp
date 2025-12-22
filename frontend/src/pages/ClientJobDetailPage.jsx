import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { api } from "../lib/api";
import StatusTimeline from "../components/StatusTimeline";

function statusTone(status) {
  if (status === "DELIVERED") return "success";
  if (status === "ON_ROUTE" || status === "PICKED_UP") return "info";
  if (status === "ASSIGNED") return "warn";
  return "neutral";
}

export default function ClientJobDetailPage() {
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    setBusy(true);
    try {
      const res = await api.get(`/client/jobs/${id}`);
      setJob(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load job");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const podUrl = useMemo(() => {
    let photoUrl = job?.pod?.photoUrl;
    if (!photoUrl) return "";
    photoUrl = String(photoUrl).replaceAll("\\", "/");
    if (!photoUrl.startsWith("/")) photoUrl = `/${photoUrl}`;
    const idx = photoUrl.indexOf("/uploads/");
    if (idx > 0) photoUrl = photoUrl.slice(idx);
    return photoUrl.startsWith("http")
      ? photoUrl
      : `http://localhost:5000${photoUrl}`;
  }, [job]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold">Job Details</div>
          <div className="text-sm text-white/60">Client view</div>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" onClick={load} disabled={busy}>
            Refresh
          </Button>
          <Link to="/client/jobs">
            <Button variant="ghost">Back</Button>
          </Link>
        </div>
      </div>
      {/* <StatusTimeline status={job.status} /> */}

      {busy ? (
        <Card className="p-6">Loading…</Card>
      ) : error ? (
        <Card className="p-6">
          <div className="text-red-200">{error}</div>
        </Card>
      ) : !job ? (
        <Card className="p-6">Job not found.</Card>
      ) : (
        <>
          <StatusTimeline status={job.status} />
          <Card className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xl font-semibold">{job.clientName}</div>
                <div className="mt-2 text-sm text-white/60">
                  Job ID: {job._id}
                </div>
              </div>
              <Badge tone={statusTone(job.status)}>{job.status}</Badge>
            </div>

            <div>
              <div className="text-sm text-white/60 mb-1">Pickup</div>
              <div className="font-medium">{job.pickup?.address || "-"}</div>
              <div className="text-sm text-white/60">
                {job.pickup?.contactName || "-"} •{" "}
                {job.pickup?.contactPhone || "-"}
              </div>
            </div>

            <div>
              <div className="text-sm text-white/60 mb-1">Drop</div>
              <div className="font-medium">{job.drop?.address || "-"}</div>
              <div className="text-sm text-white/60">
                {job.drop?.contactName || "-"} • {job.drop?.contactPhone || "-"}
              </div>
            </div>

            <div className="text-sm text-white/70">
              Assigned Driver:{" "}
              <span className="text-white">
                {job.assignedDriver?.name || "Not assigned"}
              </span>
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-3 text-sm text-white/60">Proof of Delivery</div>
            {podUrl ? (
              <img
                src={podUrl}
                alt="POD"
                className="w-full max-w-xl rounded-2xl ring-1 ring-white/10"
              />
            ) : (
              <div className="text-white/60 text-sm">No POD uploaded yet.</div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
