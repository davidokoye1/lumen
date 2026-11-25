"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getActionUser } from "@/lib/auth/session";
import { getLesson, lessons, stages } from "@/lib/curriculum/lessons";
import { lessonStates, stageProgress } from "@/lib/curriculum/progress";
import { listLessonProgress, recordLessonCompletion } from "@/lib/dal/lessons";
import { updateUser } from "@/lib/dal/users";
import { createNotification } from "@/lib/dal/notifications";
import { settleLesson, type Rewards } from "@/lib/services/rewards";
import type { ActionResult } from "@/lib/validation";

const schema = z.object({
  lessonId: z.string().max(10),
  reflections: z.array(z.string().max(80)).max(6),
  score: z.number().min(0).max(1).nullable(),
});

export type LessonCompletion = {
  firstTime: boolean;
  nextLessonId: string | null;
  stageCompleted: string | null;
  promotedTo: string | null;
  rewards: Rewards;
};

export async function completeLessonAction(input: z.infer<typeof schema>): Promise<ActionResult<LessonCompletion>> {
  let user;
  try {
    user = await getActionUser();
  } catch {
    return { ok: false, error: "Your session has expired. Please sign in again." };
  }
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid lesson data." };
  const lesson = getLesson(parsed.data.lessonId);
  if (!lesson) return { ok: false, error: "Unknown lesson." };

  const before = lessonStates(user.level, listLessonProgress(user.id));
  const state = before.find((l) => l.id === lesson.id)!;
  if (state.state === "locked") return { ok: false, error: "Finish the previous session first." };

  const firstTime = recordLessonCompletion(user.id, lesson.id, parsed.data.score, parsed.data.reflections);

  // Stage completion & promotion.
  const after = lessonStates(user.level, listLessonProgress(user.id));
  const stage = stageProgress(after).find((s) => s.id === lesson.stage)!;
  const wasComplete = stageProgress(before).find((s) => s.id === lesson.stage)!.complete;
  let stageCompleted: string | null = null;
  let promotedTo: string | null = null;
  if (stage.complete && !wasComplete) {
    stageCompleted = stage.title;
    const next = stages[stage.index + 1];
    if (next && user.level === stage.id) {
      updateUser(user.id, { level: next.id });
      user = { ...user, level: next.id };
      promotedTo = next.title;
    }
    if (user.preferences.notifyProgram)
      createNotification(user.id, {
        kind: "program",
        title: `${stage.title} complete`,
        body: next ? `Next up: ${next.title}, ${next.tagline.toLowerCase()}.` : "You've finished the Lumen Method. Keep your system going.",
        href: "/learn",
        dedupeKey: `stage:${stage.id}`,
      });
  }

  const rewards = settleLesson(user, lesson.id, lesson.kind === "checkpoint", firstTime);
  const idx = lessons.findIndex((l) => l.id === lesson.id);
  const nextStates = lessonStates(user.level, listLessonProgress(user.id));
  const nextLessonId = nextStates.slice(idx + 1).find((l) => l.state !== "completed")?.id ?? null;

  revalidatePath("/", "layout");
  return { ok: true, data: { firstTime, nextLessonId, stageCompleted, promotedTo, rewards } };
}
