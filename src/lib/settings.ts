import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { DEFAULT_SETTINGS, type DeliverySettings } from "./order";
import { supabaseAdmin } from "./supabaseAdmin";

/**
 * Delivery settings from the `settings` table (row id = 1).
 * Cached for a few minutes; Phase 5 refreshes it right away with revalidateTag("settings")
 * when the owner edits the fees. Falls back to the placeholder fees if the database
 * cannot be read, so the order page never breaks.
 */
export async function getDeliverySettings(): Promise<DeliverySettings> {
  "use cache";
  cacheLife("minutes");
  cacheTag("settings");

  const db = supabaseAdmin();
  if (!db) return DEFAULT_SETTINGS;

  const { data, error } = await db
    .from("settings")
    .select("delivery_fee_casablanca, delivery_fee_other, free_delivery_threshold")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
    console.error("[settings] could not read delivery settings:", error?.message ?? "no row");
    return DEFAULT_SETTINGS;
  }

  return {
    deliveryFeeCasablanca: Number(data.delivery_fee_casablanca),
    deliveryFeeOther: Number(data.delivery_fee_other),
    freeDeliveryThreshold:
      data.free_delivery_threshold === null ? null : Number(data.free_delivery_threshold),
  };
}

/**
 * The shop's WhatsApp number (settings.store_phone, edited in /admin/settings), stored as
 * +2126XXXXXXXX, or null when not filled in yet. Cached like the delivery settings.
 */
export async function getStorePhone(): Promise<string | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("settings");

  const db = supabaseAdmin();
  if (!db) return null;
  const { data, error } = await db.from("settings").select("store_phone").eq("id", 1).maybeSingle();
  if (error) {
    console.error("[settings] could not read the store phone:", error.message);
    return null;
  }
  return data?.store_phone || null;
}
