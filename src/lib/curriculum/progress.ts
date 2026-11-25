import type { Level } from "@/lib/dal/users";
import type { LessonRecord } from "@/lib/dal/lessons";
import { lessons, stages } from "./lessons";
import type { Lesson, PassagePick } from "./types";
import { checkInPassages, libraryPassages, type Passage } from "@/lib/content";
import { hashString } from "@/lib/utils";

export type LessonState = "completed" | "available" | "locked";

export type LessonWithState = Lesson & { state: LessonState; completedAt: string | null; stageIndex: number };

export function stageIndexOf(level: Level) {
  return stages.find((s) => s.id === level)?.index ?? 0;
}

export function lessonStates(level: Level, progress: Map<string, LessonRecord>): LessonWithState[] {
  const placed = stageIndexOf(level);
  return lessons.map((l, i) => {
    const stageIndex = stageIndexOf(l.stage);
    const done = progress.has(l.id);
    const prevDone = i === 0 || progress.has(lessons[i - 1].id);
    const firstOfPlacedStage = stageIndex === placed && lessons.findIndex((x) => x.stage === l.stage) === i;
    let state: LessonState = "locked";
    if (done) state = "completed";
    else if (stageIndex < placed || prevDone || firstOfPlacedStage) state = "available";
    return { ...l, state, completedAt: progress.get(l.id)?.completedAt ?? null, stageIndex };
  });
}

/** The next session the reader should do: first incomplete, unlocked lesson from their stage onward. */
export function nextLesson(states: LessonWithState[], level: Level): LessonWithState | null {
  const placed = stageIndexOf(level);
  return (
    states.find((l) => l.stageIndex >= placed && l.state === "available") ??
    states.find((l) => l.state === "available") ??
    null
  );
}

export function stageProgress(states: LessonWithState[]) {
  return stages.map((s) => {
    const items = states.filter((l) => l.stage === s.id);
    const done = items.filter((l) => l.state === "completed").length;
    return { ...s, total: items.length, done, complete: done === items.length };
  });
}

export function programProgress(states: LessonWithState[]) {
  const done = states.filter((l) => l.state === "completed").length;
  return { done, total: states.length, fraction: done / states.length };
}

type ReadHistory = Map<string, { count: number; last: string }>;

/** Choose a library passage: unread first, then least recently read; stable per lesson. */
export function pickLibraryPassage(
  difficulty: 1 | 2 | 3,
  history: ReadHistory,
  seed: string,
  exclude: Set<string> = new Set(),
): Passage {
  const pool = libraryPassages.filter((p) => p.difficulty === difficulty && !exclude.has(p.slug));
  const candidates = pool.length ? pool : libraryPassages.filter((p) => !exclude.has(p.slug));
  return [...candidates].sort((a, b) => {
    const ha = history.get(a.slug);
    const hb = history.get(b.slug);
    if (!ha && hb) return -1;
    if (ha && !hb) return 1;
    if (ha && hb && ha.last !== hb.last) return ha.last < hb.last ? -1 : 1;
    return hashString(seed + a.slug) - hashString(seed + b.slug);
  })[0];
}

/** Rotate through check-in passages so a reader never repeats one until all are used. */
export function pickCheckInPassage(history: ReadHistory, exclude: Set<string> = new Set()): Passage {
  const pool = checkInPassages.filter((p) => !exclude.has(p.slug));
  return [...pool].sort((a, b) => {
    const ha = history.get(a.slug);
    const hb = history.get(b.slug);
    if (!ha && hb) return -1;
    if (ha && !hb) return 1;
    if (ha && hb) return ha.last < hb.last ? -1 : 1;
    return checkInPassages.indexOf(a) - checkInPassages.indexOf(b);
  })[0];
}

export function resolvePick(pick: PassagePick, history: ReadHistory, seed: string, exclude: Set<string>): Passage {
  if (pick.pick === "checkin") return pickCheckInPassage(history, exclude);
  if (pick.pick === "slug") {
    const p = [...libraryPassages, ...checkInPassages].find((x) => x.slug === pick.slug);
    if (p) return p;
  }
  return pickLibraryPassage(pick.pick === "auto" ? pick.difficulty : 2, history, seed, exclude);
}
