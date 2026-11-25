import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Check, Clock, Flame, Medal, Sparkles, Target, Timer } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth/session";
import { loadDashboard } from "@/lib/services/dashboard";
import { formatCompact, formatDuration, formatHours } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Card, CardHeader } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { ProgressBar, ProgressRing } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/misc";
import { exerciseIcons } from "@/components/ui/icons";
import { EffectiveRateHero } from "@/components/dashboard/hero";
import { QuickStart } from "@/components/dashboard/quick-start";
import { SessionRow } from "@/components/sessions/session-row";

export const metadata: Metadata = { title: "Home" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const user = await requireOnboardedUser();
  const { welcome } = await searchParams;
  const d = loadDashboard(user);
  const o = d.overview;
  const first = user.name.split(" ")[0];
  const goalMin = user.preferences.dailyGoalMinutes;
  const todayMin = Math.floor(o.todayMs / 60_000);
  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: user.preferences.timezone,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 animate-rise">
          <p className="text-[13px] font-medium text-ink-3">{dateLabel}</p>
          <h1 className="mt-1 text-[30px] leading-tight font-semibold tracking-[-0.03em] text-ink sm:text-[34px]">
            {welcome ? `Welcome to Lumen, ${first}` : `${d.greeting}, ${first}`}
          </h1>
          <p className="mt-2 flex max-w-xl items-start gap-2 text-[15px] leading-relaxed text-ink-2">
            <span className="mt-[3px] shrink-0 rounded-md bg-accent-soft px-1.5 py-px text-[11px] font-semibold text-accent-ink">
              {d.note.tag}
            </span>
            {d.note.text}
          </p>
        </div>
        <QuickStart
          next={d.next ? { id: d.next.id, number: d.next.number, title: d.next.title, minutes: d.next.minutes } : null}
          checkIn={d.checkInAvailable}
          className="w-full sm:w-auto"
        />
      </header>

      {/* Row 1: hero + today */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <EffectiveRateHero
            value={o.effectiveRate}
            baseline={o.baseline?.effective ?? null}
            deltaPct={o.effectiveDeltaPct}
            naturalWpm={o.naturalWpm}
            comprehension={o.comprehension}
            trainingWpm={o.trainingWpm}
            series={o.effectiveSeries}
          />
        </div>
        <section className="card flex flex-col p-5 sm:p-6 lg:col-span-5">
          <CardHeader
            title="Today"
            description={o.goalProgress >= 1 ? "Daily goal reached. Anything more is a bonus." : `Goal: ${goalMin} minutes of practice`}
          />
          <div className="mt-5 flex items-center gap-6">
            <ProgressRing value={o.goalProgress} size={124} stroke={11} label={`${todayMin} of ${goalMin} minutes today`}>
              {o.goalProgress >= 1 ? (
                <Check className="size-8 text-accent-vivid animate-pop" strokeWidth={2.5} />
              ) : (
                <>
                  <span className="text-[26px] leading-none font-semibold tracking-[-0.03em] text-ink">{todayMin}</span>
                  <span className="mt-1 text-[12px] text-ink-3">of {goalMin} min</span>
                </>
              )}
            </ProgressRing>
            <div className="min-w-0 flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <Flame className={cn("size-5", o.streak.current ? "text-accent-vivid" : "text-ink-3")} />
                  <span className="text-[22px] leading-none font-semibold tracking-[-0.02em] text-ink">{o.streak.current}</span>
                  <span className="text-[13px] text-ink-3">day streak</span>
                </div>
                <p className="mt-1 text-[12px] text-ink-3">
                  {o.streak.atRisk
                    ? "Practice today to keep it going"
                    : o.streak.practicedToday
                      ? `Longest: ${o.streak.longest} day${o.streak.longest === 1 ? "" : "s"}`
                      : "Start a streak today"}
                </p>
              </div>
              <div>
                <div className="flex items-baseline justify-between text-[12px]">
                  <span className="font-medium text-ink-2">This week</span>
                  <span className="tabular text-ink-3">
                    {o.weekly.daysThisWeek}/{o.weekly.goalDays} days
                    {o.weekly.current > 0 ? ` · ${o.weekly.current}-week streak` : ""}
                  </span>
                </div>
                <ProgressBar value={o.weekly.daysThisWeek / o.weekly.goalDays} size="sm" className="mt-1.5" />
              </div>
            </div>
          </div>
          <ol className="mt-6 grid grid-cols-7 gap-1.5" aria-label="This week">
            {o.week.map((day) => (
              <li key={day.date} className="flex flex-col items-center gap-1.5">
                <span className={cn("text-[11px] font-medium", day.isToday ? "text-ink" : "text-ink-3")}>{day.label.slice(0, 1)}</span>
                <span
                  title={`${day.label}: ${Math.round(day.ms / 60_000)} min`}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full text-[11px] font-semibold",
                    day.active
                      ? day.ms >= o.dailyGoalMs
                        ? "bg-accent text-accent-fg"
                        : "bg-accent-soft-2 text-accent-ink"
                      : day.isFuture
                        ? "border border-dashed border-line-strong"
                        : "bg-surface-2",
                    day.isToday && "ring-2 ring-ink/80 ring-offset-2 ring-offset-surface",
                  )}
                >
                  {day.active ? Math.round(day.ms / 60_000) : ""}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[11px] text-ink-3">Minutes practiced per day. A filled circle means the goal was met.</p>
        </section>
      </div>

      {/* Row 2: program + challenges */}
      <div className="grid gap-4 lg:grid-cols-12">
        <section className="card p-5 sm:p-6 lg:col-span-7">
          <CardHeader
            title="Your program"
            description={`${d.stageMeta.title} · ${d.stageMeta.tagline}`}
            action={
              <Link href="/learn" className="text-[13px] font-medium text-ink-3 hover:text-ink">
                View all
              </Link>
            }
          />
          <div className="mt-4 grid grid-cols-3 gap-2">
            {d.stages.map((s) => (
              <div key={s.id}>
                <div className="flex items-center justify-between text-[11px]">
                  <span className={cn("font-medium", s.id === d.currentStage.id ? "text-ink" : "text-ink-3")}>{s.title}</span>
                  <span className="tabular text-ink-3">
                    {s.done}/{s.total}
                  </span>
                </div>
                <ProgressBar value={s.done / s.total} size="xs" className="mt-1.5" tone={s.done === s.total ? "good" : "accent"} />
              </div>
            ))}
          </div>
          {d.next ? (
            <Link
              href={`/learn/${d.next.id}`}
              className="group mt-5 flex items-center gap-4 rounded-2xl border border-line bg-bg p-4 transition-colors hover:border-line-strong hover:bg-surface-2"
            >
              <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-accent text-accent-fg">
                <span className="text-[10px] leading-none font-semibold uppercase opacity-80">Next</span>
                <span className="text-[18px] leading-tight font-semibold">{d.next.number}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold text-ink">{d.next.title}</span>
                <span className="mt-0.5 block truncate text-[13px] text-ink-3">{d.next.subtitle}</span>
                <span className="mt-1.5 flex items-center gap-3 text-[12px] text-ink-3">
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 font-medium text-ink-2">{d.next.focus}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" /> {d.next.minutes} min
                  </span>
                  <span>
                    {d.next.steps.length} step{d.next.steps.length === 1 ? "" : "s"}
                  </span>
                </span>
              </span>
              <ArrowRight className="size-5 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
            </Link>
          ) : (
            <EmptyState
              icon={<Sparkles />}
              title="Program complete"
              description="You've finished all 25 sessions. Keep your system going with daily practice and weekly check-ins."
              className="py-8"
            />
          )}
          <p className="mt-3 text-[12px] text-ink-3">
            {d.program.done} of {d.program.total} sessions complete · {Math.round(d.program.fraction * 100)}% of the Lumen Method
          </p>
        </section>

        <section className="card p-5 sm:p-6 lg:col-span-5">
          <CardHeader
            title="Weekly challenges"
            description="Resets every Monday"
            icon={<Medal className="size-4 text-ink-3" />}
            action={
              <Link href="/achievements" className="text-[13px] font-medium text-ink-3 hover:text-ink">
                Badges
              </Link>
            }
          />
          <ul className="mt-5 space-y-5">
            {d.challenges.map((c) => (
              <li key={c.key}>
                <div className="flex items-start justify-between gap-3">
                  <span className={cn("text-[14px] font-medium", c.done ? "text-ink-3 line-through decoration-ink-3/40" : "text-ink")}>
                    {c.title}
                  </span>
                  <span
                    className={cn(
                      "tabular shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      c.done ? "bg-good-soft text-good-ink" : "bg-surface-2 text-ink-2",
                    )}
                  >
                    {c.done ? "Done" : `+${c.xp} XP`}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <ProgressBar value={c.progress} size="sm" tone={c.done ? "good" : "accent"} />
                  <span className="tabular w-20 shrink-0 text-right text-[12px] text-ink-3">
                    {formatCompact(c.current)}/{formatCompact(c.target)}
                    {c.unit ? ` ${c.unit === "words" ? "" : c.unit}` : ""}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Row 3: recommendations */}
      <section>
        <h2 className="mb-3 text-[13px] font-semibold tracking-[0.06em] text-ink-3 uppercase">Recommended for you</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {d.recommendations.map((r) => {
            const Icon = exerciseIcons[r.kind] ?? BookOpen;
            return (
              <Link
                key={r.id}
                href={r.href}
                className="card group flex flex-col p-5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
                    <Icon className="size-[18px]" />
                  </span>
                  <span className="flex items-center gap-1 text-[12px] text-ink-3">
                    <Timer className="size-3" /> {r.minutes} min
                  </span>
                </div>
                <h3 className="mt-4 text-[15px] font-semibold text-ink">{r.title}</h3>
                <p className="mt-1 flex-1 text-[13px] leading-relaxed text-ink-3">{r.reason}</p>
                <span className="mt-4 flex items-center gap-1 text-[13px] font-medium text-ink-2 group-hover:text-ink">
                  Start <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Row 4: recent + lifetime */}
      <div className="grid gap-4 lg:grid-cols-12">
        <section className="card p-5 sm:p-6 lg:col-span-7">
          <CardHeader
            title="Recent sessions"
            action={
              <Link href="/analytics?tab=history" className="text-[13px] font-medium text-ink-3 hover:text-ink">
                All history
              </Link>
            }
          />
          {d.recent.length ? (
            <ul className="mt-2 divide-y divide-line">
              {d.recent.map((s) => (
                <SessionRow key={s.id} s={s} />
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<BookOpen />}
              title="No sessions yet"
              description="Your reading history will appear here after your first session."
              action={<LinkButton href={d.next ? `/learn/${d.next.id}` : "/train"}>Start your first session</LinkButton>}
            />
          )}
        </section>
        <section className="card p-5 sm:p-6 lg:col-span-5">
          <CardHeader
            title="Lifetime"
            action={
              <Link href="/analytics" className="text-[13px] font-medium text-ink-3 hover:text-ink">
                Analytics
              </Link>
            }
          />
          <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
            {[
              { label: "Words read", value: formatCompact(o.totals.words), icon: <BookOpen className="size-3.5" /> },
              { label: "Practice time", value: formatHours(o.totals.durationMs), icon: <Clock className="size-3.5" /> },
              {
                label: "Avg comprehension",
                value: o.comprehension != null ? `${Math.round(o.comprehension * 100)}%` : "—",
                icon: <Target className="size-3.5" />,
              },
              { label: "Sessions", value: formatCompact(o.totals.sessions), icon: <Sparkles className="size-3.5" /> },
            ].map((x) => (
              <div key={x.label} className="bg-surface p-4">
                <dt className="flex items-center gap-1.5 text-[12px] text-ink-3">
                  {x.icon}
                  {x.label}
                </dt>
                <dd className="mt-1 text-[22px] leading-none font-semibold tracking-[-0.02em] text-ink">{x.value}</dd>
              </div>
            ))}
          </dl>
          <Link href="/achievements" className="mt-4 block rounded-2xl bg-bg p-4 ring-1 ring-line transition-colors hover:ring-line-strong">
            <div className="flex items-baseline justify-between">
              <span className="text-[14px] font-semibold text-ink">
                Level {d.level.level} · {d.level.title}
              </span>
              <span className="tabular text-[12px] text-ink-3">{d.level.xp.toLocaleString("en-US")} XP</span>
            </div>
            <ProgressBar value={d.level.progress} size="sm" className="mt-2.5" />
            <p className="tabular mt-1.5 text-[12px] text-ink-3">
              {d.level.needed - d.level.intoLevel} XP to level {d.level.level + 1}
            </p>
          </Link>
          <p className="mt-3 text-[12px] text-ink-3">
            {o.totals.activeDays} active day{o.totals.activeDays === 1 ? "" : "s"} · avg{" "}
            {o.totals.activeDays ? formatDuration(o.totals.durationMs / o.totals.activeDays) : "0 min"} per active day
          </p>
        </section>
      </div>
    </div>
  );
}
