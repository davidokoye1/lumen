"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { destroyCurrentSession, destroyOtherSessions, getActionUser } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { deleteUser, emailExists, getPasswordHash, updatePreferences, updateUser } from "@/lib/dal/users";
import { clearNotifications, markAllRead } from "@/lib/dal/notifications";
import type { Preferences } from "@/lib/preferences";
import { isValidTimeZone } from "@/lib/time";
import {
  fieldErrors,
  passwordChangeSchema,
  preferencesPatchSchema,
  profileSchema,
  type ActionResult,
  type FormState,
} from "@/lib/validation";
import { rateLimit } from "@/lib/auth/rate-limit";

const EXPIRED = "Your session has expired. Please sign in again.";

export async function updateProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  let user;
  try {
    user = await getActionUser();
  } catch {
    return { error: EXPIRED };
  }
  const values = { name: String(formData.get("name") ?? ""), email: String(formData.get("email") ?? "") };
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };
  if (parsed.data.email.toLowerCase() !== user.email && emailExists(parsed.data.email))
    return { fieldErrors: { email: "That email is already in use." }, values };
  updateUser(user.id, { name: parsed.data.name, email: parsed.data.email });
  revalidatePath("/", "layout");
  return { success: "Profile saved", values };
}

export async function updatePreferencesAction(patch: Partial<Preferences>): Promise<ActionResult<Preferences>> {
  let user;
  try {
    user = await getActionUser();
  } catch {
    return { ok: false, error: EXPIRED };
  }
  const parsed = preferencesPatchSchema.safeParse(patch);
  if (!parsed.success) return { ok: false, error: "Some settings were invalid." };
  if (parsed.data.timezone && !isValidTimeZone(parsed.data.timezone)) return { ok: false, error: "Unknown timezone." };
  const next = updatePreferences(user.id, parsed.data);
  revalidatePath("/", "layout");
  return { ok: true, data: next };
}

export async function changePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  let user;
  try {
    user = await getActionUser();
  } catch {
    return { error: EXPIRED };
  }
  if (!rateLimit(`pw:${user.id}`, 6, 15 * 60_000).ok) return { error: "Too many attempts. Try again later." };
  const parsed = passwordChangeSchema.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  const hash = getPasswordHash(user.id);
  if (!hash || !(await verifyPassword(parsed.data.current, hash)))
    return { fieldErrors: { current: "That's not your current password." } };
  updateUser(user.id, { passwordHash: await hashPassword(parsed.data.next) });
  const signedOut = await destroyOtherSessions(user.id);
  return { success: signedOut ? `Password updated. Signed out ${signedOut} other session${signedOut === 1 ? "" : "s"}.` : "Password updated." };
}

export async function signOutOthersAction(): Promise<ActionResult<{ count: number }>> {
  try {
    const user = await getActionUser();
    const count = await destroyOtherSessions(user.id);
    return { ok: true, data: { count } };
  } catch {
    return { ok: false, error: EXPIRED };
  }
}

export async function deleteAccountAction(_prev: FormState, formData: FormData): Promise<FormState> {
  let user;
  try {
    user = await getActionUser();
  } catch {
    return { error: EXPIRED };
  }
  if (!rateLimit(`del:${user.id}`, 5, 15 * 60_000).ok) return { error: "Too many attempts. Try again later." };
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (confirm !== "DELETE") return { fieldErrors: { confirm: "Type DELETE to confirm." } };
  const hash = getPasswordHash(user.id);
  if (!hash || !(await verifyPassword(password, hash))) return { fieldErrors: { password: "Incorrect password." } };
  await destroyCurrentSession();
  deleteUser(user.id);
  redirect("/?deleted=1");
}

const levelSchema = z.enum(["foundations", "fluency", "mastery"]);

export async function setLevelAction(level: string): Promise<ActionResult> {
  try {
    const user = await getActionUser();
    const parsed = levelSchema.safeParse(level);
    if (!parsed.success) return { ok: false, error: "Unknown level." };
    updateUser(user.id, { level: parsed.data });
    revalidatePath("/", "layout");
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: EXPIRED };
  }
}

export async function markNotificationsReadAction(): Promise<ActionResult> {
  try {
    const user = await getActionUser();
    markAllRead(user.id);
    revalidatePath("/", "layout");
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: EXPIRED };
  }
}

export async function clearNotificationsAction(): Promise<ActionResult> {
  try {
    const user = await getActionUser();
    clearNotifications(user.id);
    revalidatePath("/", "layout");
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: EXPIRED };
  }
}
