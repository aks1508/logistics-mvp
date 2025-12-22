export default function Badge({ children, tone = "neutral" }) {
  const toneCls =
    tone === "success"
      ? "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/30"
      : tone === "warn"
      ? "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30"
      : tone === "info"
      ? "bg-sky-500/15 text-sky-200 ring-1 ring-sky-500/30"
      : "bg-white/10 text-white/80 ring-1 ring-white/15";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs ${toneCls}`}>
      {children}
    </span>
  );
}
