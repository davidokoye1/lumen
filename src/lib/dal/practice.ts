import "server-only";
import { getDb } from "@/lib/db";
import { newId } from "@/lib/utils";
import type { SessionKind } from "@/lib/exercises";

export type SessionRecord = {
  id: string;
  exercise: SessionKind;
  sourceType: "passage" | "custom" | "drill";
  sourceId: string | null;
  title: string;
  words: number;
  durationMs: number;
  wpm: number | null;
  comprehension: number | null;
  accuracy: number | null;
  score: number | null;
  difficulty: number | null;
  lessonId: string | null;
  flagged: boolean;
  xp: number;
  meta: Record<string, unknown>;
  localDate: string;
  createdAt: string;
};

type Row = {
  id: string;
  exercise: SessionKind;
  source_type: SessionRecord["sourceType"];
  source_id: string | null;
  title: string;
  words: number;
  duration_ms: number;
  wpm: number | null;
  comprehension: number | null;
  accuracy: number | null;
  score: number | null;
  difficulty: number | null;
  lesson_id: string | null;
  flagged: number;
  xp: number;
  meta: string;
  local_date: string;
  created_at: string;
};

function toRecord(r: Row): SessionRecord {
  let meta: Record<string, unknown> = {};
  try {
    meta = JSON.parse(r.meta);
  } catch {}
  return {
    id: r.id,
    exercise: r.exercise,
    sourceType: r.source_type,
    sourceId: r.source_id,
    title: r.title,
    words: r.words,
    durationMs: r.duration_ms,
    wpm: r.wpm,
    comprehension: r.comprehension,
    accuracy: r.accuracy,
    score: r.score,
    difficulty: r.difficulty,
    lessonId: r.lesson_id,
    flagged: !!r.flagged,
    xp: r.xp,
    meta,
    localDate: r.local_date,
    createdAt: r.created_at,
  };
}

export type NewSession = Omit<SessionRecord, "id" | "createdAt"> & { createdAt?: string };

export function insertSession(userId: string, s: NewSession): SessionRecord {
  const id = newId();
  const createdAt = s.createdAt ?? new Date().toISOString();
  getDb()
    .prepare(
      `INSERT INTO practice_sessions
        (id, user_id, exercise, source_type, source_id, title, words, duration_ms, wpm, comprehension, accuracy, score,
         difficulty, lesson_id, flagged, xp, meta, local_date, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      userId,
      s.exercise,
      s.sourceType,
      s.sourceId,
      s.title,
      s.words,
      s.durationMs,
      s.wpm,
      s.comprehension,
      s.accuracy,
      s.score,
      s.difficulty,
      s.lessonId,
      s.flagged ? 1 : 0,
      s.xp,
      JSON.stringify(s.meta ?? {}),
      s.localDate,
      createdAt,
    );
  return { ...s, id, createdAt };
}

/** All sessions for a user, oldest first. One user's history is small enough to aggregate in memory. */
export function listSessions(userId: string): SessionRecord[] {
  const rows = getDb()
    .prepare(`SELECT * FROM practice_sessions WHERE user_id = ? ORDER BY created_at ASC`)
    .all(userId) as Row[];
  return rows.map(toRecord);
}

export function listRecentSessions(userId: string, limit = 10): SessionRecord[] {
  const rows = getDb()
    .prepare(`SELECT * FROM practice_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`)
    .all(userId, limit) as Row[];
  return rows.map(toRecord);
}

export function sourceReadCounts(userId: string): Map<string, { count: number; last: string }> {
  const rows = getDb()
    .prepare(
      `SELECT source_id, COUNT(*) AS n, MAX(created_at) AS last FROM practice_sessions
       WHERE user_id = ? AND source_type = 'passage' AND source_id IS NOT NULL GROUP BY source_id`,
    )
    .all(userId) as { source_id: string; n: number; last: string }[];
  return new Map(rows.map((r) => [r.source_id, { count: r.n, last: r.last }]));
}
