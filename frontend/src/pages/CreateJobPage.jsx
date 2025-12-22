import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { api } from "../lib/api";

export default function CreateJobPage() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    clientName: "",
    pickup: { address: "", contactName: "", contactPhone: "" },
    drop: { address: "", contactName: "", contactPhone: "" },
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  function setField(path, value) {
    setForm((prev) => {
      const next = structuredClone(prev);
      const parts = path.split(".");
      let cur = next;
      for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
      cur[parts[parts.length - 1]] = value;
      return next;
    });
  }

  function validate() {
    const e = {};
    if (!form.clientName.trim()) e.clientName = "Client name is required";
    if (!form.pickup.address.trim()) e.pickupAddress = "Pickup address is required";
    if (!form.drop.address.trim()) e.dropAddress = "Drop address is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    setError("");

    if (!validate()) return;

    setBusy(true);
    try {
      const res = await api.post("/jobs", form);
      const created = res.data;
      nav(`/jobs/${created._id}`);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create job");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-2xl font-semibold">Create Job</div>
        <div className="text-sm text-white/60">Admin only</div>
      </div>

      <Card className="p-5">
        <form onSubmit={onSubmit} className="space-y-5">
          <Input
            label="Client Name"
            value={form.clientName}
            onChange={(e) => setField("clientName", e.target.value)}
            error={errors.clientName}
            placeholder="e.g. ABC Pvt Ltd"
          />

          <div className="grid gap-3 md:grid-cols-2">
            <Card className="p-4">
              <div className="mb-3 font-semibold">Pickup</div>
              <div className="space-y-3">
                <Input
                  label="Address"
                  value={form.pickup.address}
                  onChange={(e) => setField("pickup.address", e.target.value)}
                  error={errors.pickupAddress}
                  placeholder="Pickup address"
                />
                <Input
                  label="Contact Name"
                  value={form.pickup.contactName}
                  onChange={(e) => setField("pickup.contactName", e.target.value)}
                  placeholder="Pickup contact"
                />
                <Input
                  label="Contact Phone"
                  value={form.pickup.contactPhone}
                  onChange={(e) => setField("pickup.contactPhone", e.target.value)}
                  placeholder="Pickup phone"
                />
              </div>
            </Card>

            <Card className="p-4">
              <div className="mb-3 font-semibold">Drop</div>
              <div className="space-y-3">
                <Input
                  label="Address"
                  value={form.drop.address}
                  onChange={(e) => setField("drop.address", e.target.value)}
                  error={errors.dropAddress}
                  placeholder="Drop address"
                />
                <Input
                  label="Contact Name"
                  value={form.drop.contactName}
                  onChange={(e) => setField("drop.contactName", e.target.value)}
                  placeholder="Drop contact"
                />
                <Input
                  label="Contact Phone"
                  value={form.drop.contactPhone}
                  onChange={(e) => setField("drop.contactPhone", e.target.value)}
                  placeholder="Drop phone"
                />
              </div>
            </Card>
          </div>

          {error ? (
            <div className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-200 ring-1 ring-red-500/20">
              {error}
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => nav("/jobs")} disabled={busy}>
              Cancel
            </Button>
            <Button disabled={busy}>{busy ? "Creating..." : "Create Job"}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
