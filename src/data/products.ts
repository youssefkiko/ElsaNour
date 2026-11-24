import type { Locale } from "@/i18n/config";
import type { Category } from "@/lib/categories";

/**
 * Product types and small helpers, shared by the server and the browser.
 * The products themselves live in the database (table `products`, Phase 5): the owner
 * edits them from /admin/products, and the site reads them with src/lib/catalog.ts.
 */

/** What can be inside a gift box (names in the dictionaries: product.items). */
export const ITEM_KEYS = [
  "necklace",
  "pearlNecklace",
  "earrings",
  "pearlEarrings",
  "hoops",
  "ring",
  "bracelet",
  "pearlBracelet",
  "watch",
  "giftBox",
] as const;
export type ItemKey = (typeof ITEM_KEYS)[number];
export const isItemKey = (v: unknown): v is ItemKey => typeof v === "string" && (ITEM_KEYS as readonly string[]).includes(v);

/** One color of a product: its own name, photos and stock (same price for all colors). */
export type ProductColor = {
  /** Short stable id, saved in the basket (e.g. "c1a2b3"). */
  id: string;
  name: Record<Locale, string>;
  /** Photos of this color, first = main. */
  images: string[];
  inStock: boolean;
};

export type Product = {
  id: string;
  slug: string;
  category: Category;
  /** Name per language (French / English fall back to Arabic when not filled in). */
  name: Record<Locale, string>;
  /** Own description per language, or null to show the collection's short text. */
  description: Record<Locale, string | null>;
  /** Price in MAD. */
  price: number;
  /** Old price in MAD, shown crossed out (optional). */
  compareAt?: number;
  /** Photo addresses, first = main photo. Empty = clean placeholder slides. */
  images: string[];
  /** What is inside the gift box. */
  includes: ItemKey[];
  /** Colors the customer chooses from (empty = no color choice). */
  colors: ProductColor[];
  /** False when the product, or all its colors, are sold out. */
  inStock: boolean;
  isActive: boolean;
  /** Order inside its collection. */
  sortOrder: number;
};

export const productHref = (locale: string, slug: string) => `/${locale}/product/${slug}`;

/** Discount in % when there is an old price, e.g. 18 for 189 instead of 229. */
export const discountPercent = (p: Pick<Product, "price" | "compareAt">) =>
  p.compareAt && p.compareAt > p.price ? Math.round((1 - p.price / p.compareAt) * 100) : 0;

/** The color the customer can order by default: the first one in stock. */
export const defaultColor = (p: Pick<Product, "colors">) => p.colors.find((c) => c.inStock) ?? p.colors[0];

/** Main photo of a product (or of a color). */
export const mainImage = (p: Pick<Product, "images" | "colors">, colorId?: string): string | undefined =>
  colorId
    ? // A chosen color without photos falls back to the product photos, never to another color's.
      (p.colors.find((c) => c.id === colorId)?.images[0] ?? p.images[0])
    : (p.images[0] ?? p.colors[0]?.images[0]);
