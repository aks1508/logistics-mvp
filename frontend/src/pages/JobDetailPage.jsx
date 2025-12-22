import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { api } from "../lib/api";
import { getUser } from "../lib/auth";
import StatusTimeline from "../components/StatusTimeline";

function statusTone(status) {
  if (status === "DELIVERED") return "success";
  if (status === "ON_ROUTE" || status === "PICKED_UP") return "info";
  if (status === "ASSIGNED") return "warn";
  return "neutral";
}

const DRIVER_STATUSES = ["PICKED_UP", "ON_ROUTE", "DELIVERED"];

// Decide what the driver is allowed to move to, based on current status
function allowedNextStatuses(current) {
  if (current === "CREATED") return [];
  if (current === "ASSIGNED") return ["PICKED_UP"];
  if (current === "PICKED_UP") return ["ON_ROUTE"];
  if (current === "ON_ROUTE") return ["DELIVERED"];
  return [];
}

export default function JobDetailPage() {
  const { id } = useParams();
  const user = getUser();
  const isAdmin = user?.role === "admin";
  const isDriver = user?.role === "driver";

  const [job, setJob] = useState(null);

  // Admin: drivers list + selection
  const [drivers, setDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState("");

  // Driver: status selection
  const [selectedStatus, setSelectedStatus] = useState("");

  const [busy, setBusy] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [error, setError] = useState("");

  // POD upload
  const [podFile, setPodFile] = useState(null);
  const [podPreviewUrl, setPodPreviewUrl] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setError("");
    setBusy(true);
    try {
      const res = await api.get(`/jobs/${id}`);
      const data = res.data;
      setJob(data);

      // Admin default values
      setSelectedDriverId(
        data?.assignedDriver?._id || data?.assignedDriver?.id || ""
      );

      // Driver default next status
      const next = allowedNextStatuses(data?.status);
      setSelectedStatus(next[0] || "");

      if (isAdmin) {
        const dr = await api.get("/admin/users?role=driver");
        setDrivers(dr.data);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load job");
    } finally {
      setBusy(false);
    }
  }

  // Load job details when job id changes
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // POD preview when file changes
  useEffect(() => {
    if (!podFile) {
      setPodPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(podFile);
    setPodPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [podFile]);

  async function uploadPOD() {
    if (!podFile) return;

    setActionBusy(true);
    setError("");
    setSuccess("");
    try {
      const fd = new FormData();
      // Field name must match multer config (most common: "photo")
      fd.append("photo", podFile);

      await api.post(`/jobs/${id}/pod/photo`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("POD Uploaded successfully");
      setPodFile(null);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to upload POD");
    } finally {
      setActionBusy(false);
    }
  }

  const podUrl = useMemo(() => {
    let photoUrl = job?.pod?.photoUrl;

    if (!photoUrl) return "";

    // normalize windows slashes
    photoUrl = String(photoUrl).replaceAll("\\", "/");

    // ensure it starts with "/"
    if (!photoUrl.startsWith("/")) photoUrl = `/${photoUrl}`;

    // ensure it points to /uploads
    // if backend saved full disk path, try to extract from /uploads onward
    const idx = photoUrl.indexOf("/uploads/");
    if (idx > 0) photoUrl = photoUrl.slice(idx);

    return photoUrl.startsWith("http")
      ? photoUrl
      : `http://localhost:5000${photoUrl}`;
  }, [job]);

  const nextStatuses = useMemo(() => {
    return allowedNextStatuses(job?.status);
  }, [job?.status]);

  async function assignDriver() {
    if (!selectedDriverId) return;
    setActionBusy(true);
    setError("");
    try {
      await api.patch(`/jobs/${id}/assign-driver`, {
        driverId: selectedDriverId,
      });
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to assign driver");
    } finally {
      setActionBusy(false);
    }
  }

  async function updateStatus() {
    if (!selectedStatus) return;
    if (!DRIVER_STATUSES.includes(selectedStatus)) return;

    setActionBusy(true);
    setError("");
    try {
      await api.patch(`/jobs/${id}/status`, { status: selectedStatus });
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update status");
    } finally {
      setActionBusy(false);
    }
  }

  // Normalize IDs (login gives "id", mongoose gives "_id")
  const userId = user?.id || user?._id;
  const assignedId = job?.assignedDriver?._id || job?.assignedDriver?.id;

  const driverControlsVisible =
    isDriver &&
    job &&
    assignedId &&
    userId &&
    String(assignedId) === String(userId);

  const canUploadPOD = driverControlsVisible && job?.status === "DELIVERED";

  return (
    <div className="space-y-4">
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
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-2xl font-semibold">
                {job.clientName || "Job Detail"}
              </div>
              <div className="mt-1">
                <Badge tone={statusTone(job.status)}>{job.status}</Badge>
              </div>
              <div className="mt-2 text-sm text-white/60">
                Job ID: {job._id}
              </div>
            </div>

            <Button variant="ghost" onClick={load} disabled={actionBusy}>
              Refresh
            </Button>
          </div>
          <StatusTimeline status={job.status} />

          {success ? (
            <Card className="p-4">
              <div className="text-emerald-200">{success}</div>
            </Card>
          ) : null}

          {/* Core details */}
          <Card className="p-5 space-y-4">
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

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-white/70">
                Assigned Driver:{" "}
                <span className="text-white">
                  {job.assignedDriver?.name || "Not assigned"}
                </span>
              </div>

              {/* Admin: assign driver */}
              {isAdmin ? (
                <div className="flex items-center gap-2">
                  <select
                    className="rounded-xl bg-white/10 px-3 py-2 text-sm ring-1 ring-white/10 outline-none"
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                  >
                    <option value="">Select driver…</option>
                    {drivers.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} ({d.email})
                      </option>
                    ))}
                  </select>
                  <Button
                    onClick={assignDriver}
                    disabled={actionBusy || !selectedDriverId}
                  >
                    Assign
                  </Button>
                </div>
              ) : null}
            </div>

            {/* Driver: status update */}
            {isDriver ? (
              <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-semibold">Driver Controls</div>

                    {!job.assignedDriver ? (
                      <div className="text-sm text-white/60 mt-1">
                        This job is not assigned to any driver yet.
                      </div>
                    ) : !assignedId || !userId ? (
                      <div className="text-sm text-white/60 mt-1">
                        Cannot verify assigned driver (missing ID).
                      </div>
                    ) : !driverControlsVisible ? (
                      <div className="text-sm text-white/60 mt-1">
                        This job is assigned to another driver.
                      </div>
                    ) : nextStatuses.length === 0 ? (
                      <div className="text-sm text-white/60 mt-1">
                        No further status updates allowed from{" "}
                        <span className="text-white">{job.status}</span>.
                      </div>
                    ) : (
                      <div className="text-sm text-white/60 mt-1">
                        Update status in order: ASSIGNED → PICKED_UP → ON_ROUTE
                        → DELIVERED
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      className="rounded-xl bg-white/10 px-3 py-2 text-sm ring-1 ring-white/10 outline-none"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      disabled={
                        !driverControlsVisible || nextStatuses.length === 0
                      }
                    >
                      {nextStatuses.length === 0 ? (
                        <option value="">No action</option>
                      ) : (
                        nextStatuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))
                      )}
                    </select>

                    <Button
                      onClick={updateStatus}
                      disabled={
                        actionBusy ||
                        !driverControlsVisible ||
                        nextStatuses.length === 0 ||
                        !selectedStatus
                      }
                    >
                      {actionBusy ? "Updating..." : "Update Status"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </Card>

          {/* POD display + driver upload */}
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

            {canUploadPOD ? (
              <div className="mt-4 rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                <div className="font-semibold">Upload POD (Driver)</div>
                <div className="text-sm text-white/60 mt-1">
                  Upload a delivery photo once the package is delivered.
                </div>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <input
                    type="file"
                    accept="image/*"
                    className="text-sm text-white/70 file:mr-3 file:rounded-xl file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white hover:file:bg-white/15"
                    onChange={(e) => setPodFile(e.target.files?.[0] || null)}
                    disabled={actionBusy}
                  />

                  <Button onClick={uploadPOD} disabled={actionBusy || !podFile}>
                    {actionBusy ? "Uploading..." : "Upload"}
                  </Button>
                </div>

                {podPreviewUrl ? (
                  <div className="mt-4">
                    <div className="text-xs text-white/60 mb-2">Preview</div>
                    <img
                      src={podPreviewUrl}
                      alt="POD Preview"
                      className="w-full max-w-xl rounded-2xl ring-1 ring-white/10"
                    />
                  </div>
                ) : null}
              </div>
            ) : driverControlsVisible ? (
              <div className="mt-4 text-sm text-white/60">
                POD upload will be enabled once status is{" "}
                <span className="text-white">DELIVERED</span>.
              </div>
            ) : null}
          </Card>
        </>
      )}
    </div>
  );
}
