import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { isItemKey, type Product } from "@/data/products";
import { isCategory, type Category } from "./categories";
import { supabaseAdmin } from "./supabaseAdmin";

/**
 * The shop's products, read from the database (table `products`).
 * Cached; every change from the admin calls updateTag("products"), so a new or edited
 * product shows on the site right away.
 */

export type ProductRow = {
  id: string;
  slug: string;
  category: string;
  name_ar: string;
  name_fr: string | null;
  name_en: string | null;
  description_ar: string | null;
  description_fr: string | null;
  description_en: string | null;
  price: number;
  compare_at: number | null;
  images: string[] | null;
  includes: string[] | null;
  in_stock: boolean;
  is_active: boolean;
  sort_order: number;
};

export const PRODUCT_FIELDS =
  "id, slug, category, name_ar, name_fr, name_en, description_ar, description_fr, description_en, price, compare_at, images, includes, in_stock, is_active, sort_order";

const orNull = (v: string | null | undefined) => (v && v.trim() ? v.trim() : null);

export function toProduct(r: ProductRow): Product {
  const fr = orNull(r.name_fr) ?? r.name_ar;
  return {
    id: r.id,
    slug: r.slug,
    category: (isCategory(r.category) ? r.category : "packs") as Category,
    name: { ar: r.name_ar, fr, en: orNull(r.name_en) ?? fr },
    description: {
      ar: orNull(r.description_ar),
      fr: orNull(r.description_fr) ?? orNull(r.description_ar),
      en: orNull(r.description_en) ?? orNull(r.description_fr) ?? orNull(r.description_ar),
    },
    price: Number(r.price),
    compareAt: r.compare_at === null ? undefined : Number(r.compare_at),
    images: r.images ?? [],
    includes: (r.includes ?? []).filter(isItemKey),
    inStock: r.in_stock,
    isActive: r.is_active,
    sortOrder: r.sort_order,
  };
}

/** All visible products (hidden ones are left out), by collection then order. */
export async function getCatalog(): Promise<Product[]> {
  "use cache";
  cacheLife("days");
  cacheTag("products");

  const db = supabaseAdmin();
  if (!db) throw new Error("Supabase keys are missing: cannot read the products");
  const { data, error } = await db
    .from("products")
    .select(PRODUCT_FIELDS)
    .eq("is_active", true)
    .order("category")
    .order("sort_order")
    .order("created_at");
  if (error) throw new Error(`products query failed: ${error.message}`);
  return (data as ProductRow[]).map(toProduct);
}

export async function productsInCategory(category: Category): Promise<Product[]> {
  return (await getCatalog()).filter((p) => p.category === category);
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return (await getCatalog()).find((p) => p.slug === slug);
}
