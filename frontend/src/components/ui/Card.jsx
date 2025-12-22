export default function Card({ className = "", ...props }) {
  return (
    <div
      className={`rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-sm ${className}`}
      {...props}
    />
  );
}
