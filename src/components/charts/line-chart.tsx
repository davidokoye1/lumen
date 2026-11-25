"use client";

import { useMemo, useState, type KeyboardEvent, type PointerEvent } from "react";
import { formatDateKey } from "@/lib/format";
import { diffDays } from "@/lib/time";
import { ChartEmpty, Tooltip, TooltipRow, compactTick, niceTicks, useMeasure } from "./primitives";

export type LineSeries = {
  id: string;
  label: string;
  color: string;
  points: { x: string; y: number | null }[];
  area?: boolean;
  /** End-of-line value label */
  endLabel?: boolean;
  width?: number;
};

type Props = {
  series: LineSeries[];
  height?: number;
  yFormat?: (v: number) => string;
  yDomain?: [number, number];
  refLine?: { y: number; label: string };
  empty?: string;
  minPoints?: number;
};

const M = { top: 12, right: 44, bottom: 26, left: 40 };

export function LineChart({ series, height = 220, yFormat = compactTick, yDomain, refLine, empty, minPoints = 2 }: Props) {
  const [ref, width] = useMeasure<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);

  const xs = useMemo(() => {
    const set = new Set<string>();
    for (const s of series) for (const p of s.points) if (p.y != null) set.add(p.x);
    return [...set].sort();
  }, [series]);

  const allY = series.flatMap((s) => s.points.map((p) => p.y).filter((y): y is number => y != null));
  if (xs.length < minPoints) {
    return (
      <div ref={ref}>
        <ChartEmpty height={height}>{empty ?? "Not enough data yet."}</ChartEmpty>
      </div>
    );
  }

  const rawMin = yDomain ? yDomain[0] : Math.min(...allY, refLine?.y ?? Infinity);
  const rawMax = yDomain ? yDomain[1] : Math.max(...allY, refLine?.y ?? -Infinity);
  const pad = yDomain ? 0 : (rawMax - rawMin) * 0.12 || rawMax * 0.1 || 1;
  const { ticks, min: yMin, max: yMax } = yDomain
    ? { ...niceTicks(yDomain[0], yDomain[1], 4), min: yDomain[0], max: yDomain[1] }
    : niceTicks(Math.max(0, rawMin - pad), rawMax + pad, 4);

  const innerW = Math.max(10, width - M.left - M.right);
  const innerH = height - M.top - M.bottom;
  const first = xs[0];
  const spanDays = Math.max(1, diffDays(xs[xs.length - 1], first));
  const xPos = (x: string) => M.left + (xs.length === 1 ? innerW / 2 : (diffDays(x, first) / spanDays) * innerW);
  const yPos = (y: number) => M.top + innerH - ((y - yMin) / (yMax - yMin || 1)) * innerH;

  const showMarkers = xs.length <= 45;
  const xTickCount = Math.max(2, Math.min(6, Math.floor(innerW / 90)));
  const xTicks = xs.length <= xTickCount ? xs : Array.from({ length: xTickCount }, (_, i) => xs[Math.round((i / (xTickCount - 1)) * (xs.length - 1))]);

  function onMove(e: PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    let best = 0;
    let bestD = Infinity;
    xs.forEach((x, i) => {
      const d = Math.abs(xPos(x) - px);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    setActive(best);
  }
  function onKey(e: KeyboardEvent<SVGSVGElement>) {
    if (e.key === "ArrowRight") setActive((a) => Math.min(xs.length - 1, (a ?? -1) + 1));
    else if (e.key === "ArrowLeft") setActive((a) => Math.max(0, (a ?? xs.length) - 1));
    else if (e.key === "Escape") setActive(null);
  }

  const activeX = active != null ? xs[active] : null;

  return (
    <div ref={ref} className="relative select-none" style={{ height }}>
      {width > 0 ? (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={`Line chart: ${series.map((s) => s.label).join(", ")}. Use arrow keys to inspect values.`}
          tabIndex={0}
          onPointerMove={onMove}
          onPointerLeave={() => setActive(null)}
          onKeyDown={onKey}
          onBlur={() => setActive(null)}
          className="overflow-visible outline-none"
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={M.left} x2={M.left + innerW} y1={yPos(t)} y2={yPos(t)} stroke="var(--chart-grid)" strokeWidth={1} />
              <text x={M.left - 8} y={yPos(t)} dy="0.32em" textAnchor="end" className="tabular fill-[var(--text-3)] text-[11px]">
                {yFormat(t)}
              </text>
            </g>
          ))}
          <line x1={M.left} x2={M.left + innerW} y1={M.top + innerH} y2={M.top + innerH} stroke="var(--chart-axis)" strokeWidth={1} />
          {xTicks.map((x, i) => (
            <text
              key={`${x}-${i}`}
              x={xPos(x)}
              y={height - 6}
              textAnchor={i === 0 && xTicks.length > 1 ? "start" : i === xTicks.length - 1 && xTicks.length > 1 ? "end" : "middle"}
              className="fill-[var(--text-3)] text-[11px]"
            >
              {formatDateKey(x)}
            </text>
          ))}
          {refLine ? (
            <g>
              <line
                x1={M.left}
                x2={M.left + innerW}
                y1={yPos(refLine.y)}
                y2={yPos(refLine.y)}
                stroke="var(--chart-axis)"
                strokeWidth={1}
              />
              <text x={M.left + innerW + 6} y={yPos(refLine.y)} dy="0.32em" className="fill-[var(--text-3)] text-[10px]">
                {refLine.label}
              </text>
            </g>
          ) : null}

          {series.map((s) => {
            const pts = s.points.filter((p) => p.y != null).sort((a, b) => (a.x < b.x ? -1 : 1));
            if (!pts.length) return null;
            const d = pts.map((p, i) => `${i ? "L" : "M"}${xPos(p.x).toFixed(1)},${yPos(p.y!).toFixed(1)}`).join(" ");
            const area =
              s.area && pts.length > 1
                ? `${d} L${xPos(pts[pts.length - 1].x).toFixed(1)},${M.top + innerH} L${xPos(pts[0].x).toFixed(1)},${M.top + innerH} Z`
                : null;
            const last = pts[pts.length - 1];
            return (
              <g key={s.id}>
                {area ? <path d={area} fill={s.color} opacity={0.1} /> : null}
                <path d={d} fill="none" stroke={s.color} strokeWidth={s.width ?? 2} strokeLinejoin="round" strokeLinecap="round" />
                {showMarkers
                  ? pts.map((p) => (
                      <circle key={p.x} cx={xPos(p.x)} cy={yPos(p.y!)} r={3} fill={s.color} stroke="var(--surface)" strokeWidth={2} />
                    ))
                  : null}
                <circle cx={xPos(last.x)} cy={yPos(last.y!)} r={4.5} fill={s.color} stroke="var(--surface)" strokeWidth={2} />
                {s.endLabel ? (
                  <text
                    x={xPos(last.x) + 9}
                    y={yPos(last.y!)}
                    dy="0.32em"
                    className="tabular fill-[var(--text-2)] text-[11px] font-semibold"
                  >
                    {yFormat(last.y!)}
                  </text>
                ) : null}
              </g>
            );
          })}

          {activeX ? (
            <g>
              <line
                x1={xPos(activeX)}
                x2={xPos(activeX)}
                y1={M.top}
                y2={M.top + innerH}
                stroke="var(--text-3)"
                strokeWidth={1}
                opacity={0.5}
              />
              {series.map((s) => {
                const p = s.points.find((q) => q.x === activeX && q.y != null);
                return p ? (
                  <circle key={s.id} cx={xPos(activeX)} cy={yPos(p.y!)} r={5} fill={s.color} stroke="var(--surface)" strokeWidth={2} />
                ) : null;
              })}
            </g>
          ) : null}
        </svg>
      ) : null}
      {activeX ? (
        <Tooltip x={xPos(activeX)} y={M.top} containerWidth={width}>
          <div className="mb-1 text-[12px] font-medium text-ink-2">{formatDateKey(activeX, { weekday: "short", month: "short", day: "numeric" })}</div>
          {series.map((s) => {
            const p = s.points.find((q) => q.x === activeX);
            return <TooltipRow key={s.id} color={s.color} label={s.label} value={p?.y != null ? yFormat(p.y) : "—"} />;
          })}
        </Tooltip>
      ) : null}
    </div>
  );
}
