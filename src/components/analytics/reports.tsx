"use client";

import { Award, BookOpen, GraduationCap, Trophy } from "lucide-react";
import type { PersonalRecord, Report } from "@/lib/stats/analytics";
import { ChartCard } from "@/components/charts/primitives";
import { BarChart } from "@/components/charts/bar-chart";
import { Delta } from "@/components/ui/stat-tile";
import { SessionRow } from "@/components/sessions/session-row";
import { EmptyState } from "@/components/ui/misc";
import { formatDateKey, formatNumber } from "@/lib/format";
import { PeriodNav } from "./nav";

type Row = { label: string; cur: number | null; prev: number | null; fmt: (v: number) => string; kind: "pct" | "pts" };

export function ReportsView({ r, records }: { r: Report; records: PersonalRecord[] }) {
  const pct = (v: number) => `${Math.round(v * 100)}%`;
  const rows: Row[] = [
    { label: "Active days", cur: r.current.activeDays, prev: r.previous.activeDays, fmt: String, kind: "pct" },
    { label: "Sessions", cur: r.current.sessions, prev: r.previous.sessions, fmt: String, kind: "pct" },
    { label: "Practice time", cur: r.current.minutes, prev: r.previous.minutes, fmt: (v) => `${v} min`, kind: "pct" },
    { label: "Words read", cur: r.current.words, prev: r.previous.words, fmt: formatNumber, kind: "pct" },
    { label: "Natural speed", cur: r.current.wpm, prev: r.previous.wpm, fmt: (v) => `${v} WPM`, kind: "pct" },
    { label: "Effective rate", cur: r.current.effective, prev: r.previous.effective, fmt: (v) => `${v} WPM`, kind: "pct" },
    { label: "Comprehension", cur: r.current.comprehension, prev: r.previous.comprehension, fmt: pct, kind: "pts" },
    { label: "Drill accuracy", cur: r.current.drillAccuracy, prev: r.previous.drillAccuracy, fmt: pct, kind: "pts" },
  ];
  const periodWord = r.period === "week" ? "week" : "month";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PeriodNav period={r.period} offset={r.offset} label={r.label} canBack={r.canGoBack} canForward={r.canGoForward} />
        <span className="text-[13px] text-ink-3">{r.isCurrent ? `This ${periodWord} so far` : `Compared with the previous ${periodWord}`}</span>
      </div>

      <section className="card p-5 sm:p-6">
        <p className="text-[13px] font-medium text-ink-3">{r.period === "week" ? "Weekly report" : "Monthly report"}</p>
        <p className="mt-1 text-[20px] leading-snug font-semibold tracking-[-0.015em] text-ink">{r.summary}</p>
      </section>

      <div className="grid gap-4 lg:grid-cols-12">
        <section className="card overflow-hidden lg:col-span-7">
          <table className="w-full text-[14px]">
            <caption className="sr-only">Period comparison</caption>
            <thead>
              <tr className="border-b border-line text-left text-[12px] text-ink-3">
                <th className="px-5 py-3 font-medium">Metric</th>
                <th className="px-3 py-3 text-right font-medium">This {periodWord}</th>
                <th className="px-3 py-3 text-right font-medium">Previous</th>
                <th className="px-5 py-3 text-right font-medium">Change</th>
              </tr>
            </thead>
            <tbody className="tabular">
              {rows.map((row) => {
                const delta =
                  row.cur != null && row.prev != null
                    ? row.kind === "pts"
                      ? row.cur - row.prev
                      : row.prev > 0
                        ? (row.cur - row.prev) / row.prev
                        : null
                    : null;
                return (
                  <tr key={row.label} className="border-b border-line last:border-0">
                    <td className="px-5 py-3 text-ink-2">{row.label}</td>
                    <td className="px-3 py-3 text-right font-semibold text-ink">{row.cur != null ? row.fmt(row.cur) : "—"}</td>
                    <td className="px-3 py-3 text-right text-ink-3">{row.prev != null ? row.fmt(row.prev) : "—"}</td>
                    <td className="px-5 py-3 text-right">
                      {delta != null ? (
                        <Delta value={delta} format={row.kind === "pts" ? (v) => `${Math.abs(Math.round(v * 100))} pts` : undefined} />
                      ) : (
                        <span className="text-[12px] text-ink-3">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
        <div className="space-y-4 lg:col-span-5">
          <ChartCard
            title="Daily practice"
            description="Minutes per day"
            table={{ columns: ["Date", "Minutes", "Words"], rows: r.daily.filter((d) => !d.future).map((d) => [formatDateKey(d.date, { weekday: "short", month: "short", day: "numeric" }), d.minutes, d.words]) }}
          >
            <BarChart
              height={180}
              data={r.daily.map((d) => ({
                key: d.date,
                label: d.label,
                value: d.minutes,
                detail: formatDateKey(d.date, { weekday: "long", month: "short", day: "numeric" }),
              }))}
              valueFormat={(v) => `${v} min`}
              empty={`No practice this ${periodWord}.`}
            />
          </ChartCard>
          <section className="card p-5">
            <h3 className="text-[15px] font-semibold text-ink">Highlights</h3>
            <ul className="mt-3 space-y-3 text-[14px]">
              <li className="flex items-start gap-3">
                <Trophy className="mt-0.5 size-4 shrink-0 text-accent-vivid" />
                {r.bestRead ? (
                  <span className="text-ink-2">
                    Best read: <span className="font-semibold text-ink">{r.bestRead.effective} effective WPM</span> on &ldquo;{r.bestRead.title}&rdquo; (
                    {r.bestRead.wpm} WPM, {Math.round(r.bestRead.comprehension * 100)}%)
                  </span>
                ) : (
                  <span className="text-ink-3">No timed reads this {periodWord}</span>
                )}
              </li>
              <li className="flex items-start gap-3">
                <GraduationCap className="mt-0.5 size-4 shrink-0 text-accent-vivid" />
                {r.lessons.length ? (
                  <span className="text-ink-2">
                    {r.lessons.length} program session{r.lessons.length === 1 ? "" : "s"}: {r.lessons.map((l) => l.title).join(", ")}
                  </span>
                ) : (
                  <span className="text-ink-3">No program sessions completed</span>
                )}
              </li>
              <li className="flex items-start gap-3">
                <Award className="mt-0.5 size-4 shrink-0 text-accent-vivid" />
                {r.achievements.length ? (
                  <span className="text-ink-2">
                    Badges: {r.achievements.slice(0, 4).map((a) => a.title).join(", ")}
                    {r.achievements.length > 4 ? ` and ${r.achievements.length - 4} more` : ""}
                  </span>
                ) : (
                  <span className="text-ink-3">No new badges</span>
                )}
              </li>
            </ul>
          </section>
        </div>
      </div>

      <section className="card p-5 sm:p-6">
        <h3 className="text-[15px] font-semibold text-ink">Sessions this {periodWord}</h3>
        {r.sessions.length ? (
          <ul className="mt-2 divide-y divide-line">
            {r.sessions.slice(0, 20).map((s) => (
              <SessionRow key={s.id} s={s} compact />
            ))}
          </ul>
        ) : (
          <EmptyState icon={<BookOpen />} title="Nothing logged" description={`Sessions you complete this ${periodWord} will be listed here.`} />
        )}
      </section>

      <section>
        <h3 className="mb-3 text-[13px] font-semibold tracking-[0.06em] text-ink-3 uppercase">All-time personal records</h3>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {records.map((rec) => (
            <li key={rec.id} className="card p-4">
              <div className="text-[12px] font-medium text-ink-3">{rec.label}</div>
              <div className="mt-1.5 text-[22px] leading-none font-semibold tracking-[-0.02em] text-ink">{rec.value}</div>
              <div className="mt-2 line-clamp-2 text-[12px] leading-snug text-ink-3">{rec.detail}</div>
              {rec.date ? <div className="mt-1 text-[11px] text-ink-3">{formatDateKey(rec.date, { month: "short", day: "numeric", year: "numeric" })}</div> : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
