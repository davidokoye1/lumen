import type { SessionRecord } from "@/lib/dal/practice";
import type { Overview } from "@/lib/stats/core";
import { effectiveRate, exerciseTypesTried, isNaturalRead } from "@/lib/stats/core";

export type AchievementContext = {
  sessions: SessionRecord[];
  overview: Overview;
  completedLessons: Set<string>;
  challengesCompleted: number;
  stagesCompleted: Set<string>;
};

export type AchievementDef = {
  id: string;
  title: string;
  description: string;
  icon: "spark" | "flame" | "book" | "clock" | "target" | "trend" | "trophy" | "compass" | "eye" | "grid" | "library" | "pen" | "medal" | "gauge";
  group: "Getting started" | "Consistency" | "Volume" | "Understanding" | "Progress" | "Program" | "Skills";
  xp: number;
  /** Returns progress 0..1 (1 = unlocked). */
  progress: (c: AchievementContext) => number;
};

const ratio = (n: number, target: number) => Math.min(1, n / target);

const naturalBest = (c: AchievementContext) =>
  Math.max(0, ...c.sessions.filter(isNaturalRead).map((s) => effectiveRate(s) ?? 0));

export const achievements: AchievementDef[] = [
  {
    id: "first-session",
    title: "First page",
    description: "Complete your first practice session.",
    icon: "spark",
    group: "Getting started",
    xp: 20,
    progress: (c) => ratio(c.sessions.length, 1),
  },
  {
    id: "baseline",
    title: "Starting line",
    description: "Record your first comprehension-checked natural read.",
    icon: "target",
    group: "Getting started",
    xp: 20,
    progress: (c) => ratio(c.overview.totals.naturalReads, 1),
  },
  {
    id: "explorer",
    title: "Explorer",
    description: "Try all seven exercise types.",
    icon: "compass",
    group: "Getting started",
    xp: 50,
    progress: (c) => ratio(exerciseTypesTried(c.sessions).size, 7),
  },
  {
    id: "own-words",
    title: "Your own words",
    description: "Practice with a text you added yourself.",
    icon: "pen",
    group: "Getting started",
    xp: 20,
    progress: (c) => ratio(c.sessions.filter((s) => s.sourceType === "custom").length, 1),
  },
  {
    id: "streak-3",
    title: "Three in a row",
    description: "Practice three days in a row.",
    icon: "flame",
    group: "Consistency",
    xp: 30,
    progress: (c) => ratio(c.overview.streak.longest, 3),
  },
  {
    id: "streak-7",
    title: "A full week",
    description: "Keep a seven-day streak.",
    icon: "flame",
    group: "Consistency",
    xp: 60,
    progress: (c) => ratio(c.overview.streak.longest, 7),
  },
  {
    id: "streak-30",
    title: "Unbroken month",
    description: "Keep a thirty-day streak.",
    icon: "flame",
    group: "Consistency",
    xp: 200,
    progress: (c) => ratio(c.overview.streak.longest, 30),
  },
  {
    id: "weekly-4",
    title: "Four good weeks",
    description: "Hit your weekly practice goal four weeks running.",
    icon: "medal",
    group: "Consistency",
    xp: 100,
    progress: (c) => ratio(c.overview.weekly.longest, 4),
  },
  {
    id: "words-10k",
    title: "Ten thousand words",
    description: "Read 10,000 words in total.",
    icon: "book",
    group: "Volume",
    xp: 40,
    progress: (c) => ratio(c.overview.totals.words, 10_000),
  },
  {
    id: "words-50k",
    title: "Fifty thousand words",
    description: "Read 50,000 words in total, about a short novel.",
    icon: "book",
    group: "Volume",
    xp: 100,
    progress: (c) => ratio(c.overview.totals.words, 50_000),
  },
  {
    id: "words-250k",
    title: "A quarter million",
    description: "Read 250,000 words in total.",
    icon: "book",
    group: "Volume",
    xp: 250,
    progress: (c) => ratio(c.overview.totals.words, 250_000),
  },
  {
    id: "time-1h",
    title: "First hour",
    description: "Practice for a total of one hour.",
    icon: "clock",
    group: "Volume",
    xp: 30,
    progress: (c) => ratio(c.overview.totals.durationMs, 3_600_000),
  },
  {
    id: "time-10h",
    title: "Ten hours in",
    description: "Practice for a total of ten hours.",
    icon: "clock",
    group: "Volume",
    xp: 120,
    progress: (c) => ratio(c.overview.totals.durationMs, 36_000_000),
  },
  {
    id: "librarian",
    title: "Well read",
    description: "Read ten different library passages.",
    icon: "library",
    group: "Volume",
    xp: 80,
    progress: (c) =>
      ratio(
        new Set(c.sessions.filter((s) => s.sourceType === "passage" && !s.sourceId?.startsWith("check-in")).map((s) => s.sourceId))
          .size,
        10,
      ),
  },
  {
    id: "perfect-quiz",
    title: "Full marks",
    description: "Score 100% comprehension on a quiz.",
    icon: "target",
    group: "Understanding",
    xp: 30,
    progress: (c) => (c.sessions.some((s) => s.comprehension === 1) ? 1 : 0),
  },
  {
    id: "quality-10",
    title: "Steady understanding",
    description: "Complete ten reads with 80%+ comprehension.",
    icon: "target",
    group: "Understanding",
    xp: 80,
    progress: (c) => ratio(c.sessions.filter((s) => (s.comprehension ?? 0) >= 0.8).length, 10),
  },
  {
    id: "err-250",
    title: "Effective 250",
    description: "Reach an effective reading rate of 250 on a natural read.",
    icon: "gauge",
    group: "Progress",
    xp: 60,
    progress: (c) => ratio(naturalBest(c), 250),
  },
  {
    id: "err-400",
    title: "Effective 400",
    description: "Reach an effective reading rate of 400 on a natural read.",
    icon: "gauge",
    group: "Progress",
    xp: 150,
    progress: (c) => ratio(naturalBest(c), 400),
  },
  {
    id: "improve-10",
    title: "Measurable progress",
    description: "Lift your effective rate 10% above your baseline.",
    icon: "trend",
    group: "Progress",
    xp: 80,
    progress: (c) => (c.overview.effectiveDeltaPct == null ? 0 : ratio(Math.max(0, c.overview.effectiveDeltaPct), 0.1)),
  },
  {
    id: "improve-25",
    title: "Transformed",
    description: "Lift your effective rate 25% above your baseline.",
    icon: "trend",
    group: "Progress",
    xp: 200,
    progress: (c) => (c.overview.effectiveDeltaPct == null ? 0 : ratio(Math.max(0, c.overview.effectiveDeltaPct), 0.25)),
  },
  {
    id: "stage-foundations",
    title: "Foundations complete",
    description: "Finish every session in the Foundations stage.",
    icon: "trophy",
    group: "Program",
    xp: 100,
    progress: (c) => (c.stagesCompleted.has("foundations") ? 1 : 0),
  },
  {
    id: "stage-fluency",
    title: "Fluency complete",
    description: "Finish every session in the Fluency stage.",
    icon: "trophy",
    group: "Program",
    xp: 150,
    progress: (c) => (c.stagesCompleted.has("fluency") ? 1 : 0),
  },
  {
    id: "stage-mastery",
    title: "Mastery complete",
    description: "Finish the whole Lumen Method.",
    icon: "trophy",
    group: "Program",
    xp: 250,
    progress: (c) => (c.stagesCompleted.has("mastery") ? 1 : 0),
  },
  {
    id: "challenger",
    title: "Challenger",
    description: "Complete five weekly challenges.",
    icon: "medal",
    group: "Program",
    xp: 100,
    progress: (c) => ratio(c.challengesCompleted, 5),
  },
  {
    id: "check-in-4",
    title: "Measured",
    description: "Complete four check-ins.",
    icon: "gauge",
    group: "Program",
    xp: 80,
    progress: (c) => ratio(c.sessions.filter((s) => s.exercise === "assessment").length, 4),
  },
  {
    id: "wide-glance",
    title: "Wide glance",
    description: "Recognize both words at 8+ characters from center in Word flash.",
    icon: "eye",
    group: "Skills",
    xp: 60,
    progress: (c) => ratio(Math.max(0, ...c.sessions.filter((s) => s.exercise === "span").map((s) => s.score ?? 0)), 8),
  },
  {
    id: "calm-eyes",
    title: "Calm eyes",
    description: "Finish a 5×5 focus grid in under 30 seconds.",
    icon: "grid",
    group: "Skills",
    xp: 50,
    progress: (c) =>
      c.sessions.some((s) => s.exercise === "grid" && Number(s.meta.best5 ?? 999) < 30) ? 1 : 0,
  },
  {
    id: "phrase-four",
    title: "Four at a glance",
    description: "Reach four-word phrases in Phrase flash.",
    icon: "eye",
    group: "Skills",
    xp: 60,
    progress: (c) => ratio(Math.max(0, ...c.sessions.filter((s) => s.exercise === "chunks").map((s) => s.score ?? 0)), 4),
  },
];

export const achievementById = new Map(achievements.map((a) => [a.id, a]));
