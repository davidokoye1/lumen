import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, ClipboardCheck, Clock, FlaskConical, Lock, Play, Repeat, Scale, Sparkles, Target } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth/session";
import { stages } from "@/lib/curriculum/lessons";
import { lessonStates, nextLesson, programProgress, stageProgress } from "@/lib/curriculum/progress";
import { listLessonProgress } from "@/lib/dal/lessons";
import { listSessions } from "@/lib/dal/practice";
import { checkInAvailable } from "@/lib/services/dashboard";
import { todayFor } from "@/lib/services/rewards";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { ProgressBar, ProgressRing } from "@/components/ui/progress";
import { Badge } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Program" };

const principles = [
  { icon: Target, title: "Comprehension gates speed", text: "Progress is speed × understanding. Below 70%, we slow down." },
  { icon: Repeat, title: "Train, then transfer", text: "Every drill ends with real reading, because drills alone transfer only partly." },
  { icon: Scale, title: "Small, honest steps", text: "Paced practice sits 10–25% above comfort, not 3×." },
  { icon: FlaskConical, title: "Grounded in research", text: "Techniques are chosen for evidence, and their limits are stated." },
];

export default async function LearnPage({ searchParams }: { searchParams: Promise<{ locked?: string }> }) {
  const user = await requireOnboardedUser();
  const { locked } = await searchParams;
  const states = lessonStates(user.level, listLessonProgress(user.id));
  const next = nextLesson(states, user.level);
  const prog = programProgress(states);
  const stageList = stageProgress(states);
  const sessions = listSessions(user.id);
  const checkIn = checkInAvailable(sessions, todayFor(user));
  const lastCheckIn = [...sessions].reverse().find((s) => s.exercise === "assessment" || s.exercise === "placement");

  return (
    <div>
      <PageHeader
        eyebrow="Your program"
        title="The Lumen Method"
        description="Twenty-five short sessions in three stages. Each one teaches a technique, trains it, and then checks that it carries over to real reading with real understanding."
        action={
          next ? (
            <LinkButton href={`/learn/${next.id}`} size="lg" icon={<Play className="size-4" fill="currentColor" />}>
              Session {next.number}
            </LinkButton>
          ) : null
        }
      />

      {locked ? (
        <div className="mb-6 rounded-xl border border-line bg-surface-2 px-4 py-3 text-[14px] text-ink-2">
          That session is locked. Finish the one before it first, because each builds on the last.
        </div>
      ) : null}

      <div className="mb-10 grid gap-4 lg:grid-cols-12">
        <section className="card flex items-center gap-5 p-5 sm:p-6 lg:col-span-5">
          <ProgressRing value={prog.fraction} size={96} stroke={9} label={`${prog.done} of ${prog.total} sessions`}>
            <span className="text-[20px] font-semibold tracking-[-0.02em] text-ink">{Math.round(prog.fraction * 100)}%</span>
          </ProgressRing>
          <div className="min-w-0">
            <div className="text-[13px] text-ink-3">Overall progress</div>
            <div className="mt-0.5 text-[18px] font-semibold text-ink">
              {prog.done} of {prog.total} sessions
            </div>
            <div className="mt-3 space-y-1.5">
              {stageList.map((s) => (
                <div key={s.id} className="flex items-center gap-2 text-[12px]">
                  <span className="w-20 text-ink-2">{s.title}</span>
                  <ProgressBar value={s.done / s.total} size="xs" tone={s.complete ? "good" : "accent"} className="w-24" />
                  <span className="tabular text-ink-3">
                    {s.done}/{s.total}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="card flex flex-col justify-between gap-4 p-5 sm:p-6 lg:col-span-7">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent-ink">
              <ClipboardCheck className="size-5" />
            </span>
            <div>
              <h2 className="text-[15px] font-semibold text-ink">Weekly check-in</h2>
              <p className="mt-1 text-[14px] leading-relaxed text-ink-2">
                One standardized passage a week, read at your natural pace. Because the passages are comparable, this
                is the most trustworthy measure of your progress.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[13px] text-ink-3">
              {lastCheckIn
                ? `Last ${lastCheckIn.exercise === "placement" ? "placement" : "check-in"} ${formatRelative(lastCheckIn.createdAt)}: ${lastCheckIn.wpm} WPM at ${Math.round((lastCheckIn.comprehension ?? 0) * 100)}%`
                : "No check-ins yet"}
            </span>
            {checkIn ? (
              <LinkButton href="/check-in" variant="secondary">
                Take this week&apos;s check-in <ArrowRight className="size-4" />
              </LinkButton>
            ) : (
              <Badge tone="good">
                <Check className="size-3.5" /> Done this week
              </Badge>
            )}
          </div>
        </section>
      </div>

      <ul className="mb-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {principles.map((p) => (
          <li key={p.title} className="rounded-2xl border border-line bg-surface/60 p-4">
            <p.icon className="size-4 text-accent-vivid" />
            <h3 className="mt-2.5 text-[14px] font-semibold text-ink">{p.title}</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-3">{p.text}</p>
          </li>
        ))}
      </ul>

      <div className="space-y-14">
        {stages.map((stage) => {
          const sp = stageList.find((s) => s.id === stage.id)!;
          const items = states.filter((l) => l.stage === stage.id);
          const isCurrent = next?.stage === stage.id;
          return (
            <section key={stage.id} aria-labelledby={`stage-${stage.id}`}>
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 text-[13px] font-medium text-ink-3">
                    Stage {stage.index + 1}
                    {sp.complete ? (
                      <Badge tone="good">
                        <Check className="size-3" /> Complete
                      </Badge>
                    ) : isCurrent ? (
                      <Badge tone="accent">In progress</Badge>
                    ) : stage.id === user.level ? (
                      <Badge tone="outline">Your level</Badge>
                    ) : null}
                  </div>
                  <h2 id={`stage-${stage.id}`} className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-ink">
                    {stage.title}
                    <span className="font-normal text-ink-3"> · {stage.tagline}</span>
                  </h2>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{stage.description}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:max-w-xs sm:justify-end">
                  {stage.outcomes.map((o) => (
                    <span key={o} className="rounded-full border border-line bg-surface px-2.5 py-1 text-[12px] text-ink-2">
                      {o}
                    </span>
                  ))}
                </div>
              </div>
              <ol className="relative space-y-2">
                {items.map((l) => {
                  const isNext = next?.id === l.id;
                  const lockedItem = l.state === "locked";
                  const content = (
                    <div
                      className={cn(
                        "flex items-center gap-4 rounded-2xl border px-4 py-3.5 transition-[border-color,background-color,box-shadow]",
                        isNext
                          ? "border-accent-vivid/50 bg-accent-soft shadow-[0_0_0_3px_var(--ring)]"
                          : lockedItem
                            ? "border-line bg-transparent"
                            : "border-line bg-surface hover:border-line-strong hover:shadow-sm",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-xl text-[14px] font-semibold",
                          l.state === "completed"
                            ? "bg-good-soft text-good-ink"
                            : isNext
                              ? "bg-accent text-accent-fg"
                              : lockedItem
                                ? "bg-surface-2 text-ink-3"
                                : "bg-surface-2 text-ink",
                        )}
                      >
                        {l.state === "completed" ? (
                          <Check className="size-[18px]" strokeWidth={2.5} />
                        ) : lockedItem ? (
                          <Lock className="size-4" />
                        ) : l.kind === "checkpoint" ? (
                          <ClipboardCheck className="size-[18px]" />
                        ) : (
                          l.number
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={cn("truncate text-[15px] font-semibold", lockedItem ? "text-ink-3" : "text-ink")}>
                            {l.number}. {l.title}
                          </span>
                          {isNext ? (
                            <span className="hidden shrink-0 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold tracking-wide text-accent-fg uppercase sm:inline">
                              Up next
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-0.5 truncate text-[13px] text-ink-3">{l.subtitle}</div>
                      </div>
                      <div className="hidden shrink-0 items-center gap-3 sm:flex">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[12px] font-medium",
                            l.kind === "checkpoint" ? "bg-ink text-bg" : "bg-surface-2 text-ink-2",
                          )}
                        >
                          {l.focus}
                        </span>
                        <span className="flex w-14 items-center justify-end gap-1 text-[12px] text-ink-3">
                          <Clock className="size-3" />
                          {l.minutes}m
                        </span>
                      </div>
                      {!lockedItem ? <ArrowRight className="size-4 shrink-0 text-ink-3" /> : <span className="w-4" />}
                    </div>
                  );
                  return (
                    <li key={l.id}>
                      {lockedItem ? (
                        <div aria-disabled className="cursor-not-allowed" title="Finish the previous session to unlock">
                          {content}
                        </div>
                      ) : (
                        <Link href={`/learn/${l.id}`} className="block rounded-2xl">
                          {content}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>

      <div className="mt-14 flex items-start gap-3 rounded-2xl border border-line bg-surface/60 p-5 text-[13px] leading-relaxed text-ink-2">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-accent-vivid" />
        <p>
          <span className="font-semibold text-ink">A note on honesty.</span> Lumen won&apos;t promise 1,000 words per
          minute. Research on eye movements and comprehension shows that kind of speed always comes with lost
          understanding. What this program does reliably is reduce wasted effort, like wandering attention, habitual
          re-reading and word-by-word processing. It also teaches you to choose the right gear for each text, which
          is where real, lasting gains come from.
        </p>
      </div>
    </div>
  );
}
