import Badge from "./ui/Badge";

const STEPS = ["CREATED", "ASSIGNED", "PICKED_UP", "ON_ROUTE", "DELIVERED"];

function idxOf(status) {
  const i = STEPS.indexOf(status);
  return i === -1 ? 0 : i;
}

export default function StatusTimeline({ status }) {
  const current = idxOf(status);

  return (
    <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="font-semibold">Delivery Progress</div>
        <Badge>{status}</Badge>
      </div>

      <div className="mt-4 flex items-center gap-2 overflow-x-auto">
        {STEPS.map((step, i) => {
          const done = i < current;
          const active = i === current;

          return (
            <div key={step} className="flex items-center gap-2">
              <div className="flex flex-col items-center min-w-[88px]">
                <div
                  className={[
                    "h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ring-1",
                    done
                      ? "bg-emerald-500/20 ring-emerald-500/30 text-emerald-200"
                      : active
                      ? "bg-indigo-500/20 ring-indigo-500/30 text-indigo-200"
                      : "bg-white/5 ring-white/10 text-white/50",
                  ].join(" ")}
                >
                  {i + 1}
                </div>
                <div
                  className={[
                    "mt-2 text-xs text-center",
                    done
                      ? "text-emerald-200"
                      : active
                      ? "text-indigo-200"
                      : "text-white/50",
                  ].join(" ")}
                >
                  {step}
                </div>
              </div>

              {i !== STEPS.length - 1 ? (
                <div
                  className={[
                    "h-[2px] w-10 rounded-full",
                    i < current ? "bg-emerald-500/30" : "bg-white/10",
                  ].join(" ")}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
