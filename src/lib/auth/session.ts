import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "node:crypto";
import { getDb } from "@/lib/db";
import { getUserById, type User } from "@/lib/dal/users";

export const SESSION_COOKIE = "lumen_session";
const SESSION_DAYS = 30;
const REFRESH_WHEN_DAYS_LEFT = 15;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("base64url");
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DAYS * 86_400_000);
  const ua = (await headers()).get("user-agent")?.slice(0, 255) ?? null;
  getDb()
    .prepare(
      `INSERT INTO auth_sessions (id, user_id, created_at, expires_at, last_seen_at, user_agent) VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(hashToken(token), userId, now.toISOString(), expires.toISOString(), now.toISOString(), ua);
  await setSessionCookie(token, expires);
}

async function setSessionCookie(token: string, expires: Date) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

type SessionRow = { id: string; user_id: string; expires_at: string };

function lookupSession(token: string): SessionRow | null {
  const row = getDb()
    .prepare(`SELECT id, user_id, expires_at FROM auth_sessions WHERE id = ?`)
    .get(hashToken(token)) as SessionRow | undefined;
  if (!row) return null;
  if (new Date(row.expires_at).getTime() <= Date.now()) {
    getDb().prepare(`DELETE FROM auth_sessions WHERE id = ?`).run(row.id);
    return null;
  }
  return row;
}

/** Current user for this request (memoised per render). */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = lookupSession(token);
  if (!session) return null;
  return getUserById(session.user_id);
});

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** For pages inside the app: also requires onboarding to be finished. */
export async function requireOnboardedUser(): Promise<User> {
  const user = await requireUser();
  if (!user.onboarded) redirect("/onboarding");
  return user;
}

/** Use inside Server Actions: throws instead of redirecting. */
export async function getActionUser(): Promise<User> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) throw new Error("UNAUTHENTICATED");
  const session = lookupSession(token);
  if (!session) throw new Error("UNAUTHENTICATED");
  const user = getUserById(session.user_id);
  if (!user) throw new Error("UNAUTHENTICATED");
  // Sliding expiry: extend active sessions.
  const daysLeft = (new Date(session.expires_at).getTime() - Date.now()) / 86_400_000;
  const now = new Date();
  if (daysLeft < REFRESH_WHEN_DAYS_LEFT) {
    const expires = new Date(now.getTime() + SESSION_DAYS * 86_400_000);
    getDb()
      .prepare(`UPDATE auth_sessions SET expires_at = ?, last_seen_at = ? WHERE id = ?`)
      .run(expires.toISOString(), now.toISOString(), session.id);
    await setSessionCookie(token, expires);
  } else {
    getDb().prepare(`UPDATE auth_sessions SET last_seen_at = ? WHERE id = ?`).run(now.toISOString(), session.id);
  }
  return user;
}

export async function destroyCurrentSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) getDb().prepare(`DELETE FROM auth_sessions WHERE id = ?`).run(hashToken(token));
  jar.delete(SESSION_COOKIE);
}

export async function destroyOtherSessions(userId: string) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const keep = token ? hashToken(token) : "";
  return getDb().prepare(`DELETE FROM auth_sessions WHERE user_id = ? AND id != ?`).run(userId, keep).changes;
}

export function countSessions(userId: string): number {
  const r = getDb()
    .prepare(`SELECT COUNT(*) AS n FROM auth_sessions WHERE user_id = ? AND expires_at > ?`)
    .get(userId, new Date().toISOString()) as { n: number };
  return r.n;
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}
