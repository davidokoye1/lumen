import type { Metadata } from "next";
import { Award, Flame, Lock, Medal, Users, Zap } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth/session";
import { achievements } from "@/lib/gamification/achievements";
import { levelFromXp, xpForNext } from "@/lib/gamification/levels";
import { completedChallengeCount, totalXp, unlockedAchievements, weeklyLeaderboard } from "@/lib/dal/gamification";
import { listLessonProgress } from "@/lib/dal/lessons";
import { lessonStates, stageProgress } from "@/lib/curriculum/progress";
import { loadProgressContext } from "@/lib/services/rewards";
import { weekStart } from "@/lib/time";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/card";
import { ProgressBar, ProgressRing } from "@/components/ui/progress";
import { achievementIcons } from "@/components/ui/icons";
import { LeaderboardToggle } from "@/components/achievements/leaderboard-optin";

export const metadata: Metadata = { title: "Achievements" };

export default async function AchievementsPage() {
  const user = await requireOnboardedUser();
  const { sessions, overview, challenges, today } = loadProgressContext(user);
  const xp = totalXp(user.id);
  const level = levelFromXp(xp);
  const unlocked = unlockedAchievements(user.id);
  const progress = listLessonProgress(user.id);
  const stagesCompleted = new Set(
    stageProgress(lessonStates(user.level, progress))
      .filter((s) => s.complete)
      .map((s) => s.id as string),
  );
  const ctx = { sessions, overview, completedLessons: new Set(progress.keys()), challengesCompleted: completedChallengeCount(user.id), stagesCompleted };
  const badges = achievements.map((a) => ({ ...a, p: unlocked.has(a.id) ? 1 : a.progress(ctx), at: unlocked.get(a.id) ?? null }));
  const groups = Array.from(new Set(badges.map((b) => b.group)));
  const closest = badges.filter((b) => !b.at && b.p > 0).sort((a, b) => b.p - a.p).slice(0, 3);
  const optedIn = user.preferences.leaderboardOptIn;
  const board = optedIn ? weeklyLeaderboard(user.id, weekStart(today)) : [];

  return (
    <div>
      <PageHeader
        eyebrow="Motivation"
        title="Achievements"
        description="XP rewards consistent, quality practice. Comprehension bonuses are worth more than raw words."
      />

      <div className="grid gap-4 lg:grid-cols-12">
        <section className="card flex flex-col gap-6 p-6 sm:flex-row sm:items-center lg:col-span-7">
          <ProgressRing value={level.progress} size={132} stroke={11} label={`Level ${level.level}, ${Math.round(level.progress * 100)}% to next`}>
            <span className="text-[12px] text-ink-3">Level</span>
            <span className="text-[38px] leading-none font-semibold tracking-[-0.03em] text-ink">{level.level}</span>
          </ProgressRing>
          <div className="min-w-0 flex-1">
            <div className="text-[22px] font-semibold tracking-[-0.02em] text-ink">{level.title}</div>
            <div className="tabular mt-1 text-[14px] text-ink-2">
              {xp.toLocaleString("en-US")} XP total · {level.needed - level.intoLevel} XP to level {level.level + 1}
            </div>
            <ProgressBar value={level.progress} className="mt-4" />
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12px] text-ink-3">
              <li>Reading: 1 XP per 25 words</li>
              <li>Comprehension 80%+: +15 XP</li>
              <li>Perfect quiz: +25 XP</li>
              <li>Daily goal: +20 XP</li>
              <li>Program session: +40 XP</li>
              <li>Next level: {xpForNext(level.level + 1)} XP after this</li>
            </ul>
          </div>
        </section>
        <section className="card grid grid-cols-2 gap-px overflow-hidden lg:col-span-5">
          {[
            { label: "Day streak", value: overview.streak.current, sub: `Longest ${overview.streak.longest}`, icon: <Flame className="size-4 text-accent-vivid" /> },
            { label: "Week streak", value: overview.weekly.current, sub: `${overview.weekly.goalDays} days/week goal`, icon: <Medal className="size-4 text-accent-vivid" /> },
            { label: "Badges", value: unlocked.size, sub: `of ${achievements.length}`, icon: <Award className="size-4 text-accent-vivid" /> },
            { label: "Challenges", value: ctx.challengesCompleted, sub: "completed", icon: <Zap className="size-4 text-accent-vivid" /> },
          ].map((s) => (
            <div key={s.label} className="bg-surface p-5 ring-1 ring-line">
              <div className="flex items-center gap-1.5 text-[12px] text-ink-3">
                {s.icon}
                {s.label}
              </div>
              <div className="mt-1.5 text-[28px] leading-none font-semibold tracking-[-0.02em] text-ink">{s.value}</div>
              <div className="mt-1 text-[12px] text-ink-3">{s.sub}</div>
            </div>
          ))}
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        <section className="card p-5 sm:p-6 lg:col-span-7">
          <h2 className="text-[15px] font-semibold text-ink">This week&apos;s challenges</h2>
          <p className="text-[13px] text-ink-3">Three new challenges every Monday, scaled to your stage.</p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-3">
            {challenges.map((c) => (
              <li key={c.key} className={cn("rounded-2xl border p-4", c.done ? "border-good/30 bg-good-soft" : "border-line bg-bg")}>
                <div className="flex items-center justify-between text-[12px]">
                  <span className={cn("font-semibold", c.done ? "text-good-ink" : "text-accent-ink")}>{c.done ? "Complete" : `+${c.xp} XP`}</span>
                  <span className="tabular text-ink-3">{Math.round(c.progress * 100)}%</span>
                </div>
                <p className="mt-2 min-h-10 text-[14px] leading-snug font-medium text-ink">{c.title}</p>
                <ProgressBar value={c.progress} size="sm" className="mt-3" tone={c.done ? "good" : "accent"} />
              </li>
            ))}
          </ul>
        </section>
        <section className="card p-5 sm:p-6 lg:col-span-5">
          <h2 className="text-[15px] font-semibold text-ink">Closest milestones</h2>
          <p className="text-[13px] text-ink-3">Badges you&apos;re nearest to unlocking</p>
          {closest.length ? (
            <ul className="mt-4 space-y-4">
              {closest.map((b) => {
                const Icon = achievementIcons[b.icon];
                return (
                  <li key={b.id} className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink-2">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[14px] font-medium text-ink">{b.title}</span>
                        <span className="tabular text-[12px] text-ink-3">{Math.round(b.p * 100)}%</span>
                      </div>
                      <ProgressBar value={b.p} size="xs" className="mt-1.5" />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-4 text-[14px] text-ink-3">Complete a session to start progressing toward badges.</p>
          )}
        </section>
      </div>

      <div className="mt-10 space-y-8">
        {groups.map((g) => (
          <section key={g}>
            <h2 className="mb-3 text-[13px] font-semibold tracking-[0.06em] text-ink-3 uppercase">{g}</h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {badges
                .filter((b) => b.group === g)
                .map((b) => {
                  const Icon = achievementIcons[b.icon];
                  const got = !!b.at;
                  return (
                    <li key={b.id} className={cn("card flex flex-col p-4", !got && "bg-surface/60 shadow-none")}>
                      <div className="flex items-start justify-between">
                        <span
                          className={cn(
                            "flex size-11 items-center justify-center rounded-2xl",
                            got ? "bg-accent text-accent-fg shadow-sm" : "bg-surface-2 text-ink-3",
                          )}
                        >
                          <Icon className="size-5" />
                        </span>
                        {got ? (
                          <span className="text-[11px] text-ink-3">{formatRelative(b.at!)}</span>
                        ) : (
                          <Lock className="size-3.5 text-ink-3" aria-label="Locked" />
                        )}
                      </div>
                      <div className={cn("mt-3 text-[14px] font-semibold", got ? "text-ink" : "text-ink-2")}>{b.title}</div>
                      <div className="mt-0.5 flex-1 text-[12px] leading-snug text-ink-3">{b.description}</div>
                      <div className="mt-3 flex items-center gap-2">
                        {got ? (
                          <span className="text-[12px] font-medium text-accent-ink">+{b.xp} XP earned</span>
                        ) : (
                          <>
                            <ProgressBar value={b.p} size="xs" tone="ink" />
                            <span className="tabular shrink-0 text-[11px] text-ink-3">{Math.round(b.p * 100)}%</span>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
            </ul>
          </section>
        ))}
      </div>

      <section className="card mt-10 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink-2">
              <Users className="size-[18px]" />
            </span>
            <div>
              <h2 className="text-[15px] font-semibold text-ink">Weekly leaderboard</h2>
              <p className="mt-0.5 max-w-xl text-[13px] leading-relaxed text-ink-3">
                Optional and off by default. If you join, other members who have joined see your first name, your last
                initial and your XP this week. Nothing else is shared.
              </p>
            </div>
          </div>
          <LeaderboardToggle optedIn={optedIn} />
        </div>
        {optedIn ? (
          board.length > 1 ? (
            <ol className="mt-5 divide-y divide-line rounded-2xl border border-line">
              {board.map((r, i) => (
                <li key={r.userId} className={cn("flex items-center gap-4 px-4 py-3", r.isYou && "bg-accent-soft")}>
                  <span className={cn("tabular w-6 text-center text-[14px] font-semibold", i < 3 ? "text-accent-ink" : "text-ink-3")}>{i + 1}</span>
                  <span className="flex-1 text-[14px] font-medium text-ink">
                    {r.name}
                    {r.isYou ? <span className="ml-2 text-[12px] font-normal text-ink-3">You</span> : null}
                  </span>
                  <span className="tabular text-[14px] font-semibold text-ink">{r.xp.toLocaleString("en-US")} XP</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-5 rounded-2xl border border-dashed border-line-strong px-4 py-6 text-center text-[14px] text-ink-3">
              You&apos;re the first one here. Others will appear as they join. Your XP this week:{" "}
              <span className="font-semibold text-ink">{board[0]?.xp ?? 0}</span>
            </p>
          )
        ) : null}
      </section>
    </div>
  );
}
