"use client";

import { CircleCheck, Flame, Info, Lightbulb, TriangleAlert } from "lucide-react";
import type { Analytics } from "@/lib/stats/analytics";
import { ChartCard } from "@/components/charts/primitives";
import { LineChart } from "@/components/charts/line-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { Heatmap } from "@/components/charts/heatmap";
import { ScatterChart } from "@/components/charts/scatter-chart";
import { MeterList } from "@/components/charts/meter-list";
import { StatTile } from "@/components/ui/stat-tile";
import { EmptyState } from "@/components/ui/misc";
import { LinkButton } from "@/components/ui/button";
import { formatCompact, formatDateKey, formatDuration, formatNumber, signed } from "@/lib/format";
import { cn } from "@/lib/utils";

const pctDelta = (v: number | null, p: number | null) => (v != null && p != null && p > 0 ? (v - p) / p : null);

export function OverviewView({ a, goalMinutes }: { a: Analytics; goalMinutes: number }) {
  if (a.empty) {
    return (
      <div className="card">
        <EmptyState
          icon={<Lightbulb />}
          title="No practice in this range yet"
          description="Analytics fill in as you practice. Every session adds data, and timed reads with questions power the most important charts."
          action={<LinkButton href="/learn">Continue your program</LinkButton>}
          className="py-20"
        />
      </div>
    );
  }
  const k = a.kpis;
  const deltaLabel = a.range === "all" ? undefined : `vs prior ${a.range === "12m" ? "year" : a.range === "90d" ? "90 days" : "30 days"}`;
  const rateTable = {
    columns: ["Date", "Effective rate", "Speed (WPM)", "Comprehension", "Reads"],
    rows: a.rateSeries.map((r) => [formatDateKey(r.date, { month: "short", day: "numeric", year: "numeric" }), r.effective, r.wpm, `${Math.round(r.comprehension * 100)}%`, r.n]),
  };
  const scatterSeries = [
    { id: "natural", label: "Timed & check-ins", color: "var(--series-1)", points: a.scatter.filter((p) => p.kind === "natural") },
    { id: "pacer", label: "Pacer", color: "var(--series-2)", points: a.scatter.filter((p) => p.kind === "pacer") },
    { id: "rsvp", label: "RSVP", color: "var(--series-3)", points: a.scatter.filter((p) => p.kind === "rsvp") },
  ].map((s) => ({ ...s, points: s.points.map((p) => ({ x: p.wpm, y: p.comprehension, title: p.title, date: p.date })) }));
  const totalExerciseMs = a.byExercise.reduce((x, e) => x + e.ms, 0);

  return (
    <div className="space-y-4">
      {a.insights.length ? (
        <ul className="grid gap-2 md:grid-cols-2">
          {a.insights.map((ins) => (
            <li
              key={ins.text}
              className={cn(
                "flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-[14px] leading-snug",
                ins.tone === "good"
                  ? "border-good/20 bg-good-soft text-ink"
                  : ins.tone === "attention"
                    ? "border-warn/25 bg-warn-soft text-ink"
                    : "border-line bg-surface text-ink",
              )}
            >
              {ins.tone === "good" ? (
                <CircleCheck className="mt-0.5 size-4 shrink-0 text-good-ink" />
              ) : ins.tone === "attention" ? (
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warn-ink" />
              ) : (
                <Info className="mt-0.5 size-4 shrink-0 text-ink-3" />
              )}
              {ins.text}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatTile
          className="col-span-2 md:col-span-1"
          label="Effective rate"
          value={k.effective.value ?? "—"}
          unit={k.effective.value != null ? "WPM" : undefined}
          delta={pctDelta(k.effective.value, k.effective.prev)}
          deltaLabel={deltaLabel}
          spark={k.effective.spark}
          hint="Needs a timed read"
        />
        <StatTile
          label="Natural speed"
          value={k.wpm.value ?? "—"}
          unit={k.wpm.value != null ? "WPM" : undefined}
          delta={pctDelta(k.wpm.value, k.wpm.prev)}
          deltaLabel={deltaLabel}
          spark={k.wpm.spark}
        />
        <StatTile
          label="Comprehension"
          value={k.comprehension.value != null ? `${Math.round(k.comprehension.value * 100)}%` : "—"}
          delta={k.comprehension.value != null && k.comprehension.prev != null ? k.comprehension.value - k.comprehension.prev : null}
          deltaFormat={(v) => `${Math.abs(Math.round(v * 100))} pts`}
          deltaLabel={deltaLabel}
          spark={k.comprehension.spark}
        />
        <StatTile
          label="Practice time"
          value={formatDuration((k.minutes.value ?? 0) * 60_000)}
          delta={pctDelta(k.minutes.value, k.minutes.prev)}
          deltaLabel={deltaLabel}
          spark={k.minutes.spark}
        />
        <StatTile
          label="Words read"
          value={formatCompact(k.words.value ?? 0)}
          delta={pctDelta(k.words.value, k.words.prev)}
          deltaLabel={deltaLabel}
          spark={k.words.spark}
        />
      </div>

      <ChartCard
        title="Reading rate over time"
        description="Daily median of your timed reads and check-ins. Effective rate is speed × comprehension; the gap between the lines is understanding you lost."
        legend={[
          { label: "Effective rate", color: "var(--series-1)" },
          { label: "Raw speed", color: "var(--series-muted)" },
        ]}
        table={rateTable}
      >
        <LineChart
          height={260}
          series={[
            { id: "wpm", label: "Raw speed", color: "var(--series-muted)", points: a.rateSeries.map((r) => ({ x: r.date, y: r.wpm })), width: 1.5 },
            {
              id: "eff",
              label: "Effective rate",
              color: "var(--series-1)",
              points: a.rateSeries.map((r) => ({ x: r.date, y: r.effective })),
              area: true,
              endLabel: true,
            },
          ]}
          yFormat={(v) => formatNumber(v)}
          empty="Do at least two timed reads (or check-ins) in this range to see your trend."
        />
      </ChartCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Comprehension"
          description="Daily average across every read with questions. Aim to stay above the 70% line."
          table={{
            columns: ["Date", "Comprehension", "Quizzes"],
            rows: a.comprehensionSeries.map((c) => [formatDateKey(c.date), `${Math.round(c.value * 100)}%`, c.n]),
          }}
        >
          <LineChart
            height={220}
            yDomain={[0, 1]}
            refLine={{ y: 0.7, label: "70%" }}
            yFormat={(v) => `${Math.round(v * 100)}%`}
            series={[
              {
                id: "comp",
                label: "Comprehension",
                color: "var(--series-1)",
                points: a.comprehensionSeries.map((c) => ({ x: c.date, y: c.value })),
                endLabel: true,
              },
            ]}
            empty="Complete reads with questions to track comprehension."
          />
        </ChartCard>

        <ChartCard
          title="Speed vs. understanding"
          description={
            a.sweetSpot
              ? `Your comprehension holds at ${Math.round(a.sweetSpot.comprehension * 100)}%+ up to about ${a.sweetSpot.upTo} WPM.`
              : "Each dot is a read with questions. Find the speed where understanding starts to fall."
          }
          legend={scatterSeries.filter((s) => s.points.length).map((s) => ({ label: s.label, color: s.color, shape: "dot" as const }))}
          table={{
            columns: ["Date", "Mode", "WPM", "Comprehension", "Text"],
            rows: a.scatter.map((p) => [formatDateKey(p.date), p.kind === "natural" ? "Timed" : p.kind === "pacer" ? "Pacer" : "RSVP", p.wpm, `${Math.round(p.comprehension * 100)}%`, p.title]),
          }}
        >
          <ScatterChart series={scatterSeries} height={220} />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <ChartCard
          className="lg:col-span-8"
          title="Consistency"
          description={`Practice minutes per day, relative to your ${goalMinutes}-minute goal`}
          table={{
            columns: ["Date", "Minutes"],
            rows: a.heatmap.weeks
              .flatMap((w) => w.days)
              .filter((d) => d.inRange && d.ms > 0)
              .map((d) => [formatDateKey(d.date, { weekday: "short", month: "short", day: "numeric" }), Math.round(d.ms / 60_000)]),
          }}
        >
          <Heatmap weeks={a.heatmap.weeks} goalMs={goalMinutes * 60_000} today={a.to} />
        </ChartCard>
        <section className="card grid grid-cols-2 gap-px overflow-hidden p-0 lg:col-span-4">
          {[
            { label: "Active days", value: `${a.consistency.activeDays}`, sub: `of ${a.consistency.totalDays} (${Math.round((a.consistency.activeDays / a.consistency.totalDays) * 100)}%)` },
            { label: "Weekly goal met", value: `${a.consistency.weeksMet}`, sub: `of ${a.consistency.weeksInRange} weeks` },
            { label: "Current streak", value: `${a.consistency.currentStreak}`, sub: "days", icon: true },
            { label: "Longest streak", value: `${a.consistency.longestStreak}`, sub: "days" },
          ].map((s) => (
            <div key={s.label} className="bg-surface p-5 ring-1 ring-line">
              <div className="flex items-center gap-1.5 text-[12px] text-ink-3">
                {s.icon ? <Flame className="size-3.5 text-accent-vivid" /> : null}
                {s.label}
              </div>
              <div className="mt-1.5 text-[26px] leading-none font-semibold tracking-[-0.02em] text-ink">{s.value}</div>
              <div className="mt-1 text-[12px] text-ink-3">{s.sub}</div>
            </div>
          ))}
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Weekly practice"
          description="Minutes per week against your weekly goal"
          table={{
            columns: ["Week of", "Minutes", "Words", "Sessions"],
            rows: a.weeklyVolume.map((w) => [formatDateKey(w.week, { month: "short", day: "numeric", year: "numeric" }), w.minutes, w.words, w.sessions]),
          }}
        >
          <BarChart
            height={220}
            goal={a.weeklyGoalMinutes}
            goalLabel={`Goal ${a.weeklyGoalMinutes} min`}
            data={a.weeklyVolume.map((w, i) => {
              const partial = i === 0 && w.week < a.from;
              const current = i === a.weeklyVolume.length - 1;
              return {
                key: w.week,
                label: formatDateKey(w.week, { month: "short", day: "numeric" }),
                value: w.minutes,
                muted: partial,
                detail: `Week of ${formatDateKey(w.week, { month: "short", day: "numeric" })} · ${w.sessions} sessions${partial ? " · partly outside range" : current ? " · in progress" : ""}`,
              };
            })}
            valueFormat={(v) => `${v} min`}
          />
        </ChartCard>
        <ChartCard
          title="Practice mix"
          description="Where your time went"
          table={{
            columns: ["Exercise", "Time", "Sessions", "Share"],
            rows: a.byExercise.map((e) => [e.label, formatDuration(e.ms), e.sessions, `${Math.round((e.ms / totalExerciseMs) * 100)}%`]),
          }}
        >
          <MeterList
            rows={a.byExercise.map((e) => ({
              key: e.kind,
              label: e.label,
              value: e.ms,
              display: formatDuration(e.ms),
              sub: `${Math.round((e.ms / totalExerciseMs) * 100)}%`,
            }))}
          />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Drill accuracy" description="Average accuracy in this range, with change from your earlier to later sessions">
          <MeterList
            max={1}
            rows={a.drillAccuracy.map((d) => ({
              key: d.kind,
              label: (
                <>
                  {d.label} <span className="text-ink-3">· {d.sessions} session{d.sessions === 1 ? "" : "s"}</span>
                </>
              ),
              value: d.accuracy ?? 0,
              display: d.accuracy != null ? `${Math.round(d.accuracy * 100)}%` : "—",
              sub: d.early != null && d.late != null ? signed((d.late - d.early) * 100, 0, " pts") : undefined,
            }))}
          />
        </ChartCard>
        <ChartCard title="Comprehension by mode" description="How well you understand in each reading mode">
          <MeterList
            max={1}
            rows={a.comprehensionByMode.map((m) => ({
              key: m.kind,
              label: (
                <>
                  {m.label} <span className="text-ink-3">· {m.n} read{m.n === 1 ? "" : "s"}</span>
                </>
              ),
              value: m.mean ?? 0,
              display: m.mean != null ? `${Math.round(m.mean * 100)}%` : "—",
            }))}
          />
          <p className="mt-4 text-[12px] leading-relaxed text-ink-3">
            RSVP removes the ability to glance back, so comprehension there is usually lower. That&apos;s expected, and
            it&apos;s why your natural reads remain the measure that matters.
          </p>
        </ChartCard>
      </div>
    </div>
  );
}
