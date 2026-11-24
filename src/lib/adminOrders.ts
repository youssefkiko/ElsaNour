import "server-only";
import { addDays, isDay, shopDayStartUtc, todayInShop } from "./dates";
import { isOrderStatus, type OrderStatus } from "./orderStatus";
import { supabaseAdmin } from "./supabaseAdmin";

/**
 * Orders for the admin pages. Read with the secret key, so ONLY call these after
 * requireAdmin() (every admin page, action and the CSV export do).
 */

export type AdminOrderItem = {
  product_slug: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type AdminOrder = {
  id: string;
  reference: number;
  created_at: string;
  updated_at: string;
  customer_name: string;
  phone: string;
  city: string;
  address: string;
  item_count: number;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  note: string | null;
  internal_note: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  locale: string | null;
  order_items: AdminOrderItem[];
};

const FIELDS =
  "id, reference, created_at, updated_at, customer_name, phone, city, address, item_count, subtotal, delivery_fee, total, status, note, internal_note, utm_source, utm_campaign, locale, order_items(product_slug, product_name, unit_price, quantity, line_total)";

export const PAGE_SIZE = 30;

export type Range = "today" | "7d" | "30d" | "all" | "custom";

export type OrderFilters = {
  status: OrderStatus | "all";
  range: Range;
  from?: string; // YYYY-MM-DD (custom range)
  to?: string;
  q: string;
  page: number;
};

/** Reads the filters from the URL (?status=new&range=7d&q=0612&page=2), safely. */
export function parseFilters(sp: Record<string, string | string[] | undefined>): OrderFilters {
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : sp[k]) ?? "";
  const status = one("status");
  const range = one("range");
  const from = one("from");
  const to = one("to");
  return {
    status: isOrderStatus(status) ? status : "all",
    range: (["today", "7d", "30d", "all", "custom"] as const).includes(range as Range) ? (range as Range) : "all",
    from: isDay(from) ? from : undefined,
    to: isDay(to) ? to : undefined,
    q: one("q").trim().slice(0, 60),
    page: Math.max(1, Math.min(1000, Number.parseInt(one("page"), 10) || 1)),
  };
}

/** UTC bounds [start, end) of the chosen period, in Morocco days. */
function periodBounds(f: OrderFilters): { start?: Date; end?: Date } {
  const today = todayInShop();
  switch (f.range) {
    case "today":
      return { start: shopDayStartUtc(today) };
    case "7d":
      return { start: shopDayStartUtc(addDays(today, -6)) };
    case "30d":
      return { start: shopDayStartUtc(addDays(today, -29)) };
    case "custom":
      return {
        start: f.from ? shopDayStartUtc(f.from) : undefined,
        end: f.to ? shopDayStartUtc(addDays(f.to, 1)) : undefined,
      };
    default:
      return {};
  }
}

function db() {
  const client = supabaseAdmin();
  if (!client) throw new Error("Supabase keys are missing");
  return client;
}

/** One page of orders (newest first) + the total number of matches. */
export async function listOrders(f: OrderFilters, opts: { all?: boolean } = {}) {
  let query = db().from("orders").select(FIELDS, { count: "exact" }).order("created_at", { ascending: false });

  if (f.status !== "all") query = query.eq("status", f.status);
  const { start, end } = periodBounds(f);
  if (start) query = query.gte("created_at", start.toISOString());
  if (end) query = query.lt("created_at", end.toISOString());

  if (f.q) {
    const digits = f.q.replace(/\D/g, "");
    if (digits && digits === f.q.replace(/[\s+#.-]/g, "")) {
      // Order number (#1003) or part of a phone number (0612..., 612...).
      const phonePart = digits.replace(/^(?:212|0)/, "");
      const ors = [`phone.ilike.*${phonePart}*`];
      if (digits.length <= 10) ors.push(`reference.eq.${digits}`);
      query = query.or(ors.join(","));
    } else {
      // Name or city. Characters that have a meaning in the filter syntax are removed.
      const text = f.q.replace(/[,()*%\\]/g, " ").trim();
      if (text) query = query.or(`customer_name.ilike.*${text}*,city.ilike.*${text}*`);
    }
  }

  if (!opts.all) {
    const from = (f.page - 1) * PAGE_SIZE;
    query = query.range(from, from + PAGE_SIZE - 1);
  } else {
    query = query.limit(5000);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(`orders query failed: ${error.message}`);
  return { orders: (data ?? []) as AdminOrder[], count: count ?? 0 };
}

export async function getOrder(reference: number): Promise<AdminOrder | null> {
  const { data, error } = await db().from("orders").select(FIELDS).eq("reference", reference).maybeSingle();
  if (error) throw new Error(`order query failed: ${error.message}`);
  return data as AdminOrder | null;
}

/** Number of orders still waiting for the shop to call ("new"). */
export async function countNewOrders(): Promise<number> {
  const { count, error } = await db().from("orders").select("id", { count: "exact", head: true }).eq("status", "new");
  if (error) throw new Error(`count failed: ${error.message}`);
  return count ?? 0;
}
