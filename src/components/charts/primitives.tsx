"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { BarChart3, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function useMeasure<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.floor(e.contentRect.width)));
    ro.observe(el);
    setWidth(Math.floor(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

export function niceTicks(min: number, max: number, count = 4) {
  if (min === max) {
    max = min + 1;
  }
  const span = max - min;
  const step0 = span / count;
  const mag = 10 ** Math.floor(Math.log10(step0));
  const norm = step0 / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
  return { ticks, min: lo, max: hi };
}

export function compactTick(v: number) {
  if (Math.abs(v) >= 10_000) return `${Math.round(v / 1000)}K`;
  return v.toLocaleString("en-US");
}

export type LegendItem = { label: string; color: string; shape?: "line" | "rect" | "dot" };

export function Legend({ items, className }: { items: LegendItem[]; className?: string }) {
  if (items.length < 2) return null;
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5", className)}>
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5 text-[12px] text-ink-2">
          {i.shape === "rect" ? (
            <span className="size-2.5 rounded-[3px]" style={{ background: i.color }} />
          ) : i.shape === "dot" ? (
            <span className="size-2.5 rounded-full" style={{ background: i.color }} />
          ) : (
            <span className="h-[2px] w-3.5 rounded-full" style={{ background: i.color }} />
          )}
          {i.label}
        </li>
      ))}
    </ul>
  );
}

export type TableSpec = { columns: string[]; rows: (string | number)[][] };

/**
 * Chart container: title, optional legend, and a chart/table toggle so every
 * value is reachable without hovering.
 */
export function ChartCard({
  title,
  description,
  legend,
  table,
  children,
  action,
  className,
  footer,
}: {
  title: ReactNode;
  description?: ReactNode;
  legend?: LegendItem[];
  table?: TableSpec;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
  footer?: ReactNode;
}) {
  const [view, setView] = useState<"chart" | "table">("chart");
  return (
    <section className={cn("card flex flex-col p-5 sm:p-6", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{title}</h3>
          {description ? <p className="mt-0.5 text-[13px] leading-snug text-ink-3">{description}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {action}
          {table ? (
            <button
              type="button"
              onClick={() => setView((v) => (v === "chart" ? "table" : "chart"))}
              className="flex size-8 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
              aria-label={view === "chart" ? "Show as table" : "Show as chart"}
              title={view === "chart" ? "Table view" : "Chart view"}
            >
              {view === "chart" ? <Table2 className="size-4" /> : <BarChart3 className="size-4" />}
            </button>
          ) : null}
        </div>
      </div>
      {legend && view === "chart" ? <Legend items={legend} className="mb-3" /> : null}
      <div className="min-h-0 flex-1">
        {view === "table" && table ? <DataTable spec={table} /> : children}
      </div>
      {footer ? <div className="mt-4">{footer}</div> : null}
    </section>
  );
}

export function DataTable({ spec }: { spec: TableSpec }) {
  return (
    <div className="max-h-72 overflow-auto rounded-xl border border-line">
      <table className="w-full text-left text-[13px]">
        <thead className="sticky top-0 bg-surface-2 text-ink-3">
          <tr>
            {spec.columns.map((c) => (
              <th key={c} className="px-3 py-2 font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="tabular">
          {spec.rows.length === 0 ? (
            <tr>
              <td colSpan={spec.columns.length} className="px-3 py-6 text-center text-ink-3">
                No data in this range
              </td>
            </tr>
          ) : (
            spec.rows.map((r, i) => (
              <tr key={i} className="border-t border-line">
                {r.map((cell, j) => (
                  <td key={j} className={cn("px-3 py-2", j === 0 ? "text-ink-2" : "text-ink")}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Tooltip({
  x,
  y,
  containerWidth,
  children,
}: {
  x: number;
  y: number;
  containerWidth: number;
  children: ReactNode;
}) {
  const w = 190;
  const left = Math.min(Math.max(0, x + 14), Math.max(0, containerWidth - w));
  const flip = x + 14 + w > containerWidth && x - w - 14 > 0;
  return (
    <div
      className="pointer-events-none absolute z-10 rounded-xl border border-line bg-surface px-3 py-2.5 shadow-md"
      style={{ left: flip ? x - w - 14 : left, top: Math.max(0, y - 10), width: w }}
      role="presentation"
    >
      {children}
    </div>
  );
}

export function TooltipRow({ color, label, value, shape = "line" }: { color: string; label: string; value: ReactNode; shape?: "line" | "dot" }) {
  return (
    <div className="flex items-center justify-between gap-3 py-0.5">
      <span className="flex min-w-0 items-center gap-1.5 text-[12px] text-ink-3">
        {shape === "dot" ? (
          <span className="size-2 shrink-0 rounded-full" style={{ background: color }} />
        ) : (
          <span className="h-[2px] w-3 shrink-0 rounded-full" style={{ background: color }} />
        )}
        <span className="truncate">{label}</span>
      </span>
      <span className="tabular text-[13px] font-semibold text-ink">{value}</span>
    </div>
  );
}

export function ChartEmpty({ height, children }: { height: number; children: ReactNode }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl border border-dashed border-line-strong text-center text-[13px] text-ink-3"
      style={{ height }}
    >
      <div className="max-w-xs px-6">{children}</div>
    </div>
  );
}
