"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { isAdminEmail } from "@/lib/adminEmail";
import { isOrderStatus } from "@/lib/orderStatus";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { supabaseAuth } from "@/lib/supabaseAuth";

export type LoginState = { error?: string };

/** Admin login (email + password of the one Supabase Auth account). */
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = z
    .object({ email: z.email(), password: z.string().min(1).max(200) })
    .safeParse({ email: String(formData.get("email") ?? "").trim(), password: formData.get("password") ?? "" });
  if (!parsed.success) return { error: "اكتب البريد الإلكتروني وكلمة السر." };

  const supabase = await supabaseAuth();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) {
    // For the server logs (no email, no password): tells a wrong password from a setup problem.
    console.error("[admin] login failed:", error?.status, error?.code ?? error?.message);
    // Same message whatever the reason, so nobody can test which emails exist.
    return { error: "البريد الإلكتروني أو كلمة السر غير صحيحة." };
  }
  if (!isAdminEmail(data.user.email)) {
    await supabase.auth.signOut({ scope: "local" }); // this device only (default "global" logs out every phone and computer)
    return { error: "هذا الحساب ليس حساب الإدارة." };
  }
  redirect("/admin");
}

export async function logout() {
  const supabase = await supabaseAuth();
  await supabase.auth.signOut({ scope: "local" }); // this device only (default "global" logs out every phone and computer)
  redirect("/admin/login");
}

function db() {
  const client = supabaseAdmin();
  if (!client) throw new Error("Supabase keys are missing");
  return client;
}

export type SaveState = { ok?: boolean; error?: string };

/** Changes the status of an order (new → confirmed → shipped → delivered, or returned / cancelled). */
export async function setOrderStatus(reference: number, _prev: SaveState, formData: FormData): Promise<SaveState> {
  await requireAdmin();
  const status = formData.get("status");
  if (!Number.isInteger(reference) || !isOrderStatus(status)) return { error: "حالة غير صالحة." };

  const { error } = await db()
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("reference", reference);
  if (error) {
    console.error("[admin] status update failed:", error.message);
    return { error: "لم يتم الحفظ، حاول مرة أخرى." };
  }
  revalidatePath("/admin", "layout");
  return { ok: true };
}

/** Saves the private note of an order (never shown to the customer). */
export async function saveInternalNote(reference: number, _prev: SaveState, formData: FormData): Promise<SaveState> {
  await requireAdmin();
  const note = String(formData.get("internal_note") ?? "").trim();
  if (!Number.isInteger(reference) || note.length > 2000) return { error: "الملاحظة طويلة جدًا (2000 حرف كحد أقصى)." };

  const { error } = await db()
    .from("orders")
    .update({ internal_note: note || null, updated_at: new Date().toISOString() })
    .eq("reference", reference);
  if (error) {
    console.error("[admin] note update failed:", error.message);
    return { error: "لم يتم الحفظ، حاول مرة أخرى." };
  }
  revalidatePath(`/admin/orders/${reference}`);
  return { ok: true };
}
