import { z } from "zod";
import { preferencesSchema } from "@/lib/preferences";

const email = z
  .string()
  .trim()
  .min(1, "Enter your email")
  .max(254, "That email is too long")
  .pipe(z.email("Enter a valid email address"));

export const passwordRules = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(128, "Use at most 128 characters")
  .refine((p) => /[A-Za-z]/.test(p) && /\d/.test(p), "Include at least one letter and one number");

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Tell us your name").max(60, "Keep it under 60 characters"),
  email,
  password: passwordRules,
  timezone: z.string().max(64).optional(),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password").max(128),
});

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Name can't be empty").max(60),
  email,
});

export const passwordChangeSchema = z
  .object({
    current: z.string().min(1, "Enter your current password"),
    next: passwordRules,
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { path: ["confirm"], message: "Passwords don't match" });

export const preferencesPatchSchema = preferencesSchema.partial();

export const customTextSchema = z.object({
  title: z.string().trim().min(1, "Give it a title").max(120, "Keep the title under 120 characters"),
  body: z
    .string()
    .trim()
    .min(1, "Paste some text")
    .max(150_000, "That's too long, so paste up to about 20,000 words")
    .refine((b) => (b.match(/\S+/g)?.length ?? 0) >= 50, "Add at least 50 words so the reading is meaningful")
    .refine((b) => (b.match(/\S+/g)?.length ?? 0) <= 20_000, "Keep it under 20,000 words"),
});

const source = z.discriminatedUnion("type", [
  z.object({ type: z.literal("passage"), slug: z.string().min(1).max(120) }),
  z.object({ type: z.literal("custom"), id: z.string().uuid() }),
]);

export const readingSubmissionSchema = z.object({
  exercise: z.enum(["timed", "rsvp", "pacer", "assessment", "placement"]),
  source,
  durationMs: z.number().int().min(1_000).max(3 * 3_600_000),
  wordsRead: z.number().int().min(0).max(50_000),
  completed: z.boolean(),
  answers: z.array(z.number().int().min(-1).max(3)).max(10).optional(),
  wpmSetting: z.number().int().min(50).max(1500).optional(),
  chunk: z.number().int().min(1).max(6).optional(),
  skim: z.boolean().optional(),
  preview: z.boolean().optional(),
  recallScore: z.number().min(0).max(1).optional(),
  lessonId: z.string().max(10).optional(),
});

export type ReadingSubmission = z.infer<typeof readingSubmissionSchema>;

export const drillSubmissionSchema = z.object({
  exercise: z.enum(["span", "grid", "chunks", "scan"]),
  durationMs: z.number().int().min(1_000).max(3_600_000),
  trials: z.number().int().min(1).max(500),
  correct: z.number().int().min(0).max(500),
  score: z.number().min(0).max(10_000),
  difficulty: z.number().int().min(1).max(3),
  words: z.number().int().min(0).max(5_000).optional(),
  sourceSlug: z.string().max(120).optional(),
  meta: z.record(z.string(), z.union([z.number(), z.string(), z.boolean(), z.array(z.number())])).optional(),
  lessonId: z.string().max(10).optional(),
});

export type DrillSubmission = z.infer<typeof drillSubmissionSchema>;

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: string;
  values?: Record<string, string>;
} | null;
