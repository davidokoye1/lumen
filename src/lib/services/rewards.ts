import "server-only";
import { tx } from "@/lib/db";
import type { User } from "@/lib/dal/users";
import { insertSession, listSessions, type NewSession, type SessionRecord } from "@/lib/dal/practice";
import {
  awardXp,
  completedChallengeCount,
  completedChallengeKeys,
  hasXpRef,
  totalXp,
  unlockAchievement,
  unlockedAchievements,
} from "@/lib/dal/gamification";
import { createNotification } from "@/lib/dal/notifications";
import { listLessonProgress, lessonsCompletedSince } from "@/lib/dal/lessons";
import { computeOverview, type Overview } from "@/lib/stats/core";
import { achievements, type AchievementDef } from "@/lib/gamification/achievements";
import { weeklyChallenges, type ActiveChallenge } from "@/lib/gamification/challenges";
import { levelFromXp } from "@/lib/gamification/levels";
import { lessonStates, stageIndexOf, stageProgress } from "@/lib/curriculum/progress";
import { dateKeyInZone, weekStart } from "@/lib/time";
import type { Preferences } from "@/lib/preferences";

export type Rewards = {
  xpGained: number;
  breakdown: { label: string; amount: number }[];
  level: { before: number; after: number; title: string; progress: number; intoLevel: number; needed: number };
  achievements: { id: string; title: string; description: string; icon: AchievementDef["icon"]; xp: number }[];
  challenges: { title: string; xp: number }[];
  dailyGoalJustMet: boolean;
  streak: number;
};

export function todayFor(user: Pick<User, "preferences">) {
  return dateKeyInZone(new Date(), user.preferences.timezone);
}

export type ProgressContext = {
  sessions: SessionRecord[];
  overview: Overview;
  challenges: ActiveChallenge[];
  today: string;
};

export function loadProgressContext(user: User): ProgressContext {
  const sessions = listSessions(user.id);
  const today = todayFor(user);
  const overview = computeOverview(sessions, user.preferences, today, { wpm: user.baselineWpm, comp: user.baselineComp });
  const states = lessonStates(user.level, listLessonProgress(user.id));
  const programFinished = states.every((l) => l.state === "completed");
  const weekKey = weekStart(today);
  const weekSessions = sessions.filter((s) => s.localDate >= weekKey);
  const challenges = weeklyChallenges(
    user.id,
    weekKey,
    stageIndexOf(user.level),
    weekSessions,
    lessonsCompletedSince(user.id, weekKey),
    programFinished,
  );
  return { sessions, overview, challenges, today };
}

function notifyAllowed(prefs: Preferences, kind: "achievement" | "level" | "challenge" | "program") {
  if (kind === "program") return prefs.notifyProgram;
  return prefs.notifyAchievements;
}

/**
 * Settle everything that follows from new activity: daily goal, weekly
 * challenges, achievements and level-ups. Idempotent — safe to call repeatedly.
 */
function settle(user: User, xpBefore: number, breakdown: Rewards["breakdown"]): Rewards {
  const ctx = loadProgressContext(user);
  const { overview, today } = ctx;
  let dailyGoalJustMet = false;

  if (overview.todayMs >= overview.dailyGoalMs && !hasXpRef(user.id, "daily_goal", today)) {
    if (awardXp(user.id, 20, "daily_goal", today, today)) {
      breakdown.push({ label: "Daily goal reached", amount: 20 });
      dailyGoalJustMet = true;
    }
  }

  const weekKey = weekStart(today);
  const claimed = completedChallengeKeys(user.id, weekKey);
  const newChallenges: Rewards["challenges"] = [];
  for (const c of ctx.challenges) {
    if (c.done && !claimed.has(c.key) && awardXp(user.id, c.xp, "challenge", c.key, today)) {
      breakdown.push({ label: `Challenge: ${c.title}`, amount: c.xp });
      newChallenges.push({ title: c.title, xp: c.xp });
      if (notifyAllowed(user.preferences, "challenge"))
        createNotification(user.id, {
          kind: "challenge",
          title: "Weekly challenge complete",
          body: `${c.title} (+${c.xp} XP)`,
          href: "/achievements",
          dedupeKey: `challenge:${c.key}`,
        });
    }
  }

  const progress = listLessonProgress(user.id);
  const stagesCompleted = new Set(
    stageProgress(lessonStates(user.level, progress))
      .filter((s) => s.complete)
      .map((s) => s.id as string),
  );
  const unlocked = unlockedAchievements(user.id);
  const achCtx = {
    sessions: ctx.sessions,
    overview,
    completedLessons: new Set(progress.keys()),
    challengesCompleted: completedChallengeCount(user.id),
    stagesCompleted,
  };
  const newAchievements: Rewards["achievements"] = [];
  for (const a of achievements) {
    if (unlocked.has(a.id)) continue;
    if (a.progress(achCtx) >= 1 && unlockAchievement(user.id, a.id)) {
      awardXp(user.id, a.xp, "achievement", a.id, today);
      breakdown.push({ label: `Badge: ${a.title}`, amount: a.xp });
      newAchievements.push({ id: a.id, title: a.title, description: a.description, icon: a.icon, xp: a.xp });
      if (notifyAllowed(user.preferences, "achievement"))
        createNotification(user.id, {
          kind: "achievement",
          title: `Badge unlocked: ${a.title}`,
          body: a.description,
          href: "/achievements",
          dedupeKey: `achievement:${a.id}`,
        });
    }
  }

  const xpAfter = totalXp(user.id);
  const before = levelFromXp(xpBefore);
  const after = levelFromXp(xpAfter);
  if (after.level > before.level && notifyAllowed(user.preferences, "level")) {
    createNotification(user.id, {
      kind: "level",
      title: `Level ${after.level} reached`,
      body: `You're now a ${after.title}. Keep going.`,
      href: "/achievements",
      dedupeKey: `level:${after.level}`,
    });
  }

  return {
    xpGained: xpAfter - xpBefore,
    breakdown,
    level: {
      before: before.level,
      after: after.level,
      title: after.title,
      progress: after.progress,
      intoLevel: after.intoLevel,
      needed: after.needed,
    },
    achievements: newAchievements,
    challenges: newChallenges,
    dailyGoalJustMet,
    streak: overview.streak.current,
  };
}

export function sessionXp(s: Pick<NewSession, "words" | "comprehension" | "accuracy" | "flagged" | "exercise" | "meta">) {
  const isDrill = ["span", "grid", "chunks", "scan"].includes(s.exercise);
  if (isDrill) {
    const acc = s.accuracy ?? 0;
    return Math.round(8 + acc * 12 + (Number(s.meta.trials ?? 0) >= 10 ? 5 : 0));
  }
  let xp = Math.min(60, Math.round(s.words / 25));
  if (s.flagged) return Math.round(xp / 2);
  if (s.comprehension != null) {
    xp += 5;
    if (s.comprehension >= 1) xp += 25;
    else if (s.comprehension >= 0.8) xp += 15;
  }
  return Math.max(2, xp);
}

export function recordPractice(user: User, session: Omit<NewSession, "xp" | "localDate">): { session: SessionRecord; rewards: Rewards } {
  return tx(() => {
    const xpBefore = totalXp(user.id);
    const today = todayFor(user);
    const xp = sessionXp(session);
    const saved = insertSession(user.id, { ...session, xp, localDate: today });
    awardXp(user.id, xp, "session", saved.id, today);
    const rewards = settle(user, xpBefore, [{ label: "Session", amount: xp }]);
    return { session: saved, rewards };
  });
}

/** Award lesson XP once per lesson, then settle (stage badges etc.). */
export function settleLesson(user: User, lessonId: string, isCheckpoint: boolean, firstTime: boolean): Rewards {
  return tx(() => {
    const xpBefore = totalXp(user.id);
    const today = todayFor(user);
    const breakdown: Rewards["breakdown"] = [];
    if (firstTime) {
      const amount = isCheckpoint ? 80 : 40;
      if (awardXp(user.id, amount, "lesson", lessonId, today))
        breakdown.push({ label: isCheckpoint ? "Checkpoint complete" : "Session complete", amount });
    }
    return settle(user, xpBefore, breakdown);
  });
}

export function emptyRewards(xp: number): Rewards {
  const l = levelFromXp(xp);
  return {
    xpGained: 0,
    breakdown: [],
    level: { before: l.level, after: l.level, title: l.title, progress: l.progress, intoLevel: l.intoLevel, needed: l.needed },
    achievements: [],
    challenges: [],
    dailyGoalJustMet: false,
    streak: 0,
  };
}
