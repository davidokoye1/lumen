import "server-only";
import { getDb } from "@/lib/db";

export type LessonRecord = {
  lessonId: string;
  completedAt: string;
  attempts: number;
  bestScore: number | null;
  reflection: string[];
};

export function listLessonProgress(userId: string): Map<string, LessonRecord> {
  const rows = getDb()
    .prepare(`SELECT lesson_id, completed_at, attempts, best_score, reflection FROM lesson_progress WHERE user_id = ?`)
    .all(userId) as { lesson_id: string; completed_at: string; attempts: number; best_score: number | null; reflection: string | null }[];
  return new Map(
    rows.map((r) => {
      let reflection: string[] = [];
      try {
        reflection = r.reflection ? JSON.parse(r.reflection) : [];
      } catch {}
      return [
        r.lesson_id,
        { lessonId: r.lesson_id, completedAt: r.completed_at, attempts: r.attempts, bestScore: r.best_score, reflection },
      ];
    }),
  );
}

/** Upsert; returns true if this is the first completion. */
export function recordLessonCompletion(userId: string, lessonId: string, score: number | null, reflection: string[]): boolean {
  const db = getDb();
  const existing = db
    .prepare(`SELECT attempts, best_score FROM lesson_progress WHERE user_id = ? AND lesson_id = ?`)
    .get(userId, lessonId) as { attempts: number; best_score: number | null } | undefined;
  const now = new Date().toISOString();
  if (!existing) {
    db.prepare(
      `INSERT INTO lesson_progress (user_id, lesson_id, completed_at, attempts, best_score, reflection) VALUES (?, ?, ?, 1, ?, ?)`,
    ).run(userId, lessonId, now, score, JSON.stringify(reflection));
    return true;
  }
  const best = score == null ? existing.best_score : Math.max(score, existing.best_score ?? 0);
  db.prepare(
    `UPDATE lesson_progress SET attempts = attempts + 1, best_score = ?, reflection = ? WHERE user_id = ? AND lesson_id = ?`,
  ).run(best, JSON.stringify(reflection), userId, lessonId);
  return false;
}

/** Number of first-time lesson completions on or after a local date key. */
export function lessonsCompletedSince(userId: string, fromDate: string): number {
  const r = getDb()
    .prepare(`SELECT COUNT(*) AS n FROM xp_ledger WHERE user_id = ? AND reason = 'lesson' AND local_date >= ?`)
    .get(userId, fromDate) as { n: number };
  return r.n;
}
