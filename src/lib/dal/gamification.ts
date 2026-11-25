import "server-only";
import { getDb } from "@/lib/db";

export function totalXp(userId: string): number {
  const r = getDb().prepare(`SELECT COALESCE(SUM(amount), 0) AS xp FROM xp_ledger WHERE user_id = ?`).get(userId) as {
    xp: number;
  };
  return r.xp;
}

/** Returns false if an entry with the same (reason, ref) already exists. */
export function awardXp(
  userId: string,
  amount: number,
  reason: "session" | "lesson" | "daily_goal" | "challenge" | "achievement",
  ref: string | null,
  localDate: string,
): boolean {
  if (amount <= 0) return false;
  const res = getDb()
    .prepare(
      `INSERT OR IGNORE INTO xp_ledger (user_id, amount, reason, ref, local_date, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(userId, amount, reason, ref, localDate, new Date().toISOString());
  return res.changes > 0;
}

export function hasXpRef(userId: string, reason: string, ref: string): boolean {
  return !!getDb().prepare(`SELECT 1 FROM xp_ledger WHERE user_id = ? AND reason = ? AND ref = ?`).get(userId, reason, ref);
}

export function xpByDate(userId: string, from: string): { date: string; xp: number }[] {
  return getDb()
    .prepare(
      `SELECT local_date AS date, SUM(amount) AS xp FROM xp_ledger WHERE user_id = ? AND local_date >= ? GROUP BY local_date ORDER BY local_date`,
    )
    .all(userId, from) as { date: string; xp: number }[];
}

export function unlockedAchievements(userId: string): Map<string, string> {
  const rows = getDb()
    .prepare(`SELECT achievement_id, unlocked_at FROM achievements WHERE user_id = ?`)
    .all(userId) as { achievement_id: string; unlocked_at: string }[];
  return new Map(rows.map((r) => [r.achievement_id, r.unlocked_at]));
}

export function unlockAchievement(userId: string, id: string): boolean {
  const res = getDb()
    .prepare(`INSERT OR IGNORE INTO achievements (user_id, achievement_id, unlocked_at) VALUES (?, ?, ?)`)
    .run(userId, id, new Date().toISOString());
  return res.changes > 0;
}

export function completedChallengeCount(userId: string): number {
  const r = getDb()
    .prepare(`SELECT COUNT(*) AS n FROM xp_ledger WHERE user_id = ? AND reason = 'challenge'`)
    .get(userId) as { n: number };
  return r.n;
}

export function completedChallengeKeys(userId: string, weekKey: string): Set<string> {
  const rows = getDb()
    .prepare(`SELECT ref FROM xp_ledger WHERE user_id = ? AND reason = 'challenge' AND ref LIKE ?`)
    .all(userId, `${weekKey}:%`) as { ref: string }[];
  return new Set(rows.map((r) => r.ref));
}

export type LeaderboardRow = { userId: string; name: string; xp: number; isYou: boolean };

/** Weekly XP among users who opted in (plus the viewer if they opted in). */
export function weeklyLeaderboard(viewerId: string, fromDate: string, limit = 25): LeaderboardRow[] {
  const rows = getDb()
    .prepare(
      `SELECT u.id AS id, u.name AS name, COALESCE(SUM(x.amount), 0) AS xp
       FROM users u
       LEFT JOIN xp_ledger x ON x.user_id = u.id AND x.local_date >= ?
       WHERE json_extract(u.preferences, '$.leaderboardOptIn') = 1
       GROUP BY u.id
       ORDER BY xp DESC, u.created_at ASC
       LIMIT ?`,
    )
    .all(fromDate, limit) as { id: string; name: string; xp: number }[];
  return rows.map((r) => ({ userId: r.id, name: publicName(r.name), xp: r.xp, isYou: r.id === viewerId }));
}

/** "Ada Lovelace" -> "Ada L." — never expose full names publicly. */
export function publicName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
}
