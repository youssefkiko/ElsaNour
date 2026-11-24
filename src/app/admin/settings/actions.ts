"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type SettingsState = { ok?: boolean; error?: string };

const parseMoney = (v: FormDataEntryValue | null, allowEmpty: boolean): number | null | undefined => {
  const s = String(v ?? "").trim().replace(",", ".");
  if (s === "") return allowEmpty ? null : undefined;
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(s)) return undefined;
  return Number(s);
};

/** Delivery fees + free-delivery threshold (used by the basket, checkout and orders). */
export async function saveDeliverySettings(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  await requireAdmin();
  const casa = parseMoney(formData.get("delivery_fee_casablanca"), false);
  const other = parseMoney(formData.get("delivery_fee_other"), false);
  const free = parseMoney(formData.get("free_delivery_threshold"), true);
  if (casa === undefined || other === undefined || free === undefined) {
    return { error: "اكتب أرقامًا صحيحة بالدرهم (مثلًا 20). خانة التوصيل المجاني يمكن تركها فارغة." };
  }

  const db = supabaseAdmin();
  if (!db) return { error: "إعدادات Supabase ناقصة." };
  const { error } = await db
    .from("settings")
    .update({
      delivery_fee_casablanca: casa,
      delivery_fee_other: other,
      free_delivery_threshold: free,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) {
    console.error("[admin] settings update failed:", error.message);
    return { error: "لم يتم الحفظ، حاول مرة أخرى." };
  }
  updateTag("settings");
  revalidatePath("/admin/settings");
  return { ok: true };
}
