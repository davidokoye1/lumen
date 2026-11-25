"use server";

import { revalidatePath } from "next/cache";
import { getActionUser } from "@/lib/auth/session";
import {
  drillSubmissionSchema,
  readingSubmissionSchema,
  type ActionResult,
  type DrillSubmission,
  type ReadingSubmission,
} from "@/lib/validation";
import { getPassage, gradeAnswers } from "@/lib/content";
import { getCustomText } from "@/lib/dal/library";
import { recordPractice, type Rewards } from "@/lib/services/rewards";
import { IMPLAUSIBLE_WPM } from "@/lib/reading/text";
import { getLesson } from "@/lib/curriculum/lessons";
import { round } from "@/lib/utils";

export type ReadingResult = {
  sessionId: string;
  wpm: number;
  words: number;
  comprehension: number | null;
  effective: number | null;
  flagged: boolean;
  correct: number[] | null;
  results: boolean[] | null;
  rewards: Rewards;
};

function fail(error: string): { ok: false; error: string } {
  return { ok: false, error };
}

export async function submitReadingAction(input: ReadingSubmission): Promise<ActionResult<ReadingResult>> {
  let user;
  try {
    user = await getActionUser();
  } catch {
    return fail("Your session has expired. Please sign in again.");
  }
  const parsed = readingSubmissionSchema.safeParse(input);
  if (!parsed.success) return fail("That result couldn't be saved because some of the data was invalid.");
  const s = parsed.data;
  if (s.lessonId && !getLesson(s.lessonId)) return fail("Unknown lesson.");

  let title: string;
  let totalWords: number;
  let sourceType: "passage" | "custom";
  let sourceId: string;
  let difficulty: number | null = null;
  let grade: ReturnType<typeof gradeAnswers> | null = null;
  let exercise = s.exercise;

  if (s.source.type === "passage") {
    const p = getPassage(s.source.slug);
    if (!p) return fail("That passage no longer exists.");
    title = p.title;
    totalWords = p.words;
    sourceType = "passage";
    sourceId = p.slug;
    difficulty = p.difficulty;
    if ((exercise === "assessment" || exercise === "placement") && p.kind !== "assessment")
      return fail("Check-ins must use a standardized passage.");
    if (exercise === "timed" && p.kind === "assessment") exercise = "assessment";
    if (s.answers && s.answers.length) {
      if (s.answers.length !== p.questions.length) return fail("Answer every question before submitting.");
      grade = gradeAnswers(p, s.answers);
    }
  } else {
    const t = getCustomText(user.id, s.source.id);
    if (!t) return fail("That text no longer exists.");
    if (exercise === "assessment" || exercise === "placement") return fail("Check-ins must use a standardized passage.");
    title = t.title;
    totalWords = t.words;
    sourceType = "custom";
    sourceId = t.id;
  }

  const words = s.completed ? totalWords : Math.min(s.wordsRead, totalWords);
  if (words < 10) return fail("Read a little more before saving. That session was too short to measure.");
  const minutes = s.durationMs / 60_000;
  const wpm = Math.round(words / minutes);

  // Comprehension only counts if most of the text was actually read.
  const comprehension = grade && words >= totalWords * 0.8 ? round(grade.fraction, 3) : null;
  const selfPaced = exercise === "timed" || exercise === "assessment" || exercise === "placement";
  const flagged = selfPaced && !s.skim && wpm > IMPLAUSIBLE_WPM;

  const { session, rewards } = recordPractice(user, {
    exercise,
    sourceType,
    sourceId,
    title,
    words,
    durationMs: s.durationMs,
    wpm,
    comprehension,
    accuracy: null,
    score: s.wpmSetting ?? null,
    difficulty,
    lessonId: s.lessonId ?? null,
    flagged,
    meta: {
      ...(s.skim ? { skim: true } : {}),
      ...(s.preview ? { preview: true } : {}),
      ...(s.chunk ? { chunk: s.chunk } : {}),
      ...(s.wpmSetting ? { wpmSetting: s.wpmSetting } : {}),
      ...(s.recallScore != null ? { recall: round(s.recallScore, 2) } : {}),
      completed: s.completed,
    },
  });

  revalidatePath("/", "layout");
  return {
    ok: true,
    data: {
      sessionId: session.id,
      wpm,
      words,
      comprehension,
      effective: comprehension != null ? Math.round(wpm * comprehension) : null,
      flagged,
      correct: grade?.correct ?? null,
      results: grade?.results ?? null,
      rewards,
    },
  };
}

export type DrillResult = { sessionId: string; accuracy: number; rewards: Rewards };

const drillTitles: Record<DrillSubmission["exercise"], string> = {
  span: "Word flash",
  grid: "Focus grid",
  chunks: "Phrase flash",
  scan: "Scan hunt",
};

export async function submitDrillAction(input: DrillSubmission): Promise<ActionResult<DrillResult>> {
  let user;
  try {
    user = await getActionUser();
  } catch {
    return fail("Your session has expired. Please sign in again.");
  }
  const parsed = drillSubmissionSchema.safeParse(input);
  if (!parsed.success) return fail("That result couldn't be saved because some of the data was invalid.");
  const d = parsed.data;
  if (d.correct > d.trials) return fail("Invalid result.");
  if (d.lessonId && !getLesson(d.lessonId)) return fail("Unknown lesson.");
  if (d.exercise === "grid" && d.score < 1) return fail("Invalid result.");
  const accuracy = round(d.correct / d.trials, 3);
  const passage = d.sourceSlug ? getPassage(d.sourceSlug) : null;

  const { session, rewards } = recordPractice(user, {
    exercise: d.exercise,
    sourceType: passage ? "passage" : "drill",
    sourceId: passage?.slug ?? null,
    title: passage ? `${drillTitles[d.exercise]} · ${passage.title}` : drillTitles[d.exercise],
    words: d.words ?? 0,
    durationMs: d.durationMs,
    wpm: null,
    comprehension: null,
    accuracy,
    score: round(d.score, 2),
    difficulty: d.difficulty,
    lessonId: d.lessonId ?? null,
    flagged: false,
    meta: { ...(d.meta ?? {}), trials: d.trials, correct: d.correct },
  });
  revalidatePath("/", "layout");
  return { ok: true, data: { sessionId: session.id, accuracy, rewards } };
}
