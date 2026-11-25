import type { ReactNode } from "react";

/** Ranked horizontal bars — one hue, aligned on a shared baseline. */
export function MeterList({
  rows,
  max,
  color = "var(--series-1)",
}: {
  rows: { key: string; label: ReactNode; value: number; display: ReactNode; sub?: ReactNode }[];
  max?: number;
  color?: string;
}) {
  const m = max ?? Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-3.5">
      {rows.map((r) => (
        <li key={r.key}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="truncate text-[13px] text-ink-2">{r.label}</span>
            <span className="tabular shrink-0 text-[13px] font-semibold text-ink">
              {r.display}
              {r.sub ? <span className="ml-1.5 font-normal text-ink-3">{r.sub}</span> : null}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out-expo"
              style={{ width: `${Math.max(r.value > 0 ? 2 : 0, (r.value / m) * 100)}%`, background: color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
