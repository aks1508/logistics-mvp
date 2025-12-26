import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { api } from "../lib/api";
import { setAuth } from "../lib/auth";

export default function LoginPage() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;

      setAuth(token, user);

      const home = user.role === "client" ? "/client/jobs" : "/jobs";
      nav(home, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid place-items-center">
      <Card className="w-full max-w-md p-6">
        <div className="mb-4">
          <div className="text-xl font-semibold">Login</div>
          <div className="text-sm text-white/60">Use seeded credentials</div>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <Input
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@demo.com / driver1@demo.com / client@demo.com"
            autoComplete="email"
          />

          <Input
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            autoComplete="current-password"
          />

          {error ? (
            <div className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-200 ring-1 ring-red-500/20">
              {error}
            </div>
          ) : null}

          <Button disabled={busy} className="w-full">
            {busy ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
