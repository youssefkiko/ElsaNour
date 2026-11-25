import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { isItemKey, mainImage, type ItemKey, type Product, type ProductColor } from "@/data/products";
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
  colors: ColorRow[] | null;
  in_stock: boolean;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
};

export type ColorRow = {
  id: string;
  name_ar: string;
  name_fr?: string | null;
  name_en?: string | null;
  images?: string[] | null;
  in_stock?: boolean;
};

export const PRODUCT_FIELDS =
  "id, slug, category, name_ar, name_fr, name_en, description_ar, description_fr, description_en, price, compare_at, images, includes, colors, in_stock, is_active, sort_order, created_at";

const orNull = (v: string | null | undefined) => (v && v.trim() ? v.trim() : null);

function toColor(c: ColorRow): ProductColor {
  const fr = orNull(c.name_fr) ?? c.name_ar;
  return {
    id: c.id,
    name: { ar: c.name_ar, fr, en: orNull(c.name_en) ?? fr },
    images: c.images ?? [],
    inStock: c.in_stock !== false,
  };
}

export function toProduct(r: ProductRow): Product {
  const fr = orNull(r.name_fr) ?? r.name_ar;
  const colors = (Array.isArray(r.colors) ? r.colors : []).filter((c) => c && c.id && c.name_ar).map(toColor);
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
    colors,
    inStock: r.in_stock && (colors.length === 0 || colors.some((c) => c.inStock)),
    isActive: r.is_active,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
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

/** Which pieces of a set or gift pack make it belong to a collection too. */
const PIECES: Partial<Record<Category, ItemKey[]>> = {
  necklaces: ["necklace", "pearlNecklace"],
  earrings: ["earrings", "pearlEarrings", "hoops"],
  rings: ["ring"],
  bracelets: ["bracelet", "pearlBracelet"],
  watches: ["watch"],
};

/**
 * What a collection shows: its own products first, then the sets and gift packs that
 * contain that piece (e.g. "Necklaces" also shows every set with a necklace), in stock first.
 */
export function collectionItems(catalog: Product[], category: Category): Product[] {
  const pieces = PIECES[category] ?? [];
  const own = catalog.filter((p) => p.category === category);
  const inSets = pieces.length
    ? catalog.filter(
        (p) => (p.category === "sets" || p.category === "packs") && p.includes.some((i) => pieces.includes(i)),
      )
    : [];
  const byStock = (list: Product[]) => [...list].sort((a, b) => Number(b.inStock) - Number(a.inStock));
  return [...byStock(own), ...byStock(inSets)];
}

/** Order of the collections on the home page, from top to bottom (owner choice). */
export const HOME_ORDER: Category[] = ["sets", "necklaces", "earrings", "bracelets", "rings", "watches", "packs"];

/** A collection shown in the shop: it has at least one piece to show. */
export type ShopCollection = { category: Category; count: number; covers: string[] };

/**
 * Collections that have something to show, in home order, each with up to 3 photos of its
 * pieces. Photos already used by a row above are avoided when possible, so each row looks
 * different. A collection with nothing at all is left out until a product is added.
 */
export function shopCollections(catalog: Product[]): ShopCollection[] {
  const used = new Set<string>();
  return HOME_ORDER.flatMap((category) => {
    const items = collectionItems(catalog, category);
    if (items.length === 0) return [];
    const photos = items.map((p) => mainImage(p)).filter((src): src is string => !!src);
    const fresh = photos.filter((src) => !used.has(src));
    const covers = [...fresh, ...photos.filter((src) => used.has(src))].slice(0, 3);
    covers.forEach((src) => used.add(src));
    return [{ category, count: items.length, covers }];
  });
}

/**
 * Products for the sliding row on the home page: only those with a photo, in stock first,
 * then the newest, at most 12.
 */
export function rowProducts(list: Product[]): Product[] {
  return list
    .filter((p) => mainImage(p))
    .sort(
      (a, b) =>
        Number(b.inStock) - Number(a.inStock) ||
        (b.createdAt ?? "").localeCompare(a.createdAt ?? "") ||
        a.sortOrder - b.sortOrder,
    )
    .slice(0, 12);
}
