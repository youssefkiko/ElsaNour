"use server";

import { createHash, randomInt } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { getCatalog } from "@/lib/catalog";
import { hasLocale } from "@/i18n/config";
import { canonicalCity } from "@/lib/cities";
import { isPackSlug, packOrderName, resolvePack } from "@/lib/customPack";
import { COUPON_ALPHABET, COUPON_DAYS, COUPON_PERCENT, COUPON_RE, couponDiscount, normalizeCoupon, type CouponError } from "@/lib/coupons";
import { computeTotals, fieldErrors, itemsSchema, MAX_QUANTITY, normalizeMoroccanPhone, orderSchema, type OrderField } from "@/lib/order";
import { sendNewOrderEmail } from "@/lib/orderEmail";
import { getDeliverySettings } from "@/lib/settings";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { UTM_COOKIE, readUtmCookie } from "@/lib/utm";

export type OrderState = {
  /** Key of dict.order.errors for a message above the button. */
  formError?: string;
  /** Key of dict.order.errors per field. */
  fields?: Partial<Record<OrderField, string>>;
  /** Lines that can no longer be ordered, as "slug|color" (the browser removes them). */
  unavailable?: string[];
  /** The coupon code cannot be used (key of dict.order.coupon.errors). */
  couponError?: CouponError;
};

/** Same phone + same basket within this window = the same order (not saved twice). */
const DUPLICATE_WINDOW_MIN = 10;
/** Max orders from one connection in the window. Moroccan mobile networks share IPs, so it stays generous. */
const RATE_LIMIT_MAX = 8;
const RATE_LIMIT_WINDOW_MIN = 10;

/**
 * Saves a cash-on-delivery order with every product of the basket.
 * Everything sent by the browser is checked again here; names, prices and totals come
 * from the server only.
 */
export async function placeOrder(locale: string, _prev: OrderState, formData: FormData): Promise<OrderState> {
  if (!hasLocale(locale)) return { formError: "server" };

  // Bots fill every field, including this hidden one. Pretend it worked, save nothing.
  if (String(formData.get("company") ?? "").trim() !== "") {
    redirect(`/${locale}/checkout/thank-you`);
  }

  // Basket: [{ slug, qty, color? }]; the same product in the same color is merged.
  let rawItems: unknown;
  try {
    rawItems = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    rawItems = [];
  }
  const items = itemsSchema.safeParse(rawItems);
  if (!items.success) return { formError: "basketEmpty" };
  const merged = new Map<string, number>();
  for (const { slug, qty, color } of items.data) {
    const key = `${slug}|${color ?? ""}`;
    merged.set(key, Math.min(MAX_QUANTITY, (merged.get(key) ?? 0) + qty));
  }

  const catalog = await getCatalog();
  const unavailable: string[] = [];
  const lines: {
    product_slug: string;
    product_name: string;
    unit_price: number;
    quantity: number;
    line_total: number;
    color: string | null;
  }[] = [];
  for (const [key, qty] of merged) {
    const [slug, colorId] = key.split("|");
    // "Build your own gift box": priced here from its pieces (discount included).
    if (isPackSlug(slug)) {
      const quote = colorId ? null : resolvePack(slug, catalog);
      if (!quote) {
        unavailable.push(key);
        continue;
      }
      lines.push({
        product_slug: slug,
        product_name: packOrderName(quote),
        unit_price: quote.price,
        quantity: qty,
        line_total: Math.round(quote.price * qty * 100) / 100,
        color: null,
      });
      continue;
    }
    const product = catalog.find((p) => p.slug === slug);
    // A product with colors needs one of its colors, in stock; without colors, none.
    const color = product && colorId ? product.colors.find((c) => c.id === colorId) : undefined;
    const ok =
      !!product &&
      product.inStock &&
      (product.colors.length === 0 ? !colorId : !!color && color.inStock);
    if (!ok || !product) {
      unavailable.push(key);
      continue;
    }
    lines.push({
      product_slug: product.slug,
      product_name: product.name.ar,
      unit_price: product.price,
      quantity: qty,
      line_total: Math.round(product.price * qty * 100) / 100,
      color: color?.name.ar ?? null,
    });
  }
  if (unavailable.length > 0) return { formError: "unavailable", unavailable };

  const parsed = orderSchema.safeParse({
    name: formData.get("name") ?? "",
    phone: formData.get("phone") ?? "",
    city: formData.get("city") ?? "",
    address: formData.get("address") ?? "",
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) return { formError: "form", fields: fieldErrors(parsed.error) };
  const order = parsed.data;

  const db = supabaseAdmin();
  if (!db) {
    console.error("[order] Supabase keys are missing (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY)");
    return { formError: "server" };
  }

  // Coupon code (optional): checked again here, then once more by place_order.
  let coupon: { code: string; percent: number } | null = null;
  const couponRaw = String(formData.get("coupon") ?? "").trim();
  if (couponRaw) {
    const checked = await checkCoupon(normalizeCoupon(couponRaw), order.phone);
    if ("error" in checked) return { couponError: checked.error };
    coupon = checked;
  }

  const itemsKey = lines
    .map((l) => `${l.product_slug}:${l.color ?? ""}:${l.quantity}`)
    .sort()
    .join("|");
  const ipHash = await visitorIpHash();
  const since = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

  // Duplicate: the same customer already sent this same basket a moment ago.
  const duplicate = await db
    .from("orders")
    .select("reference")
    .eq("phone", order.phone)
    .eq("items_key", itemsKey)
    .gte("created_at", since(DUPLICATE_WINDOW_MIN))
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (duplicate.error) {
    console.error("[order] duplicate check failed:", duplicate.error.message);
    return { formError: "server" };
  }
  if (duplicate.data) {
    redirect(`/${locale}/checkout/thank-you?ref=${duplicate.data.reference}&dup=1`);
  }

  // Rate limit per connection.
  if (ipHash) {
    const recent = await db
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", since(RATE_LIMIT_WINDOW_MIN));
    if (recent.error) {
      console.error("[order] rate limit check failed:", recent.error.message);
      return { formError: "server" };
    }
    if ((recent.count ?? 0) >= RATE_LIMIT_MAX) return { formError: "rateLimit" };
  }

  const city = canonicalCity(order.city);
  const subtotal = lines.reduce((sum, l) => sum + l.line_total, 0);
  const settings = await getDeliverySettings();
  // Delivery (and free delivery) is computed on the products before the coupon.
  const totals = computeTotals(subtotal, city, settings);
  const discount = coupon ? couponDiscount(totals.subtotal, coupon.percent) : 0;
  const total = Math.round((totals.total - discount) * 100) / 100;
  // This order earns a coupon for the next one (works once it is delivered).
  const newCoupon = newCouponCode();
  const utm = readUtmCookie((await cookies()).get(UTM_COOKIE)?.value);

  // Order + its products saved together (all or nothing) by the place_order function.
  const saved = await db.rpc("place_order", {
    p_order: {
      customer_name: order.name,
      phone: order.phone,
      city,
      address: order.address,
      item_count: lines.reduce((n, l) => n + l.quantity, 0),
      items_key: itemsKey,
      subtotal: totals.subtotal,
      delivery_fee: totals.deliveryFee,
      total,
      note: order.note,
      utm_source: utm.source,
      utm_campaign: utm.campaign,
      locale,
      ip_hash: ipHash,
      coupon_code: coupon?.code ?? null,
      discount,
      new_coupon: newCoupon,
      new_coupon_percent: COUPON_PERCENT,
    },
    p_items: lines,
  });

  // Two orders tried to use the same code at the same moment: only the first one got it.
  if (saved.error?.message.includes("coupon_invalid")) return { couponError: "used" };
  if (saved.error || typeof saved.data !== "number") {
    console.error("[order] save failed:", saved.error?.message ?? `unexpected result ${JSON.stringify(saved.data)}`);
    return { formError: "server" };
  }

  // Email to the owner, sent after the customer already sees the thank-you page.
  const reference = saved.data;
  after(() =>
    sendNewOrderEmail({
      reference,
      name: order.name,
      phone: order.phone,
      city,
      address: order.address,
      note: order.note,
      lines,
      subtotal: totals.subtotal,
      couponCode: coupon?.code,
      discount,
      deliveryFee: totals.deliveryFee,
      total,
      utmSource: utm.source,
    }),
  );

  redirect(`/${locale}/checkout/thank-you?ref=${reference}&t=${total}&c=${newCoupon}`);
}

/** A new coupon code, e.g. ELS-7KQ3XM (887 million possibilities). */
function newCouponCode(): string {
  let out = "ELS-";
  for (let i = 0; i < 6; i++) out += COUPON_ALPHABET[randomInt(COUPON_ALPHABET.length)];
  return out;
}

/** Can this phone number use this code now? Returns its discount, or why not. */
async function checkCoupon(code: string, phone: string): Promise<{ code: string; percent: number } | { error: CouponError }> {
  if (!COUPON_RE.test(code)) return { error: "invalid" };
  const db = supabaseAdmin();
  if (!db) return { error: "invalid" };
  const { data, error } = await db
    .from("coupons")
    .select("phone, percent, active_from, used_at")
    .eq("code", code)
    .maybeSingle();
  if (error) console.error("[coupon] check failed:", error.message);
  if (error || !data) return { error: "invalid" };
  if (data.phone !== phone) return { error: "phone" };
  if (data.used_at) return { error: "used" };
  if (!data.active_from) return { error: "notYet" };
  if (Date.now() - new Date(data.active_from).getTime() > COUPON_DAYS * 86_400_000) return { error: "expired" };
  return { code, percent: Number(data.percent) };
}

/** "Apply" button of the checkout: shows the discount before the order is sent. */
export async function previewCoupon(rawCode: string, rawPhone: string): Promise<{ code?: string; percent?: number; error?: CouponError }> {
  const phone = normalizeMoroccanPhone(String(rawPhone ?? ""));
  if (!phone) return { error: "needPhone" };
  const checked = await checkCoupon(normalizeCoupon(String(rawCode ?? "").slice(0, 30)), phone);
  return "error" in checked ? { error: checked.error } : checked;
}

/** SHA-256 of the visitor IP: enough for the rate limit, without storing the IP itself. */
async function visitorIpHash(): Promise<string | null> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim();
  if (!ip) return null;
  return createHash("sha256").update(`elsanour:${ip}`).digest("hex");
}
