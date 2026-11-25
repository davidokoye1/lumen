import "server-only";
import { getDb } from "@/lib/db";
import { newId } from "@/lib/utils";
import { parsePreferences, type Preferences } from "@/lib/preferences";

export type Level = "foundations" | "fluency" | "mastery";

export type User = {
  id: string;
  email: string;
  name: string;
  level: Level;
  onboarded: boolean;
  baselineWpm: number | null;
  baselineComp: number | null;
  preferences: Preferences;
  createdAt: string;
};

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  level: Level;
  onboarded: number;
  baseline_wpm: number | null;
  baseline_comp: number | null;
  preferences: string;
  created_at: string;
};

function toUser(r: UserRow): User {
  let prefs: unknown = {};
  try {
    prefs = JSON.parse(r.preferences);
  } catch {}
  return {
    id: r.id,
    email: r.email,
    name: r.name,
    level: r.level,
    onboarded: !!r.onboarded,
    baselineWpm: r.baseline_wpm,
    baselineComp: r.baseline_comp,
    preferences: parsePreferences(prefs),
    createdAt: r.created_at,
  };
}

export function getUserById(id: string): User | null {
  const r = getDb().prepare(`SELECT * FROM users WHERE id = ?`).get(id) as UserRow | undefined;
  return r ? toUser(r) : null;
}

export function getUserAuthByEmail(email: string): (User & { passwordHash: string }) | null {
  const r = getDb().prepare(`SELECT * FROM users WHERE email = ?`).get(email.toLowerCase()) as UserRow | undefined;
  return r ? { ...toUser(r), passwordHash: r.password_hash } : null;
}

export function getPasswordHash(userId: string): string | null {
  const r = getDb().prepare(`SELECT password_hash FROM users WHERE id = ?`).get(userId) as
    | { password_hash: string }
    | undefined;
  return r?.password_hash ?? null;
}

export function emailExists(email: string): boolean {
  return !!getDb().prepare(`SELECT 1 FROM users WHERE email = ?`).get(email.toLowerCase());
}

export function createUser(input: { email: string; name: string; passwordHash: string; timezone: string }): User {
  const id = newId();
  const now = new Date().toISOString();
  const prefs = parsePreferences({ timezone: input.timezone });
  getDb()
    .prepare(
      `INSERT INTO users (id, email, password_hash, name, preferences, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(id, input.email.toLowerCase(), input.passwordHash, input.name, JSON.stringify(prefs), now, now);
  return getUserById(id)!;
}

export function updateUser(
  id: string,
  patch: Partial<{
    name: string;
    email: string;
    level: Level;
    onboarded: boolean;
    baselineWpm: number | null;
    baselineComp: number | null;
    passwordHash: string;
  }>,
) {
  const map: Record<string, string> = {
    name: "name",
    email: "email",
    level: "level",
    onboarded: "onboarded",
    baselineWpm: "baseline_wpm",
    baselineComp: "baseline_comp",
    passwordHash: "password_hash",
  };
  const sets: string[] = [];
  const values: unknown[] = [];
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) continue;
    sets.push(`${map[k]} = ?`);
    values.push(typeof v === "boolean" ? (v ? 1 : 0) : k === "email" ? String(v).toLowerCase() : v);
  }
  if (!sets.length) return;
  sets.push("updated_at = ?");
  values.push(new Date().toISOString(), id);
  getDb().prepare(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`).run(...values);
}

export function updatePreferences(id: string, patch: Partial<Preferences>): Preferences {
  const user = getUserById(id);
  if (!user) throw new Error("User not found");
  const next = parsePreferences({ ...user.preferences, ...patch });
  getDb()
    .prepare(`UPDATE users SET preferences = ?, updated_at = ? WHERE id = ?`)
    .run(JSON.stringify(next), new Date().toISOString(), id);
  return next;
}

export function deleteUser(id: string) {
  getDb().prepare(`DELETE FROM users WHERE id = ?`).run(id);
}
