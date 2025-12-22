export default function Input({ className = "", label, error, ...props }) {
  return (
    <label className="block">
      {label ? <div className="mb-1 text-sm text-white/80">{label}</div> : null}
      <input
        className={`w-full rounded-xl bg-white/10 px-3 py-2 text-white placeholder:text-white/40 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500 ${className}`}
        {...props}
      />
      {error ? <div className="mt-1 text-xs text-red-300">{error}</div> : null}
    </label>
  );
}
