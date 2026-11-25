import type { SessionRecord } from "@/lib/dal/practice";
import { DRILL_KINDS } from "@/lib/exercises";
import { hashString } from "@/lib/utils";

export type ChallengeTemplate = {
  id: string;
  xp: number;
  title: (n: number) => string;
  targets: [number, number, number];
  measure: (week: SessionRecord[], lessonsThisWeek: number) => number;
  unit?: string;
};

const templates: ChallengeTemplate[] = [
  {
    id: "words",
    xp: 100,
    title: (n) => `Read ${n.toLocaleString("en-US")} words`,
    targets: [3000, 5000, 8000],
    measure: (w) => w.reduce((a, s) => a + s.words, 0),
    unit: "words",
  },
  {
    id: "days",
    xp: 100,
    title: (n) => `Practice on ${n} different days`,
    targets: [4, 5, 5],
    measure: (w) => new Set(w.map((s) => s.localDate)).size,
    unit: "days",
  },
  {
    id: "quality",
    xp: 120,
    title: (n) => `Finish ${n} reads with 80%+ comprehension`,
    targets: [3, 4, 5],
    measure: (w) => w.filter((s) => (s.comprehension ?? 0) >= 0.8).length,
    unit: "reads",
  },
  {
    id: "lessons",
    xp: 120,
    title: (n) => `Complete ${n} program sessions`,
    targets: [3, 3, 4],
    measure: (_w, l) => l,
    unit: "sessions",
  },
  {
    id: "drills",
    xp: 80,
    title: (n) => `Complete ${n} recognition drills`,
    targets: [4, 5, 6],
    measure: (w) => w.filter((s) => DRILL_KINDS.includes(s.exercise)).length,
    unit: "drills",
  },
  {
    id: "minutes",
    xp: 100,
    title: (n) => `Practice for ${n} minutes`,
    targets: [45, 60, 90],
    measure: (w) => Math.floor(w.reduce((a, s) => a + s.durationMs, 0) / 60_000),
    unit: "min",
  },
  {
    id: "variety",
    xp: 80,
    title: (n) => `Use ${n} different exercise types`,
    targets: [3, 4, 5],
    measure: (w) => new Set(w.map((s) => (s.exercise === "placement" ? "timed" : s.exercise))).size,
    unit: "types",
  },
  {
    id: "checkin",
    xp: 120,
    title: () => "Complete this week's check-in",
    targets: [1, 1, 1],
    measure: (w) => w.filter((s) => s.exercise === "assessment").length,
  },
];

export type ActiveChallenge = {
  key: string; // `${weekKey}:${templateId}`
  id: string;
  title: string;
  target: number;
  current: number;
  progress: number;
  done: boolean;
  xp: number;
  unit?: string;
};

/** Three challenges per week, stable for a given user and week. */
export function weeklyChallenges(
  userId: string,
  weekKey: string,
  levelIndex: number,
  weekSessions: SessionRecord[],
  lessonsThisWeek: number,
  programFinished: boolean,
): ActiveChallenge[] {
  const pool = templates.filter((t) => !(programFinished && t.id === "lessons"));
  const rand = hashString(`${userId}:${weekKey}`);
  const picked: ChallengeTemplate[] = [];
  let i = 0;
  while (picked.length < 3 && i < 50) {
    const t = pool[(rand + i * 7919) % pool.length];
    if (!picked.includes(t)) picked.push(t);
    i++;
  }
  const li = Math.max(0, Math.min(2, levelIndex));
  return picked.map((t) => {
    const target = t.targets[li];
    const current = t.measure(weekSessions, lessonsThisWeek);
    return {
      key: `${weekKey}:${t.id}`,
      id: t.id,
      title: t.title(target),
      target,
      current: Math.min(current, target),
      progress: Math.min(1, current / target),
      done: current >= target,
      xp: t.xp,
      unit: t.unit,
    };
  });
}
