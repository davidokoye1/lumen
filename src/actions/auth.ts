"use server";

import { redirect } from "next/navigation";
import { loginSchema, signupSchema, fieldErrors, type FormState } from "@/lib/validation";
import { burnPasswordCheck, hashPassword, verifyPassword } from "@/lib/auth/password";
import { clientIp, createSession, destroyCurrentSession } from "@/lib/auth/session";
import { rateLimit, resetRateLimit } from "@/lib/auth/rate-limit";
import { createUser, emailExists, getUserAuthByEmail } from "@/lib/dal/users";
import { isValidTimeZone } from "@/lib/time";

function safeNext(raw: FormDataEntryValue | null): string | null {
  const v = typeof raw === "string" ? raw : "";
  return v.startsWith("/") && !v.startsWith("//") && !v.startsWith("/\\") ? v : null;
}

export async function signupAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
  };
  const ip = await clientIp();
  const rl = rateLimit(`signup:${ip}`, 8, 60 * 60_000);
  if (!rl.ok) return { error: "Too many sign-up attempts. Please try again later.", values };

  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    timezone: formData.get("timezone") || undefined,
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };

  const { name, email, password, timezone } = parsed.data;
  if (emailExists(email)) {
    return { fieldErrors: { email: "An account with this email already exists. Try signing in." }, values };
  }
  const user = createUser({
    name,
    email,
    passwordHash: await hashPassword(password),
    timezone: timezone && isValidTimeZone(timezone) ? timezone : "UTC",
  });
  await createSession(user.id);
  redirect("/onboarding");
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = { email: String(formData.get("email") ?? "") };
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };
  const { email, password } = parsed.data;

  const ip = await clientIp();
  const byIp = rateLimit(`login-ip:${ip}`, 30, 15 * 60_000);
  const byEmail = rateLimit(`login:${email.toLowerCase()}`, 8, 15 * 60_000);
  if (!byIp.ok || !byEmail.ok) {
    const mins = Math.ceil(Math.max(byIp.retryAfterMs, byEmail.retryAfterMs) / 60_000);
    return { error: `Too many attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.`, values };
  }

  const user = getUserAuthByEmail(email);
  if (!user) {
    await burnPasswordCheck(password);
    return { error: "That email and password don't match.", values };
  }
  if (!(await verifyPassword(password, user.passwordHash))) {
    return { error: "That email and password don't match.", values };
  }
  resetRateLimit(`login:${email.toLowerCase()}`);
  await createSession(user.id);
  redirect(safeNext(formData.get("next")) ?? (user.onboarded ? "/dashboard" : "/onboarding"));
}

export async function logoutAction() {
  await destroyCurrentSession();
  redirect("/login");
}
