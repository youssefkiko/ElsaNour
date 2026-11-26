/**
 * "Thank you" coupons (owner request, 2026-11-26), shared by the browser and the server.
 * Every order earns a code like ELS-7KQ3XM: 10% off the products of the next order, once,
 * with the same phone number, for 60 days after the order is delivered.
 * The database (supabase/migrations/0006_coupons.sql) has the final word.
 */

export const COUPON_PERCENT = 10;
export const COUPON_DAYS = 60;

/** Letters and digits that cannot be confused when read aloud or copied (no 0/O, 1/I/L). */
export const COUPON_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const COUPON_RE = /^ELS-[A-HJ-KM-NP-Z2-9]{6}$/;

/** "els 7kq3xm" / "ELS7KQ3XM" -> "ELS-7KQ3XM". */
export function normalizeCoupon(value: string): string {
  const compact = value.toUpperCase().replace(/[\s\-_.]/g, "");
  return compact.startsWith("ELS") ? `ELS-${compact.slice(3)}` : compact;
}

/** Discount in dirhams on the products (not on delivery), rounded to the dirham. */
export const couponDiscount = (subtotal: number, percent: number) => Math.round((subtotal * percent) / 100);

/** Why a code cannot be used (keys of dict.order.coupon.errors). */
export type CouponError = "invalid" | "phone" | "notYet" | "expired" | "used" | "needPhone";
