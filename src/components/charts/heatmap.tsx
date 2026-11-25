"use client";

import { useState } from "react";
import { formatDateKey } from "@/lib/format";
import { Tooltip, useMeasure } from "./primitives";

type Week = { start: string; days: { date: string; ms: number; inRange: boolean }[] };

const ROWS = ["Mon", "", "Wed", "", "Fri", "", ""];

export function levelFor(ms: number, goalMs: number) {
  if (ms <= 0) return 0;
  const r = ms / goalMs;
  if (r < 0.25) return 1;
  if (r < 0.5) return 2;
  if (r < 1) return 3;
  if (r < 1.5) return 4;
  return 5;
}

function HeatLegend() {
  return (
    <div className="mt-3 flex items-center justify-end gap-1.5 text-[11px] text-ink-3">
      <span>Less</span>
      {[0, 1, 2, 3, 4, 5].map((l) => (
        <span key={l} className="size-[11px] rounded-[3px]" style={{ background: `var(--seq-${l})` }} />
      ))}
      <span>More</span>
      <span className="ml-2 hidden sm:inline">· darkest = 150%+ of daily goal</span>
    </div>
  );
}

/** Short ranges read best as a month-style calendar: weeks as rows, weekdays as columns. */
function CalendarHeatmap({ weeks, goalMs, today }: { weeks: Week[]; goalMs: number; today: string }) {
  const [ref, width] = useMeasure<HTMLDivElement>();
  const [hover, setHover] = useState<{ date: string; ms: number; x: number; y: number } | null>(null);
  const labelW = 52;
  const gap = 6;
  const cell = Math.max(24, Math.min(52, Math.floor((width - labelW - gap * 7) / 7)));
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <div ref={ref} className="relative">
      <div className="flex" style={{ gap, paddingLeft: labelW }}>
        {DAYS.map((d) => (
          <span key={d} className="text-center text-[11px] text-ink-3" style={{ width: cell }}>
            {d}
          </span>
        ))}
      </div>
      <div className="mt-2 flex flex-col" style={{ gap }}>
        {weeks.map((w, wi) => (
          <div key={w.start} className="flex items-center" style={{ gap }}>
            <span className="shrink-0 text-[11px] text-ink-3" style={{ width: labelW - gap }}>
              {formatDateKey(w.start, { month: "short", day: "numeric" })}
            </span>
            {w.days.map((d, di) => {
              const off = d.date > today || !d.inRange;
              const lvl = off ? -1 : levelFor(d.ms, goalMs);
              const dark = lvl >= 3;
              return (
                <button
                  type="button"
                  key={d.date}
                  disabled={off}
                  aria-label={`${formatDateKey(d.date, { weekday: "short", month: "short", day: "numeric" })}: ${Math.round(d.ms / 60_000)} minutes`}
                  onPointerEnter={() => setHover({ date: d.date, ms: d.ms, x: labelW + di * (cell + gap), y: 22 + wi * (cell + gap) })}
                  onFocus={() => setHover({ date: d.date, ms: d.ms, x: labelW + di * (cell + gap), y: 22 + wi * (cell + gap) })}
                  onPointerLeave={() => setHover(null)}
                  onBlur={() => setHover(null)}
                  className="flex items-start justify-start rounded-lg p-1.5 text-[10px] leading-none font-medium transition-transform duration-100 hover:scale-105 disabled:cursor-default disabled:hover:scale-100"
                  style={{
                    width: cell,
                    height: cell,
                    background: off ? "transparent" : `var(--seq-${lvl})`,
                    border: off ? "1px dashed var(--border)" : undefined,
                    color: off ? "var(--text-3)" : dark ? "#fff" : "var(--text-2)",
                    outline: d.date === today ? "2px solid var(--text)" : undefined,
                    outlineOffset: d.date === today ? 2 : undefined,
                  }}
                >
                  {Number(d.date.slice(8))}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <HeatLegend />
      {hover ? (
        <Tooltip x={hover.x} y={hover.y - 50} containerWidth={width}>
          <div className="text-[12px] text-ink-3">{formatDateKey(hover.date, { weekday: "long", month: "short", day: "numeric" })}</div>
          <div className="tabular text-[14px] font-semibold text-ink">
            {Math.round(hover.ms / 60_000)} min
            <span className="ml-1.5 text-[12px] font-normal text-ink-3">
              {hover.ms >= goalMs ? "· goal met" : hover.ms > 0 ? `· ${Math.round((hover.ms / goalMs) * 100)}% of goal` : ""}
            </span>
          </div>
        </Tooltip>
      ) : null}
    </div>
  );
}

/** Calendar heatmap of practice minutes, binned relative to the daily goal. */
export function Heatmap({ weeks, goalMs, today }: { weeks: Week[]; goalMs: number; today: string }) {
  if (weeks.length <= 6) return <CalendarHeatmap weeks={weeks} goalMs={goalMs} today={today} />;
  return <StripHeatmap weeks={weeks} goalMs={goalMs} today={today} />;
}

function StripHeatmap({ weeks, goalMs, today }: { weeks: Week[]; goalMs: number; today: string }) {
  const [ref, width] = useMeasure<HTMLDivElement>();
  const [hover, setHover] = useState<{ date: string; ms: number; x: number; y: number } | null>(null);
  const labelW = 28;
  const gap = 3;
  const cell = Math.max(8, Math.min(weeks.length <= 20 ? 26 : 16, Math.floor((width - labelW - gap * weeks.length) / Math.max(1, weeks.length))));
  const gridW = weeks.length * (cell + gap);
  const scroll = labelW + gridW > width;

  return (
    <div ref={ref} className="relative">
      <div className={scroll ? "overflow-x-auto pb-1 scrollbar-none" : ""}>
        <div className="flex" style={{ width: scroll ? labelW + gridW : undefined }}>
          <div className="flex shrink-0 flex-col" style={{ width: labelW, gap, paddingTop: 16 }}>
            {ROWS.map((r, i) => (
              <span key={i} className="text-[10px] leading-none text-ink-3" style={{ height: cell, lineHeight: `${cell}px` }}>
                {r}
              </span>
            ))}
          </div>
          <div className="flex" style={{ gap }}>
            {weeks.map((w, wi) => {
              const showMonth = wi === 0 || w.start.slice(5, 7) !== weeks[wi - 1].start.slice(5, 7);
              return (
                <div key={w.start} className="flex flex-col" style={{ gap, width: cell }}>
                  <span className="h-[13px] overflow-visible text-[10px] leading-none whitespace-nowrap text-ink-3">
                    {showMonth && cell * 2 > 18 ? formatDateKey(w.start, { month: "short" }) : ""}
                  </span>
                  {w.days.map((d, di) => {
                    const lvl = d.date > today || !d.inRange ? -1 : levelFor(d.ms, goalMs);
                    return (
                      <button
                        type="button"
                        key={d.date}
                        aria-label={`${formatDateKey(d.date, { weekday: "short", month: "short", day: "numeric" })}: ${Math.round(d.ms / 60_000)} minutes`}
                        disabled={lvl === -1}
                        onPointerEnter={() => setHover({ date: d.date, ms: d.ms, x: labelW + wi * (cell + gap), y: 16 + di * (cell + gap) })}
                        onFocus={() => setHover({ date: d.date, ms: d.ms, x: labelW + wi * (cell + gap), y: 16 + di * (cell + gap) })}
                        onPointerLeave={() => setHover(null)}
                        onBlur={() => setHover(null)}
                        className="rounded-[3px] transition-transform duration-100 hover:scale-110 focus-visible:scale-110 disabled:cursor-default disabled:hover:scale-100"
                        style={{
                          width: cell,
                          height: cell,
                          background: lvl === -1 ? "transparent" : `var(--seq-${lvl})`,
                          outline: d.date === today ? "1.5px solid var(--text-3)" : undefined,
                          outlineOffset: d.date === today ? 1 : undefined,
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <HeatLegend />
      {hover ? (
        <Tooltip x={hover.x} y={hover.y - 46} containerWidth={width}>
          <div className="text-[12px] text-ink-3">{formatDateKey(hover.date, { weekday: "long", month: "short", day: "numeric" })}</div>
          <div className="tabular text-[14px] font-semibold text-ink">
            {Math.round(hover.ms / 60_000)} min
            <span className="ml-1.5 text-[12px] font-normal text-ink-3">
              {hover.ms >= goalMs ? "· goal met" : hover.ms > 0 ? `· ${Math.round((hover.ms / goalMs) * 100)}% of goal` : ""}
            </span>
          </div>
        </Tooltip>
      ) : null}
    </div>
  );
}
