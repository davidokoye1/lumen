"use client";

import { useState, type PointerEvent } from "react";
import { formatDateKey } from "@/lib/format";
import { ChartEmpty, Tooltip, TooltipRow, niceTicks, useMeasure } from "./primitives";

export type ScatterSeries = {
  id: string;
  label: string;
  color: string;
  points: { x: number; y: number; title: string; date: string }[];
};

const M = { top: 12, right: 14, bottom: 34, left: 40 };

/** Speed (x) vs comprehension (y). Nearest-point hover so targets are forgiving. */
export function ScatterChart({ series, height = 260, threshold = 0.7 }: { series: ScatterSeries[]; height?: number; threshold?: number }) {
  const [ref, width] = useMeasure<HTMLDivElement>();
  const [active, setActive] = useState<{ s: number; p: number } | null>(null);
  const all = series.flatMap((s) => s.points);
  if (all.length < 3) {
    return (
      <div ref={ref}>
        <ChartEmpty height={height}>Complete a few reads with questions to see how speed affects your understanding.</ChartEmpty>
      </div>
    );
  }
  const xs = niceTicks(Math.max(0, Math.min(...all.map((p) => p.x)) - 20), Math.max(...all.map((p) => p.x)) + 20, 5);
  const innerW = Math.max(10, width - M.left - M.right);
  const innerH = height - M.top - M.bottom;
  const x = (v: number) => M.left + ((v - xs.min) / (xs.max - xs.min || 1)) * innerW;
  const y = (v: number) => M.top + innerH - v * innerH;
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  function onMove(e: PointerEvent<SVGSVGElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    let best: { s: number; p: number } | null = null;
    let bd = 28 * 28;
    series.forEach((s, si) =>
      s.points.forEach((p, pi) => {
        const d = (x(p.x) - px) ** 2 + (y(p.y) - py) ** 2;
        if (d < bd) {
          bd = d;
          best = { s: si, p: pi };
        }
      }),
    );
    setActive(best);
  }

  const ap = active ? series[active.s].points[active.p] : null;

  return (
    <div ref={ref} className="relative select-none" style={{ height }}>
      {width > 0 ? (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label="Scatter plot of reading speed against comprehension"
          onPointerMove={onMove}
          onPointerLeave={() => setActive(null)}
          className="overflow-visible"
        >
          <rect
            x={M.left}
            y={y(1)}
            width={innerW}
            height={y(threshold) - y(1)}
            fill="var(--good)"
            opacity={0.05}
          />
          {yTicks.map((t) => (
            <g key={t}>
              <line x1={M.left} x2={M.left + innerW} y1={y(t)} y2={y(t)} stroke="var(--chart-grid)" />
              <text x={M.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="tabular fill-[var(--text-3)] text-[11px]">
                {Math.round(t * 100)}%
              </text>
            </g>
          ))}
          <line x1={M.left} x2={M.left + innerW} y1={y(threshold)} y2={y(threshold)} stroke="var(--chart-axis)" />
          <text x={M.left + innerW - 4} y={y(threshold) - 5} textAnchor="end" className="fill-[var(--text-3)] text-[10px]">
            {Math.round(threshold * 100)}% healthy zone
          </text>
          {xs.ticks.map((t) => (
            <text key={t} x={x(t)} y={M.top + innerH + 16} textAnchor="middle" className="tabular fill-[var(--text-3)] text-[11px]">
              {t}
            </text>
          ))}
          <text x={M.left + innerW / 2} y={height - 2} textAnchor="middle" className="fill-[var(--text-3)] text-[11px]">
            Words per minute
          </text>
          <line x1={M.left} x2={M.left + innerW} y1={M.top + innerH} y2={M.top + innerH} stroke="var(--chart-axis)" />
          {series.map((s, si) =>
            s.points.map((p, pi) => {
              const on = active && active.s === si && active.p === pi;
              return (
                <circle
                  key={`${s.id}-${pi}`}
                  cx={x(p.x)}
                  cy={y(p.y)}
                  r={on ? 6 : 4.5}
                  fill={s.color}
                  stroke="var(--surface)"
                  strokeWidth={2}
                  opacity={active && !on ? 0.5 : 1}
                />
              );
            }),
          )}
        </svg>
      ) : null}
      {ap && active ? (
        <Tooltip x={x(ap.x)} y={y(ap.y) - 60} containerWidth={width}>
          <div className="truncate text-[12px] font-medium text-ink-2">{ap.title}</div>
          <div className="mb-1 text-[11px] text-ink-3">{formatDateKey(ap.date)}</div>
          <TooltipRow color={series[active.s].color} shape="dot" label={series[active.s].label} value={`${ap.x} WPM`} />
          <TooltipRow color="transparent" label="Comprehension" value={`${Math.round(ap.y * 100)}%`} />
        </Tooltip>
      ) : null}
    </div>
  );
}
