import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { api } from "../lib/api";

export default function ClientCreateJobPage() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    pickup: { address: "", contactName: "", contactPhone: "" },
    drop: { address: "", contactName: "", contactPhone: "" },
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      // Backend: POST /client/jobs
      await api.post("/client/jobs", form);
      nav("/client/jobs", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create job");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold">Create Job</div>
          <div className="text-sm text-white/60">Client booking</div>
        </div>

        <Link to="/client/jobs">
          <Button variant="ghost">Back</Button>
        </Link>
      </div>

      <Card className="p-5">
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-3 md:grid-cols-2">
            <Card className="p-4">
              <div className="mb-3 font-semibold">Pickup</div>
              <div className="space-y-3">
                <Input
                  label="Address"
                  value={form.pickup.address}
                  onChange={(e) => setField("pickup.address", e.target.value)}
                  placeholder="Pickup address"
                  required
                />
                <Input
                  label="Contact Name"
                  value={form.pickup.contactName}
                  onChange={(e) =>
                    setField("pickup.contactName", e.target.value)
                  }
                  placeholder="Pickup contact"
                  required
                />
                <Input
                  label="Contact Phone"
                  value={form.pickup.contactPhone}
                  onChange={(e) =>
                    setField("pickup.contactPhone", e.target.value)
                  }
                  placeholder="Pickup phone"
                  required
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
                  placeholder="Drop address"
                  required
                />
                <Input
                  label="Contact Name"
                  value={form.drop.contactName}
                  onChange={(e) => setField("drop.contactName", e.target.value)}
                  placeholder="Drop contact"
                  required
                />
                <Input
                  label="Contact Phone"
                  value={form.drop.contactPhone}
                  onChange={(e) =>
                    setField("drop.contactPhone", e.target.value)
                  }
                  placeholder="Drop phone"
                  required
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
            <Button
              type="button"
              variant="ghost"
              onClick={() => nav("/client/jobs")}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button disabled={busy}>
              {busy ? "Creating..." : "Create Job"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
