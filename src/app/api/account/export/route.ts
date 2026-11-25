import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Download everything we store about the signed-in user (minus secrets). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const db = getDb();
  const q = (sql: string) => db.prepare(sql).all(user.id);
  const data = {
    exportedAt: new Date().toISOString(),
    profile: {
      name: user.name,
      email: user.email,
      level: user.level,
      baselineWpm: user.baselineWpm,
      baselineComprehension: user.baselineComp,
      createdAt: user.createdAt,
    },
    preferences: user.preferences,
    sessions: (q(`SELECT * FROM practice_sessions WHERE user_id = ? ORDER BY created_at`) as Record<string, unknown>[]).map(
      ({ user_id: _u, meta, ...rest }) => ({ ...rest, meta: JSON.parse(String(meta || "{}")) }),
    ),
    lessons: q(`SELECT lesson_id, completed_at, attempts, best_score, reflection FROM lesson_progress WHERE user_id = ?`),
    bookmarks: q(`SELECT passage_id, created_at FROM bookmarks WHERE user_id = ?`),
    customTexts: q(`SELECT id, title, body, words, created_at FROM custom_texts WHERE user_id = ?`),
    achievements: q(`SELECT achievement_id, unlocked_at FROM achievements WHERE user_id = ?`),
    xp: q(`SELECT amount, reason, ref, local_date, created_at FROM xp_ledger WHERE user_id = ? ORDER BY created_at`),
    notifications: q(`SELECT kind, title, body, created_at, read_at FROM notifications WHERE user_id = ?`),
  };
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="lumen-export-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
