"use client";

import { useState } from "react";
import { ChartEmpty, Tooltip, compactTick, niceTicks, useMeasure } from "./primitives";

export type Bar = { key: string; label: string; value: number; detail?: string; muted?: boolean };

const M = { top: 14, right: 8, bottom: 26, left: 36 };

/** Columns from a single baseline; ≤24px thick with 4px rounded tops. */
export function BarChart({
  data,
  height = 200,
  color = "var(--series-1)",
  goal,
  goalLabel,
  yFormat = compactTick,
  valueFormat,
  empty,
}: {
  data: Bar[];
  height?: number;
  color?: string;
  goal?: number;
  goalLabel?: string;
  yFormat?: (v: number) => string;
  valueFormat?: (v: number) => string;
  empty?: string;
}) {
  const [ref, width] = useMeasure<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(goal ?? 0, ...data.map((d) => d.value));
  if (!data.length || max === 0) {
    return (
      <div ref={ref}>
        <ChartEmpty height={height}>{empty ?? "No activity in this period yet."}</ChartEmpty>
      </div>
    );
  }
  const { ticks, max: yMax } = niceTicks(0, max * 1.05, 3);
  const innerW = Math.max(10, width - M.left - M.right);
  const innerH = height - M.top - M.bottom;
  const band = innerW / data.length;
  const barW = Math.max(3, Math.min(24, band * 0.62));
  const y = (v: number) => M.top + innerH - (v / yMax) * innerH;
  const labelEvery = Math.max(1, Math.ceil(data.length / Math.max(1, Math.floor(innerW / 36))));
  const fmt = valueFormat ?? yFormat;

  return (
    <div ref={ref} className="relative select-none" style={{ height }}>
      {width > 0 ? (
        <svg width={width} height={height} role="img" aria-label="Column chart" className="overflow-visible">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={M.left} x2={M.left + innerW} y1={y(t)} y2={y(t)} stroke="var(--chart-grid)" strokeWidth={1} />
              <text x={M.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="tabular fill-[var(--text-3)] text-[11px]">
                {yFormat(t)}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const cx = M.left + band * i + band / 2;
            const h = Math.max(0, (d.value / yMax) * innerH);
            const top = M.top + innerH - h;
            const r = Math.min(4, h, barW / 2);
            const x0 = cx - barW / 2;
            const path =
              h > 0
                ? `M${x0},${M.top + innerH} V${top + r} Q${x0},${top} ${x0 + r},${top} H${x0 + barW - r} Q${x0 + barW},${top} ${x0 + barW},${top + r} V${M.top + innerH} Z`
                : "";
            return (
              <g
                key={d.key}
                tabIndex={0}
                role="button"
                aria-label={`${d.label}: ${fmt(d.value)}`}
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className="outline-none"
              >
                <rect x={M.left + band * i} y={M.top} width={band} height={innerH} fill="transparent" />
                {path ? (
                  <path
                    d={path}
                    fill={d.muted ? "var(--series-muted)" : color}
                    opacity={active == null || active === i ? 1 : 0.55}
                    style={{ transition: "opacity 120ms" }}
                  />
                ) : null}
                {i % labelEvery === 0 ? (
                  <text x={cx} y={height - 6} textAnchor="middle" className="fill-[var(--text-3)] text-[11px]">
                    {d.label}
                  </text>
                ) : null}
              </g>
            );
          })}
          <line x1={M.left} x2={M.left + innerW} y1={M.top + innerH} y2={M.top + innerH} stroke="var(--chart-axis)" strokeWidth={1} />
          {goal ? (
            <g>
              <line x1={M.left} x2={M.left + innerW} y1={y(goal)} y2={y(goal)} stroke="var(--text-3)" strokeWidth={1} opacity={0.6} />
              <text x={M.left + innerW} y={y(goal) - 5} textAnchor="end" className="fill-[var(--text-3)] text-[10px]">
                {goalLabel ?? "Goal"}
              </text>
            </g>
          ) : null}
        </svg>
      ) : null}
      {active != null ? (
        <Tooltip x={M.left + band * active + band / 2} y={y(data[active].value) - 40} containerWidth={width}>
          <div className="text-[12px] text-ink-3">{data[active].detail ?? data[active].label}</div>
          <div className="tabular text-[15px] font-semibold text-ink">{fmt(data[active].value)}</div>
        </Tooltip>
      ) : null}
    </div>
  );
}
