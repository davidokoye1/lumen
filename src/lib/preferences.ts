import { z } from "zod";

export const readingFonts = ["serif", "sans", "hyper"] as const;
export const themes = ["system", "light", "dark"] as const;
export const purposes = ["work", "study", "leisure", "exam"] as const;

export const preferencesSchema = z.object({
  timezone: z.string().max(64).default("UTC"),
  theme: z.enum(themes).default("system"),
  purpose: z.enum(purposes).default("study"),

  dailyGoalMinutes: z.number().int().min(5).max(120).default(15),
  weeklyGoalDays: z.number().int().min(1).max(7).default(5),
  targetWpm: z.number().int().min(150).max(1000).default(350),

  readingFont: z.enum(readingFonts).default("serif"),
  readingSize: z.number().int().min(15).max(28).default(19),
  lineHeight: z.number().min(1.4).max(2.2).default(1.7),

  rsvpWpm: z.number().int().min(100).max(1200).default(300),
  rsvpFontSize: z.number().int().min(28).max(96).default(54),
  rsvpChunk: z.number().int().min(1).max(4).default(1),
  orpHighlight: z.boolean().default(true),
  punctuationPauses: z.boolean().default(true),
  easeIn: z.boolean().default(true),

  pacerWpm: z.number().int().min(100).max(1000).default(260),
  pacerChunk: z.number().int().min(1).max(6).default(3),
  showTimer: z.boolean().default(true),

  notifyAchievements: z.boolean().default(true),
  notifyStreak: z.boolean().default(true),
  notifyWeeklyReport: z.boolean().default(true),
  notifyProgram: z.boolean().default(true),
  dailyReminder: z.boolean().default(false),
  reminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .default("19:00"),

  leaderboardOptIn: z.boolean().default(false),
});

export type Preferences = z.infer<typeof preferencesSchema>;

export const defaultPreferences: Preferences = preferencesSchema.parse({});

export function parsePreferences(raw: unknown): Preferences {
  const result = preferencesSchema.safeParse(raw ?? {});
  if (result.success) return result.data;
  // Fall back field-by-field so one bad value never wipes the rest.
  const base = { ...defaultPreferences } as Record<string, unknown>;
  if (raw && typeof raw === "object") {
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      const field = (preferencesSchema.shape as Record<string, z.ZodType>)[k];
      if (field && field.safeParse(v).success) base[k] = v;
    }
  }
  return base as Preferences;
}

export const readingFontClass: Record<Preferences["readingFont"], string> = {
  serif: "reading-font-serif",
  sans: "reading-font-sans",
  hyper: "reading-font-hyper",
};
