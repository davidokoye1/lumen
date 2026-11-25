import type { SessionRecord } from "@/lib/dal/practice";
import type { Preferences } from "@/lib/preferences";
import { DRILL_KINDS, NATURAL_KINDS, READING_KINDS } from "@/lib/exercises";
import { addDays, diffDays, rangeKeys, weekStart, weekdayIndex } from "@/lib/time";
import { mean, median } from "@/lib/utils";

export const DEFAULT_COMFORT_WPM = 230;

/** A self-paced, comprehension-checked read that reflects how you actually read. */
export function isNaturalRead(s: SessionRecord): boolean {
  return NATURAL_KINDS.includes(s.exercise) && !s.flagged && !s.meta.skim && s.comprehension != null && s.wpm != null;
}

export function isReading(s: SessionRecord) {
  return READING_KINDS.includes(s.exercise);
}

export function isDrill(s: SessionRecord) {
  return DRILL_KINDS.includes(s.exercise);
}

export function effectiveRate(s: Pick<SessionRecord, "wpm" | "comprehension">): number | null {
  if (s.wpm == null || s.comprehension == null) return null;
  return Math.round(s.wpm * s.comprehension);
}

export function hasQuiz(s: SessionRecord) {
  return s.comprehension != null;
}

export type StreakInfo = {
  current: number;
  longest: number;
  practicedToday: boolean;
  /** Streak alive but today not yet practiced */
  atRisk: boolean;
};

export function dailyStreak(activeDates: Set<string>, today: string): StreakInfo {
  const practicedToday = activeDates.has(today);
  let current = 0;
  let cursor = practicedToday ? today : addDays(today, -1);
  while (activeDates.has(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }
  const sorted = [...activeDates].sort();
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of sorted) {
    run = prev && diffDays(d, prev) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = d;
  }
  return { current, longest: Math.max(longest, current), practicedToday, atRisk: !practicedToday && current > 0 };
}

export type WeeklyStreakInfo = { current: number; longest: number; daysThisWeek: number; goalDays: number; metThisWeek: boolean };

export function weeklyStreak(activeDates: Set<string>, today: string, goalDays: number): WeeklyStreakInfo {
  const perWeek = new Map<string, number>();
  for (const d of activeDates) {
    const w = weekStart(d);
    perWeek.set(w, (perWeek.get(w) ?? 0) + 1);
  }
  const thisWeek = weekStart(today);
  const daysThisWeek = perWeek.get(thisWeek) ?? 0;
  const met = (w: string) => (perWeek.get(w) ?? 0) >= goalDays;
  const metThisWeek = met(thisWeek);
  let current = 0;
  let cursor = metThisWeek ? thisWeek : addDays(thisWeek, -7);
  while (met(cursor)) {
    current++;
    cursor = addDays(cursor, -7);
  }
  const weeks = [...perWeek.keys()].sort();
  let longest = 0;
  if (weeks.length) {
    let run = 0;
    for (let w = weeks[0]; w <= thisWeek; w = addDays(w, 7)) {
      run = met(w) ? run + 1 : 0;
      longest = Math.max(longest, run);
    }
  }
  return { current, longest: Math.max(longest, current), daysThisWeek, goalDays, metThisWeek };
}

export type DayBucket = { date: string; ms: number; words: number; sessions: number };

export function bucketByDay(sessions: SessionRecord[]): Map<string, DayBucket> {
  const m = new Map<string, DayBucket>();
  for (const s of sessions) {
    const b = m.get(s.localDate) ?? { date: s.localDate, ms: 0, words: 0, sessions: 0 };
    b.ms += s.durationMs;
    b.words += s.words;
    b.sessions += 1;
    m.set(s.localDate, b);
  }
  return m;
}

export type Overview = {
  today: string;
  naturalWpm: number | null;
  effectiveRate: number | null;
  comprehension: number | null;
  trainingWpm: number | null;
  comfortWpm: number;
  baseline: { wpm: number; comprehension: number; effective: number; date: string } | null;
  effectiveDeltaPct: number | null;
  totals: { words: number; durationMs: number; sessions: number; activeDays: number; naturalReads: number };
  todayMs: number;
  dailyGoalMs: number;
  goalProgress: number;
  streak: StreakInfo;
  weekly: WeeklyStreakInfo;
  week: { date: string; label: string; ms: number; active: boolean; isToday: boolean; isFuture: boolean }[];
  /** Effective rate per natural read, oldest first */
  effectiveSeries: { date: string; value: number; wpm: number; comprehension: number; title: string }[];
};

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function computeOverview(
  sessions: SessionRecord[],
  prefs: Preferences,
  today: string,
  userBaseline?: { wpm: number | null; comp: number | null },
): Overview {
  const natural = sessions.filter(isNaturalRead);
  const lastNatural = natural.slice(-5);
  const naturalWpm = median(lastNatural.map((s) => s.wpm!));
  const effective = median(lastNatural.map((s) => effectiveRate(s)!));

  const quizzed = sessions.filter(hasQuiz).slice(-10);
  const comprehension = mean(quizzed.map((s) => s.comprehension!));

  const since30 = addDays(today, -30);
  const training = sessions.filter(
    (s) => (s.exercise === "rsvp" || s.exercise === "pacer") && s.localDate >= since30 && (s.comprehension ?? 0) >= 0.7 && s.wpm,
  );
  const trainingWpm = training.length ? Math.max(...training.map((s) => s.wpm!)) : null;

  let baseline: Overview["baseline"] = null;
  if (natural.length) {
    const first = natural[0];
    baseline = { wpm: first.wpm!, comprehension: first.comprehension!, effective: effectiveRate(first)!, date: first.localDate };
  } else if (userBaseline?.wpm && userBaseline.comp != null) {
    baseline = {
      wpm: userBaseline.wpm,
      comprehension: userBaseline.comp,
      effective: Math.round(userBaseline.wpm * userBaseline.comp),
      date: today,
    };
  }

  const comfortWpm = Math.round(
    Math.min(900, Math.max(120, naturalWpm ?? userBaseline?.wpm ?? DEFAULT_COMFORT_WPM)),
  );

  const effectiveDeltaPct =
    baseline && effective != null && natural.length > 1 && baseline.effective > 0
      ? (effective - baseline.effective) / baseline.effective
      : null;

  const days = bucketByDay(sessions);
  const activeDates = new Set(days.keys());
  const todayMs = days.get(today)?.ms ?? 0;
  const dailyGoalMs = prefs.dailyGoalMinutes * 60_000;

  const monday = weekStart(today);
  const week = DOW.map((label, i) => {
    const date = addDays(monday, i);
    const ms = days.get(date)?.ms ?? 0;
    return { date, label, ms, active: ms > 0, isToday: date === today, isFuture: date > today };
  });

  return {
    today,
    naturalWpm: naturalWpm != null ? Math.round(naturalWpm) : null,
    effectiveRate: effective != null ? Math.round(effective) : null,
    comprehension,
    trainingWpm,
    comfortWpm,
    baseline,
    effectiveDeltaPct,
    totals: {
      words: sessions.reduce((a, s) => a + s.words, 0),
      durationMs: sessions.reduce((a, s) => a + s.durationMs, 0),
      sessions: sessions.length,
      activeDays: activeDates.size,
      naturalReads: natural.length,
    },
    todayMs,
    dailyGoalMs,
    goalProgress: Math.min(1, todayMs / dailyGoalMs),
    streak: dailyStreak(activeDates, today),
    weekly: weeklyStreak(activeDates, today, prefs.weeklyGoalDays),
    week,
    effectiveSeries: natural.map((s) => ({
      date: s.localDate,
      value: effectiveRate(s)!,
      wpm: s.wpm!,
      comprehension: s.comprehension!,
      title: s.title,
    })),
  };
}

export function exerciseTypesTried(sessions: SessionRecord[]): Set<string> {
  const set = new Set<string>();
  for (const s of sessions) set.add(s.exercise === "assessment" || s.exercise === "placement" ? "timed" : s.exercise);
  return set;
}

export { rangeKeys, weekdayIndex };
