import "server-only";
import { getDb } from "@/lib/db";
import { newId } from "@/lib/utils";
import { countWords } from "@/lib/reading/text";

export function listBookmarks(userId: string): Set<string> {
  const rows = getDb().prepare(`SELECT passage_id FROM bookmarks WHERE user_id = ?`).all(userId) as { passage_id: string }[];
  return new Set(rows.map((r) => r.passage_id));
}

export function toggleBookmark(userId: string, passageId: string): boolean {
  const db = getDb();
  const exists = db.prepare(`SELECT 1 FROM bookmarks WHERE user_id = ? AND passage_id = ?`).get(userId, passageId);
  if (exists) {
    db.prepare(`DELETE FROM bookmarks WHERE user_id = ? AND passage_id = ?`).run(userId, passageId);
    return false;
  }
  db.prepare(`INSERT INTO bookmarks (user_id, passage_id, created_at) VALUES (?, ?, ?)`).run(
    userId,
    passageId,
    new Date().toISOString(),
  );
  return true;
}

export type CustomText = { id: string; title: string; body: string; words: number; createdAt: string };

export function listCustomTexts(userId: string): CustomText[] {
  return (
    getDb()
      .prepare(`SELECT id, title, body, words, created_at FROM custom_texts WHERE user_id = ? ORDER BY created_at DESC`)
      .all(userId) as { id: string; title: string; body: string; words: number; created_at: string }[]
  ).map((r) => ({ id: r.id, title: r.title, body: r.body, words: r.words, createdAt: r.created_at }));
}

export function getCustomText(userId: string, id: string): CustomText | null {
  const r = getDb()
    .prepare(`SELECT id, title, body, words, created_at FROM custom_texts WHERE user_id = ? AND id = ?`)
    .get(userId, id) as { id: string; title: string; body: string; words: number; created_at: string } | undefined;
  return r ? { id: r.id, title: r.title, body: r.body, words: r.words, createdAt: r.created_at } : null;
}

export function countCustomTexts(userId: string): number {
  return (getDb().prepare(`SELECT COUNT(*) AS n FROM custom_texts WHERE user_id = ?`).get(userId) as { n: number }).n;
}

export function createCustomText(userId: string, title: string, body: string): CustomText {
  const id = newId();
  const now = new Date().toISOString();
  const words = countWords(body);
  getDb()
    .prepare(`INSERT INTO custom_texts (id, user_id, title, body, words, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(id, userId, title, body, words, now);
  return { id, title, body, words, createdAt: now };
}

export function deleteCustomText(userId: string, id: string): boolean {
  return getDb().prepare(`DELETE FROM custom_texts WHERE user_id = ? AND id = ?`).run(userId, id).changes > 0;
}
