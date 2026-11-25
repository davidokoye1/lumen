"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getActionUser } from "@/lib/auth/session";
import { updatePreferences, updateUser } from "@/lib/dal/users";
import { listSessions } from "@/lib/dal/practice";
import { purposes } from "@/lib/preferences";
import { isValidTimeZone } from "@/lib/time";
import type { ActionResult } from "@/lib/validation";

const goalsSchema = z.object({
  purpose: z.enum(purposes),
  dailyGoalMinutes: z.number().int().min(5).max(60),
  weeklyGoalDays: z.number().int().min(1).max(7),
  targetWpm: z.number().int().min(150).max(1000),
  timezone: z.string().max(64),
});

export async function saveGoalsAction(input: z.infer<typeof goalsSchema>): Promise<ActionResult> {
  try {
    const user = await getActionUser();
    const parsed = goalsSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Please check your choices." };
    const { timezone, ...rest } = parsed.data;
    updatePreferences(user.id, { ...rest, ...(isValidTimeZone(timezone) ? { timezone } : {}) });
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: "Your session has expired. Please sign in again." };
  }
}

const finishSchema = z.object({ level: z.enum(["foundations", "fluency", "mastery"]) });

export async function finishOnboardingAction(input: z.infer<typeof finishSchema>): Promise<ActionResult> {
  try {
    const user = await getActionUser();
    const parsed = finishSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Choose a starting level." };
    const placement = listSessions(user.id)
      .filter((s) => s.exercise === "placement" && s.comprehension != null && !s.flagged)
      .at(-1);
    updateUser(user.id, {
      level: parsed.data.level,
      onboarded: true,
      ...(placement ? { baselineWpm: placement.wpm, baselineComp: placement.comprehension } : {}),
    });
    if (placement?.wpm) {
      // Seed comfortable training speeds from the measured baseline.
      updatePreferences(user.id, {
        rsvpWpm: Math.round((placement.wpm * 1.1) / 10) * 10,
        pacerWpm: Math.round(placement.wpm / 10) * 10,
      });
    }
    revalidatePath("/", "layout");
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: "Your session has expired. Please sign in again." };
  }
}
