"use client";

import { Info } from "lucide-react";
import { LineChart } from "@/components/charts/line-chart";
import { Delta } from "@/components/ui/stat-tile";
import { useCountUp } from "@/components/training/results";

export function EffectiveRateHero({
  value,
  baseline,
  deltaPct,
  naturalWpm,
  comprehension,
  trainingWpm,
  series,
}: {
  value: number | null;
  baseline: number | null;
  deltaPct: number | null;
  naturalWpm: number | null;
  comprehension: number | null;
  trainingWpm: number | null;
  series: { date: string; value: number }[];
}) {
  const n = useCountUp(value ?? 0, 1200);
  // One point per day (median-free: last value of the day) keeps the line readable.
  const byDay = new Map<string, number>();
  for (const p of series) byDay.set(p.date, p.value);
  const points = [...byDay.entries()].slice(-30).map(([x, y]) => ({ x, y }));
  return (
    <section className="card flex flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[13px] font-medium text-ink-3">
            Effective reading rate
            <span
              className="group relative inline-flex"
              tabIndex={0}
              aria-label="Effective rate is your natural reading speed multiplied by comprehension, the median of your last five timed reads."
            >
              <Info className="size-3.5" />
              <span className="pointer-events-none absolute top-6 left-1/2 z-10 hidden w-64 -translate-x-1/2 rounded-xl border border-line bg-surface p-3 text-[12px] leading-relaxed font-normal text-ink-2 shadow-md group-hover:block group-focus:block">
                Natural reading speed × comprehension, using the median of your last five timed reads. It rewards
                understanding, not just speed.
              </span>
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-[56px] leading-none font-semibold tracking-[-0.04em] text-ink">{value == null ? "—" : n}</span>
            {value != null ? <span className="text-[15px] font-medium text-ink-3">WPM</span> : null}
            {deltaPct != null ? <Delta value={deltaPct} label={`vs baseline ${baseline}`} className="text-[13px]" /> : null}
          </div>
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-3 gap-4 border-t border-line pt-4">
        <div>
          <dt className="text-[12px] text-ink-3">Natural speed</dt>
          <dd className="tabular mt-0.5 text-[16px] font-semibold text-ink">{naturalWpm ? `${naturalWpm} WPM` : "—"}</dd>
        </div>
        <div>
          <dt className="text-[12px] text-ink-3">Comprehension</dt>
          <dd className="tabular mt-0.5 text-[16px] font-semibold text-ink">
            {comprehension != null ? `${Math.round(comprehension * 100)}%` : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[12px] text-ink-3">Training speed</dt>
          <dd className="tabular mt-0.5 text-[16px] font-semibold text-ink">{trainingWpm ? `${trainingWpm} WPM` : "—"}</dd>
        </div>
      </dl>
      <div className="mt-5 flex-1">
        <LineChart
          height={150}
          series={[{ id: "eff", label: "Effective rate", color: "var(--series-1)", points, area: true }]}
          empty="Your trend appears after two timed reads. Each one adds a point."
        />
      </div>
    </section>
  );
}
