"use server";

import { revalidatePath } from "next/cache";
import { getActionUser } from "@/lib/auth/session";
import { getPassage } from "@/lib/content";
import { countCustomTexts, createCustomText, deleteCustomText, toggleBookmark } from "@/lib/dal/library";
import { customTextSchema, fieldErrors, type ActionResult, type FormState } from "@/lib/validation";

const MAX_TEXTS = 100;

export async function toggleBookmarkAction(slug: string): Promise<ActionResult<{ saved: boolean }>> {
  try {
    const user = await getActionUser();
    if (typeof slug !== "string" || !getPassage(slug)) return { ok: false, error: "Unknown passage." };
    const saved = toggleBookmark(user.id, slug);
    revalidatePath("/library");
    return { ok: true, data: { saved } };
  } catch {
    return { ok: false, error: "Your session has expired. Please sign in again." };
  }
}

export async function createCustomTextAction(_prev: FormState, formData: FormData): Promise<FormState> {
  let user;
  try {
    user = await getActionUser();
  } catch {
    return { error: "Your session has expired. Please sign in again." };
  }
  const values = { title: String(formData.get("title") ?? ""), body: String(formData.get("body") ?? "") };
  const parsed = customTextSchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };
  if (countCustomTexts(user.id) >= MAX_TEXTS)
    return { error: `You can keep up to ${MAX_TEXTS} texts. Delete one to add more.`, values };
  const t = createCustomText(user.id, parsed.data.title, parsed.data.body);
  revalidatePath("/library");
  return { success: t.id };
}

export async function deleteCustomTextAction(id: string): Promise<ActionResult> {
  try {
    const user = await getActionUser();
    if (typeof id !== "string") return { ok: false, error: "Invalid id." };
    if (!deleteCustomText(user.id, id)) return { ok: false, error: "That text was already deleted." };
    revalidatePath("/library");
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: "Your session has expired. Please sign in again." };
  }
}
