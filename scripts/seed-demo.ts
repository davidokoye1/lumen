/**
 * Creates a clearly-labelled demo account with ~8 weeks of simulated practice
 * so the dashboard and analytics can be explored without weeks of real use.
 *
 *   npm run db:seed-demo
 *   → demo@lumen.local / demo-reader-1
 *
 * Real accounts never receive simulated data.
 */
import { getDb } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createUser, getUserAuthByEmail, getUserById, updateUser, updatePreferences, deleteUser } from "@/lib/dal/users";
import { insertSession } from "@/lib/dal/practice";
import { awardXp } from "@/lib/dal/gamification";
import { recordLessonCompletion } from "@/lib/dal/lessons";
import { lessons } from "@/lib/curriculum/lessons";
import { libraryPassages, checkInPassages } from "@/lib/content";
import { sessionXp, settleLesson } from "@/lib/services/rewards";
import { listSessions } from "@/lib/dal/practice";
import { addDays, dateKeyInZone } from "@/lib/time";
import { seededRandom } from "@/lib/utils";

const EMAIL = "demo@lumen.local";
const PASSWORD = "demo-reader-1";
const TZ = "America/New_York";

async function main() {
  getDb();
  const existing = getUserAuthByEmail(EMAIL);
  if (existing) deleteUser(existing.id);
  const user = createUser({ email: EMAIL, name: "Demo Reader", passwordHash: await hashPassword(PASSWORD), timezone: TZ });
  updatePreferences(user.id, { dailyGoalMinutes: 15, weeklyGoalDays: 5, leaderboardOptIn: true, rsvpWpm: 340, pacerWpm: 300 });

  const rand = seededRandom(42);
  const today = dateKeyInZone(new Date(), TZ);
  const DAYS = 56;
  let lessonIdx = 0;
  let checkIns = 0;
  const startWpm = 232;

  for (let d = DAYS; d >= 0; d--) {
    const date = addDays(today, -d);
    const progress = (DAYS - d) / DAYS; // 0 → 1
    // ~80% of days active, with a gap in week 4
    if (d !== 0 && (rand() > 0.82 || (d >= 30 && d <= 32))) continue;
    const natural = Math.round(startWpm * (1 + 0.24 * progress) + (rand() - 0.5) * 30);
    const at = (h: number, m: number) => new Date(`${date}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00-05:00`).toISOString();
    const add = (s: Parameters<typeof insertSession>[1]) => {
      const rec = insertSession(user.id, s);
      awardXp(user.id, s.xp, "session", rec.id, date);
    };
    const base = { lessonId: null, flagged: false, localDate: date, accuracy: null, score: null, difficulty: 2 } as const;
    const nSessions = 2 + Math.floor(rand() * 3);
    for (let k = 0; k < nSessions; k++) {
      const hour = 7 + Math.floor(rand() * 14);
      const kind = (["timed", "pacer", "rsvp", "chunks", "span", "grid", "scan"] as const)[Math.floor(rand() * 7)];
      const p = libraryPassages[Math.floor(rand() * libraryPassages.length)];
      if (kind === "timed" || kind === "pacer" || kind === "rsvp") {
        const speed = kind === "timed" ? natural : Math.round(natural * (1.1 + rand() * 0.45));
        const comp = Math.max(0.4, Math.min(1, (kind === "timed" ? 0.86 : 0.78) - (speed - natural) / 900 + (rand() - 0.5) * 0.25));
        const c = Math.round(comp * 5) / 5;
        const words = p.words;
        const s = {
          ...base,
          exercise: kind,
          sourceType: "passage" as const,
          sourceId: p.slug,
          title: p.title,
          words,
          durationMs: Math.round((words / speed) * 60_000),
          wpm: speed,
          comprehension: c,
          difficulty: p.difficulty,
          meta: { completed: true },
          createdAt: at(hour, Math.floor(rand() * 59)),
        };
        add({ ...s, xp: sessionXp(s) });
      } else {
        const acc = Math.min(1, 0.55 + progress * 0.3 + (rand() - 0.5) * 0.2);
        const trials = kind === "grid" ? 30 : 14;
        const s = {
          ...base,
          exercise: kind,
          sourceType: "drill" as const,
          sourceId: null,
          title: { chunks: "Phrase flash", span: "Word flash", grid: "Focus grid", scan: "Scan hunt" }[kind],
          words: kind === "chunks" ? 40 : kind === "span" ? 28 : 0,
          durationMs: 120_000 + Math.floor(rand() * 90_000),
          wpm: null,
          comprehension: null,
          accuracy: Math.round(acc * 100) / 100,
          score:
            kind === "span"
              ? Math.round(4 + progress * 6 + rand() * 2)
              : kind === "chunks"
                ? Math.min(5, 2 + Math.round(progress * 2 + rand()))
                : kind === "grid"
                  ? Math.round((42 - progress * 14 + rand() * 6) * 10) / 10
                  : Math.round((6 - progress * 2.5 + rand()) * 10) / 10,
          meta: kind === "grid" ? { best5: Math.round((42 - progress * 14 + rand() * 6) * 10) / 10, trials } : { trials },
          createdAt: at(hour, Math.floor(rand() * 59)),
        };
        add({ ...s, xp: sessionXp(s) });
      }
    }
    // weekly check-in on Mondays-ish
    if (new Date(`${date}T12:00:00Z`).getUTCDay() === 1) {
      const p = checkInPassages[checkIns % checkInPassages.length];
      checkIns++;
      const comp = Math.round(Math.min(1, 0.8 + rand() * 0.2) * 5) / 5;
      const s = {
        ...base,
        exercise: "assessment" as const,
        sourceType: "passage" as const,
        sourceId: p.slug,
        title: p.title,
        words: p.words,
        durationMs: Math.round((p.words / natural) * 60_000),
        wpm: natural,
        comprehension: comp,
        meta: { completed: true },
        createdAt: at(8, 15),
      };
      add({ ...s, xp: sessionXp(s) });
    }
    // a program session most active days
    if (lessonIdx < 15 && rand() > 0.35) {
      const l = lessons[lessonIdx++];
      recordLessonCompletion(user.id, l.id, 0.8, []);
      awardXp(user.id, l.kind === "checkpoint" ? 80 : 40, "lesson", l.id, date);
      getDb().prepare(`UPDATE lesson_progress SET completed_at = ? WHERE user_id = ? AND lesson_id = ?`).run(at(20, 30), user.id, l.id);
    }
    awardXp(user.id, 20, "daily_goal", date, date);
  }

  const first = listSessions(user.id).find((s) => s.exercise === "timed");
  updateUser(user.id, { onboarded: true, level: "fluency", baselineWpm: first?.wpm ?? startWpm, baselineComp: first?.comprehension ?? 0.8 });

  // Settle badges and this week's challenges exactly as real activity would.
  const fresh = getUserById(user.id)!;
  settleLesson(fresh, lessons[0].id, false, false);
  const sessions = listSessions(user.id);

  console.log(`Seeded ${sessions.length} sessions over ${DAYS} days.`);
  console.log(`Sign in with ${EMAIL} / ${PASSWORD}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
