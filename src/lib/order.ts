import { z } from "zod";
import { isCasablanca } from "./cities";

/**
 * Order rules shared by the browser (instant feedback) and the server (the real check).
 * Error messages are keys of dict.order.errors, so they show in the visitor's language.
 */

export const MAX_QUANTITY = 5;

export type DeliverySettings = {
  deliveryFeeCasablanca: number;
  deliveryFeeOther: number;
  /** Subtotal from which delivery is free; null = never free. */
  freeDeliveryThreshold: number | null;
};

/** Placeholder fees used until the owner sets the real ones (and if the database is unreachable). */
export const DEFAULT_SETTINGS: DeliverySettings = {
  deliveryFeeCasablanca: 20,
  deliveryFeeOther: 35,
  freeDeliveryThreshold: 300,
};

/**
 * Moroccan mobile number only: 06/07..., +212 6/7..., 00212 6/7...
 * Spaces, dots and dashes are allowed. Returns +2126XXXXXXXX, or null if not valid.
 */
export function normalizeMoroccanPhone(value: string): string | null {
  const compact = value.replace(/[\s.\-()]/g, "");
  const match = compact.match(/^(?:0|\+212|00212)([67]\d{8})$/);
  return match ? `+212${match[1]}` : null;
}

/** Delivery fee and total for a basket subtotal. Always recomputed on the server. */
export function computeTotals(subtotal: number, city: string, settings: DeliverySettings) {
  const free = settings.freeDeliveryThreshold !== null && subtotal >= settings.freeDeliveryThreshold;
  const deliveryFee = free
    ? 0
    : isCasablanca(city)
      ? settings.deliveryFeeCasablanca
      : settings.deliveryFeeOther;
  return { subtotal: round(subtotal), deliveryFee, total: round(subtotal + deliveryFee) };
}

const round = (n: number) => Math.round(n * 100) / 100;

export const orderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "nameRequired")
    .min(2, "nameShort")
    .max(80, "nameLong"),
  phone: z
    .string()
    .trim()
    .min(1, "phoneRequired")
    .refine((v) => normalizeMoroccanPhone(v) !== null, "phoneInvalid")
    .transform((v) => normalizeMoroccanPhone(v) as string),
  city: z.string().trim().min(2, "cityRequired").max(60, "cityRequired"),
  address: z.string().trim().min(1, "addressRequired").min(5, "addressShort").max(250, "addressLong"),
  note: z.string().trim().max(500, "noteLong").optional().default(""),
});

/** Basket sent with the order: up to 10 products, 1 to 5 pieces each. */
export const itemsSchema = z
  .array(
    z.object({
      slug: z.string().min(1).max(80),
      qty: z.number().int().min(1).max(MAX_QUANTITY),
      color: z.string().min(1).max(40).optional(),
    }),
  )
  .min(1, "basketEmpty")
  .max(10, "basketEmpty");

export type OrderInput = z.input<typeof orderSchema>;
export type OrderData = z.output<typeof orderSchema>;
export type OrderField = keyof OrderInput;

/** First error key per field, e.g. { phone: "phoneInvalid" }. */
export function fieldErrors(error: z.ZodError): Partial<Record<OrderField, string>> {
  const out: Partial<Record<OrderField, string>> = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as OrderField | undefined;
    if (field && !out[field]) out[field] = issue.message;
  }
  return out;
}
