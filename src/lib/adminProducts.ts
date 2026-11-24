import "server-only";
import type { Product } from "@/data/products";
import { PRODUCT_FIELDS, toProduct, type ProductRow } from "./catalog";
import { supabaseAdmin } from "./supabaseAdmin";

/**
 * Products for the admin pages: ALL of them (hidden ones too), never cached.
 * Only call after requireAdmin().
 */

export const PHOTO_BUCKET = "products";
export const MAX_PHOTOS = 8;

export function db() {
  const client = supabaseAdmin();
  if (!client) throw new Error("Supabase keys are missing");
  return client;
}

export async function listAllProducts(): Promise<Product[]> {
  const { data, error } = await db()
    .from("products")
    .select(PRODUCT_FIELDS)
    .order("category")
    .order("sort_order")
    .order("created_at");
  if (error) throw new Error(`products query failed: ${error.message}`);
  return (data as ProductRow[]).map(toProduct);
}

/** The raw row (with empty French/English names kept empty) for the edit form. */
export async function getProductRow(id: string): Promise<ProductRow | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await db().from("products").select(PRODUCT_FIELDS).eq("id", id).maybeSingle();
  if (error) throw new Error(`product query failed: ${error.message}`);
  return data as ProductRow | null;
}

/** Public address prefix of our photos, e.g. https://xxx.supabase.co/storage/v1/object/public/products/ */
export function photoUrlPrefix(): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${PHOTO_BUCKET}/`;
}

/** "Collier Nour" → "collier-nour"; Arabic-only names get a short random slug. */
export function slugify(...names: (string | null | undefined)[]): string {
  for (const name of names) {
    const s = (name ?? "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
      .replace(/-+$/g, "");
    if (s.length >= 3) return s;
  }
  return `p-${Math.random().toString(36).slice(2, 8)}`;
}

/** A slug that no product uses yet (adds -2, -3, ... when needed). */
export async function uniqueSlug(base: string): Promise<string> {
  const { data, error } = await db().from("products").select("slug").like("slug", `${base}%`);
  if (error) throw new Error(`slug check failed: ${error.message}`);
  const taken = new Set((data ?? []).map((r: { slug: string }) => r.slug));
  if (!taken.has(base)) return base;
  for (let i = 2; i < 1000; i++) if (!taken.has(`${base}-${i}`)) return `${base}-${i}`;
  return `${base}-${Date.now()}`;
}
