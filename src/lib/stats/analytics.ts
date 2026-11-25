import type { SessionRecord } from "@/lib/dal/practice";
import type { Preferences } from "@/lib/preferences";
import { DRILL_KINDS, sessionKindLabel, type SessionKind } from "@/lib/exercises";
import { addDays, diffDays, monthStart, rangeKeys, weekStart, weekdayIndex } from "@/lib/time";
import { mean, median } from "@/lib/utils";
import { bucketByDay, dailyStreak, effectiveRate, isNaturalRead, weeklyStreak } from "./core";
import { formatDateKey, formatNumber } from "@/lib/format";

export const RANGES = ["30d", "90d", "12m", "all"] as const;
export type Range = (typeof RANGES)[number];
export const rangeLabels: Record<Range, string> = { "30d": "30 days", "90d": "90 days", "12m": "12 months", all: "All time" };

function rangeStart(range: Range, today: string, first: string | null): string {
  if (range === "30d") return addDays(today, -29);
  if (range === "90d") return addDays(today, -89);
  if (range === "12m") return addDays(today, -364);
  return first && first < today ? first : addDays(today, -29);
}

export type Kpi = { value: number | null; prev: number | null; spark: (number | null)[] };

type Summary = {
  sessions: number;
  minutes: number;
  words: number;
  activeDays: number;
  wpm: number | null;
  effective: number | null;
  comprehension: number | null;
  drillAccuracy: number | null;
};

export function summarize(list: SessionRecord[]): Summary {
  const natural = list.filter(isNaturalRead);
  const quiz = list.filter((s) => s.comprehension != null);
  const drills = list.filter((s) => DRILL_KINDS.includes(s.exercise) && s.accuracy != null);
  const wpm = median(natural.map((s) => s.wpm!));
  const eff = median(natural.map((s) => effectiveRate(s)!));
  return {
    sessions: list.length,
    minutes: Math.round(list.reduce((a, s) => a + s.durationMs, 0) / 60_000),
    words: list.reduce((a, s) => a + s.words, 0),
    activeDays: new Set(list.map((s) => s.localDate)).size,
    wpm: wpm != null ? Math.round(wpm) : null,
    effective: eff != null ? Math.round(eff) : null,
    comprehension: mean(quiz.map((s) => s.comprehension!)),
    drillAccuracy: mean(drills.map((s) => s.accuracy!)),
  };
}

function sparkFor(list: SessionRecord[], from: string, to: string, fn: (l: SessionRecord[]) => number | null) {
  const span = diffDays(to, from) + 1;
  const buckets = 12;
  const size = Math.max(1, Math.ceil(span / buckets));
  const out: (number | null)[] = [];
  for (let start = from; start <= to; start = addDays(start, size)) {
    const end = addDays(start, size - 1);
    out.push(fn(list.filter((s) => s.localDate >= start && s.localDate <= end)));
  }
  return out;
}

export type ScatterPoint = { wpm: number; comprehension: number; kind: "natural" | "pacer" | "rsvp"; title: string; date: string };

export function computeAnalytics(sessions: SessionRecord[], range: Range, prefs: Preferences, today: string) {
  const first = sessions[0]?.localDate ?? null;
  const from = rangeStart(range, today, first);
  const span = diffDays(today, from) + 1;
  const prevTo = addDays(from, -1);
  const prevFrom = addDays(prevTo, -(span - 1));
  const cur = sessions.filter((s) => s.localDate >= from && s.localDate <= today);
  const prev = sessions.filter((s) => s.localDate >= prevFrom && s.localDate <= prevTo);
  const sc = summarize(cur);
  const sp = summarize(prev);
  const hasPrev = range !== "all" && prev.length > 0;

  const kpis = {
    effective: {
      value: sc.effective,
      prev: hasPrev ? sp.effective : null,
      spark: sparkFor(cur, from, today, (l) => median(l.filter(isNaturalRead).map((s) => effectiveRate(s)!))),
    },
    wpm: {
      value: sc.wpm,
      prev: hasPrev ? sp.wpm : null,
      spark: sparkFor(cur, from, today, (l) => median(l.filter(isNaturalRead).map((s) => s.wpm!))),
    },
    comprehension: {
      value: sc.comprehension,
      prev: hasPrev ? sp.comprehension : null,
      spark: sparkFor(cur, from, today, (l) => mean(l.filter((s) => s.comprehension != null).map((s) => s.comprehension!))),
    },
    minutes: {
      value: sc.minutes,
      prev: hasPrev ? sp.minutes : null,
      spark: sparkFor(cur, from, today, (l) => l.reduce((a, s) => a + s.durationMs, 0) / 60_000),
    },
    words: {
      value: sc.words,
      prev: hasPrev ? sp.words : null,
      spark: sparkFor(cur, from, today, (l) => l.reduce((a, s) => a + s.words, 0)),
    },
    activeDays: {
      value: sc.activeDays,
      prev: hasPrev ? sp.activeDays : null,
      spark: sparkFor(cur, from, today, (l) => new Set(l.map((s) => s.localDate)).size),
    },
  } satisfies Record<string, Kpi>;

  // Reading-rate series: daily medians of natural reads.
  const byDay = new Map<string, SessionRecord[]>();
  for (const s of cur) {
    const arr = byDay.get(s.localDate) ?? [];
    arr.push(s);
    byDay.set(s.localDate, arr);
  }
  const rateSeries: { date: string; wpm: number; effective: number; comprehension: number; n: number }[] = [];
  const comprehensionSeries: { date: string; value: number; n: number }[] = [];
  const trainingSeries: { date: string; wpm: number }[] = [];
  for (const date of [...byDay.keys()].sort()) {
    const list = byDay.get(date)!;
    const nat = list.filter(isNaturalRead);
    if (nat.length)
      rateSeries.push({
        date,
        wpm: Math.round(median(nat.map((s) => s.wpm!))!),
        effective: Math.round(median(nat.map((s) => effectiveRate(s)!))!),
        comprehension: mean(nat.map((s) => s.comprehension!))!,
        n: nat.length,
      });
    const q = list.filter((s) => s.comprehension != null);
    if (q.length) comprehensionSeries.push({ date, value: mean(q.map((s) => s.comprehension!))!, n: q.length });
    const t = list.filter((s) => (s.exercise === "rsvp" || s.exercise === "pacer") && s.wpm);
    if (t.length) trainingSeries.push({ date, wpm: Math.max(...t.map((s) => s.wpm!)) });
  }

  // Speed vs understanding.
  const scatter: ScatterPoint[] = cur
    .filter((s) => s.comprehension != null && s.wpm && !s.flagged && !s.meta.skim)
    .map((s) => ({
      wpm: s.wpm!,
      comprehension: s.comprehension!,
      kind: s.exercise === "pacer" ? "pacer" : s.exercise === "rsvp" ? "rsvp" : "natural",
      title: s.title,
      date: s.localDate,
    }));
  const sweetSpot = comprehensionCeiling(scatter);

  // Consistency heatmap (whole weeks covering the range).
  const days = bucketByDay(cur);
  const gridStart = weekStart(from);
  const weeks: { start: string; days: { date: string; ms: number; inRange: boolean }[] }[] = [];
  for (let w = gridStart; w <= today; w = addDays(w, 7)) {
    weeks.push({
      start: w,
      days: Array.from({ length: 7 }, (_, i) => {
        const date = addDays(w, i);
        return { date, ms: days.get(date)?.ms ?? 0, inRange: date >= from && date <= today };
      }),
    });
  }
  const activeAll = new Set(bucketByDay(sessions).keys());
  const streak = dailyStreak(activeAll, today);
  const weekly = weeklyStreak(activeAll, today, prefs.weeklyGoalDays);
  const weeksInRange = weeks.length;
  const weeksMet = weeks.filter((w) => w.days.filter((d) => d.ms > 0).length >= prefs.weeklyGoalDays).length;

  // Weekly volume.
  const weeklyVolume = weeks.map((w) => {
    const list = cur.filter((s) => weekStart(s.localDate) === w.start);
    return {
      week: w.start,
      minutes: Math.round(list.reduce((a, s) => a + s.durationMs, 0) / 60_000),
      words: list.reduce((a, s) => a + s.words, 0),
      sessions: list.length,
    };
  });

  // Breakdown by exercise.
  const kinds = new Map<SessionKind, { ms: number; sessions: number }>();
  for (const s of cur) {
    const k = kinds.get(s.exercise) ?? { ms: 0, sessions: 0 };
    k.ms += s.durationMs;
    k.sessions += 1;
    kinds.set(s.exercise, k);
  }
  const byExercise = [...kinds.entries()]
    .map(([kind, v]) => ({ kind, label: sessionKindLabel[kind], ...v }))
    .sort((a, b) => b.ms - a.ms);

  const drillAccuracy = DRILL_KINDS.map((kind) => {
    const list = cur.filter((s) => s.exercise === kind && s.accuracy != null);
    const half = Math.floor(list.length / 2);
    return {
      kind,
      label: sessionKindLabel[kind],
      accuracy: mean(list.map((s) => s.accuracy!)),
      sessions: list.length,
      early: half ? mean(list.slice(0, half).map((s) => s.accuracy!)) : null,
      late: half ? mean(list.slice(half).map((s) => s.accuracy!)) : null,
    };
  });

  const comprehensionByMode = (["timed", "assessment", "pacer", "rsvp"] as SessionKind[]).map((kind) => {
    const list = cur.filter((s) => s.exercise === kind && s.comprehension != null);
    return { kind, label: sessionKindLabel[kind], mean: mean(list.map((s) => s.comprehension!)), n: list.length };
  });

  // Weekday pattern.
  const weekdayMs = Array.from({ length: 7 }, () => 0);
  for (const s of cur) weekdayMs[weekdayIndex(s.localDate)] += s.durationMs;

  const insights = buildInsights({ sc, sp, hasPrev, sweetSpot, weekdayMs, drillAccuracy, rangeLabel: rangeLabels[range] });

  return {
    range,
    from,
    to: today,
    span,
    empty: cur.length === 0,
    kpis,
    rateSeries,
    trainingSeries,
    comprehensionSeries,
    scatter,
    sweetSpot,
    heatmap: { weeks, max: Math.max(0, ...weeks.flatMap((w) => w.days.map((d) => d.ms))) },
    consistency: {
      activeDays: sc.activeDays,
      totalDays: span,
      currentStreak: streak.current,
      longestStreak: streak.longest,
      weeklyStreak: weekly.current,
      weeksMet,
      weeksInRange,
    },
    weeklyVolume,
    weeklyGoalMinutes: prefs.dailyGoalMinutes * prefs.weeklyGoalDays,
    byExercise,
    drillAccuracy,
    comprehensionByMode,
    weekdayMs,
    insights,
  };
}

export type Analytics = ReturnType<typeof computeAnalytics>;

/** Highest WPM band where mean comprehension stays ≥ 75% (needs ≥ 2 reads per band). */
export function comprehensionCeiling(points: ScatterPoint[]) {
  if (points.length < 4) return null;
  const bands = [150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 1000];
  let best: { upTo: number; comprehension: number } | null = null;
  for (let i = 0; i < bands.length - 1; i++) {
    const inBand = points.filter((p) => p.wpm >= bands[i] && p.wpm < bands[i + 1]);
    if (inBand.length < 2) continue;
    const m = mean(inBand.map((p) => p.comprehension))!;
    if (m >= 0.75) best = { upTo: bands[i + 1], comprehension: m };
  }
  return best;
}

const DOW_LONG = ["Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays"];

function pct(a: number, b: number) {
  return Math.round(((a - b) / b) * 100);
}

function buildInsights(x: {
  sc: Summary;
  sp: Summary;
  hasPrev: boolean;
  sweetSpot: ReturnType<typeof comprehensionCeiling>;
  weekdayMs: number[];
  drillAccuracy: { label: string; early: number | null; late: number | null; sessions: number }[];
  rangeLabel: string;
}) {
  const out: { tone: "good" | "neutral" | "attention"; text: string }[] = [];
  const { sc, sp } = x;
  if (x.hasPrev && sc.effective && sp.effective) {
    const d = pct(sc.effective, sp.effective);
    if (d >= 3) out.push({ tone: "good", text: `Your effective reading rate is up ${d}% on the previous period.` });
    else if (d <= -3)
      out.push({
        tone: "attention",
        text: `Your effective rate is down ${Math.abs(d)}% on the previous period. Check whether speed is outrunning comprehension.`,
      });
    else out.push({ tone: "neutral", text: "Your effective rate is holding steady. Consistency is what turns into gains." });
  }
  if (sc.comprehension != null && sc.comprehension < 0.7)
    out.push({
      tone: "attention",
      text: `Average comprehension is ${Math.round(sc.comprehension * 100)}%. Slow your training speed by about 10% until it's back above 70%.`,
    });
  if (x.sweetSpot)
    out.push({
      tone: "good",
      text: `Your comprehension stays at ${Math.round(x.sweetSpot.comprehension * 100)}%+ up to about ${x.sweetSpot.upTo} WPM. That's your current training ceiling.`,
    });
  const totalMs = x.weekdayMs.reduce((a, b) => a + b, 0);
  if (totalMs > 0) {
    const max = Math.max(...x.weekdayMs);
    const i = x.weekdayMs.indexOf(max);
    if (max / totalMs > 0.22) out.push({ tone: "neutral", text: `You practice most on ${DOW_LONG[i]}.` });
  }
  for (const d of x.drillAccuracy) {
    if (d.sessions >= 4 && d.early != null && d.late != null && d.late - d.early >= 0.05)
      out.push({ tone: "good", text: `${d.label} accuracy improved from ${Math.round(d.early * 100)}% to ${Math.round(d.late * 100)}%.` });
  }
  return out.slice(0, 4);
}

// ───────────────────────────── Reports ─────────────────────────────

export type Period = "week" | "month";

function periodBounds(period: Period, offset: number, today: string) {
  if (period === "week") {
    const from = addDays(weekStart(today), offset * 7);
    return { from, to: addDays(from, 6) };
  }
  const [y, m] = monthStart(today).split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + offset, 1));
  const from = d.toISOString().slice(0, 10);
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).toISOString().slice(0, 10);
  return { from, to: end };
}

export function computeReport(
  sessions: SessionRecord[],
  period: Period,
  offset: number,
  today: string,
  extras: { achievements: { title: string; date: string }[]; lessons: { title: string; date: string }[] },
) {
  const { from, to } = periodBounds(period, offset, today);
  const prevB = periodBounds(period, offset - 1, today);
  const cur = sessions.filter((s) => s.localDate >= from && s.localDate <= to);
  const prev = sessions.filter((s) => s.localDate >= prevB.from && s.localDate <= prevB.to);
  const current = summarize(cur);
  const previous = summarize(prev);
  const days = bucketByDay(cur);
  const daily = rangeKeys(from, to).map((date) => ({
    date,
    label: period === "week" ? formatDateKey(date, { weekday: "short" }) : formatDateKey(date, { day: "numeric" }),
    minutes: Math.round((days.get(date)?.ms ?? 0) / 60_000),
    words: days.get(date)?.words ?? 0,
    future: date > today,
  }));
  const natural = cur.filter(isNaturalRead);
  const bestRead = natural.length
    ? natural.reduce((a, b) => ((effectiveRate(b) ?? 0) > (effectiveRate(a) ?? 0) ? b : a))
    : null;
  const label =
    period === "week"
      ? `${formatDateKey(from, { month: "short", day: "numeric" })} – ${formatDateKey(to, { month: "short", day: "numeric", year: "numeric" })}`
      : formatDateKey(from, { month: "long", year: "numeric" });

  const inPeriod = (d: string) => d >= from && d <= to;
  const summaryParts: string[] = [];
  if (!cur.length) summaryParts.push(`No practice logged ${period === "week" ? "this week" : "this month"}.`);
  else {
    summaryParts.push(
      `${current.activeDays} active day${current.activeDays === 1 ? "" : "s"}, ${current.minutes} minutes, ${formatNumber(current.words)} words read.`,
    );
    if (current.effective && previous.effective) {
      const d = pct(current.effective, previous.effective);
      summaryParts.push(
        d === 0 ? "Effective rate unchanged." : `Effective rate ${d > 0 ? "up" : "down"} ${Math.abs(d)}% vs the previous ${period}.`,
      );
    }
  }

  return {
    period,
    offset,
    label,
    from,
    to,
    isCurrent: offset === 0,
    canGoForward: offset < 0,
    canGoBack: sessions.length > 0 && sessions[0].localDate < from,
    current,
    previous,
    daily,
    sessions: [...cur].reverse(),
    bestRead: bestRead
      ? { title: bestRead.title, effective: effectiveRate(bestRead)!, wpm: bestRead.wpm!, comprehension: bestRead.comprehension!, date: bestRead.localDate }
      : null,
    achievements: extras.achievements.filter((a) => inPeriod(a.date)),
    lessons: extras.lessons.filter((l) => inPeriod(l.date)),
    summary: summaryParts.join(" "),
  };
}

export type Report = ReturnType<typeof computeReport>;

// ───────────────────────────── Records ─────────────────────────────

export type PersonalRecord = { id: string; label: string; value: string; detail: string; date: string | null };

export function computeRecords(sessions: SessionRecord[], today: string): PersonalRecord[] {
  const out: PersonalRecord[] = [];
  const natural = sessions.filter(isNaturalRead);
  const solid = natural.filter((s) => s.comprehension! >= 0.7);
  const maxBy = <T,>(list: T[], f: (x: T) => number) => (list.length ? list.reduce((a, b) => (f(b) > f(a) ? b : a)) : null);
  const minBy = <T,>(list: T[], f: (x: T) => number) => (list.length ? list.reduce((a, b) => (f(b) < f(a) ? b : a)) : null);

  const bestEff = maxBy(natural, (s) => effectiveRate(s)!);
  out.push({
    id: "effective",
    label: "Best effective rate",
    value: bestEff ? `${effectiveRate(bestEff)}` : "—",
    detail: bestEff ? `${bestEff.wpm} WPM × ${Math.round(bestEff.comprehension! * 100)}% · ${bestEff.title}` : "Complete a timed read",
    date: bestEff?.localDate ?? null,
  });
  const fastest = maxBy(solid, (s) => s.wpm!);
  out.push({
    id: "natural-wpm",
    label: "Fastest natural read",
    value: fastest ? `${fastest.wpm} WPM` : "—",
    detail: fastest ? `${Math.round(fastest.comprehension! * 100)}% comprehension · ${fastest.title}` : "With 70%+ comprehension",
    date: fastest?.localDate ?? null,
  });
  const train = maxBy(
    sessions.filter((s) => (s.exercise === "rsvp" || s.exercise === "pacer") && (s.comprehension ?? 0) >= 0.7),
    (s) => s.wpm ?? 0,
  );
  out.push({
    id: "training",
    label: "Top training speed",
    value: train ? `${train.wpm} WPM` : "—",
    detail: train ? `${sessionKindLabel[train.exercise]} with ${Math.round(train.comprehension! * 100)}% comprehension` : "RSVP or pacer with 70%+",
    date: train?.localDate ?? null,
  });
  const activeDates = new Set(sessions.map((s) => s.localDate));
  const streak = dailyStreak(activeDates, today);
  out.push({
    id: "streak",
    label: "Longest streak",
    value: `${streak.longest} day${streak.longest === 1 ? "" : "s"}`,
    detail: streak.current ? `Current streak: ${streak.current}` : "Start a new streak today",
    date: null,
  });
  const days = [...bucketByDay(sessions).values()];
  const bigDay = maxBy(days, (d) => d.words);
  out.push({
    id: "big-day",
    label: "Most words in a day",
    value: bigDay ? formatNumber(bigDay.words) : "—",
    detail: bigDay ? `${Math.round(bigDay.ms / 60_000)} minutes of practice` : "—",
    date: bigDay?.date ?? null,
  });
  const span = maxBy(sessions.filter((s) => s.exercise === "span"), (s) => s.score ?? 0);
  out.push({
    id: "span",
    label: "Widest word flash",
    value: span ? `${span.score} chars` : "—",
    detail: span ? `From center, ${Math.round((span.accuracy ?? 0) * 100)}% accuracy` : "Try Word flash",
    date: span?.localDate ?? null,
  });
  const grids = sessions.filter((s) => s.exercise === "grid" && s.meta.best5 != null);
  const grid = minBy(grids, (s) => Number(s.meta.best5));
  out.push({
    id: "grid",
    label: "Fastest 5×5 grid",
    value: grid ? `${Number(grid.meta.best5).toFixed(1)}s` : "—",
    detail: grid ? "Eyes on the center" : "Try a 5×5 focus grid",
    date: grid?.localDate ?? null,
  });
  const chunk = maxBy(sessions.filter((s) => s.exercise === "chunks"), (s) => s.score ?? 0);
  out.push({
    id: "chunks",
    label: "Largest phrase",
    value: chunk ? `${chunk.score} words` : "—",
    detail: chunk ? `${Math.round((chunk.accuracy ?? 0) * 100)}% accuracy` : "Try Phrase flash",
    date: chunk?.localDate ?? null,
  });
  return out;
}
