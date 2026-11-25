import "server-only";
import { getDb } from "@/lib/db";
import { newId } from "@/lib/utils";

export type NotificationKind = "achievement" | "level" | "challenge" | "streak" | "report" | "program";

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href: string | null;
  createdAt: string;
  readAt: string | null;
};

export function createNotification(
  userId: string,
  n: { kind: NotificationKind; title: string; body: string; href?: string; dedupeKey?: string },
) {
  getDb()
    .prepare(
      `INSERT OR IGNORE INTO notifications (id, user_id, kind, title, body, href, dedupe_key, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(newId(), userId, n.kind, n.title, n.body, n.href ?? null, n.dedupeKey ?? null, new Date().toISOString());
}

export function listNotifications(userId: string, limit = 30): AppNotification[] {
  const rows = getDb()
    .prepare(
      `SELECT id, kind, title, body, href, created_at, read_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
    )
    .all(userId, limit) as {
    id: string;
    kind: NotificationKind;
    title: string;
    body: string;
    href: string | null;
    created_at: string;
    read_at: string | null;
  }[];
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    title: r.title,
    body: r.body,
    href: r.href,
    createdAt: r.created_at,
    readAt: r.read_at,
  }));
}

export function unreadCount(userId: string): number {
  const r = getDb()
    .prepare(`SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND read_at IS NULL`)
    .get(userId) as { n: number };
  return r.n;
}

export function markAllRead(userId: string) {
  getDb()
    .prepare(`UPDATE notifications SET read_at = ? WHERE user_id = ? AND read_at IS NULL`)
    .run(new Date().toISOString(), userId);
}

export function clearNotifications(userId: string) {
  getDb().prepare(`DELETE FROM notifications WHERE user_id = ?`).run(userId);
}
