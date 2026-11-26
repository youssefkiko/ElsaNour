import type { ItemKey, Product } from "@/data/products";
import type { Category } from "./categories";

/**
 * "Build your own gift box" (owner request, 2026-11-26): the customer picks single pieces
 * (at most one per kind: watch, necklace, earrings, bracelet, ring) and gets them together
 * in one gift box, cheaper the more pieces she takes.
 *
 * In the basket a box is one line whose slug lists its pieces, e.g.
 * "pack:fine-bracelet+nour-necklace". Prices are always recomputed from the catalog
 * (browser and server), so a changed price or a sold-out piece is never ordered by mistake.
 */

/** Collections the pieces come from, in the order the builder shows them. */
export const PACK_PIECE_CATEGORIES = ["watches", "necklaces", "earrings", "bracelets", "rings"] as const satisfies readonly Category[];
export type PackPieceCategory = (typeof PACK_PIECE_CATEGORIES)[number];

export const PACK_MIN_PIECES = 2;
export const PACK_MAX_PIECES = PACK_PIECE_CATEGORIES.length;

/** Discount (%) by number of pieces. Owner choice: the more pieces, the cheaper. */
export const PACK_DISCOUNTS: { from: number; percent: number }[] = [
  { from: 4, percent: 15 },
  { from: 3, percent: 10 },
];
export const packDiscount = (pieces: number) => PACK_DISCOUNTS.find((d) => pieces >= d.from)?.percent ?? 0;

/** Fills the discount text of the dictionary ({p3}, {p4}), e.g. "3 pieces: 10% off · ...". */
export const discountLine = (template: string) =>
  template.replace("{p3}", String(packDiscount(3))).replace("{p4}", String(packDiscount(4)));

/** Address of the builder page. */
export const packHref = (locale: string) => `/${locale}/build-your-box`;

const PREFIX = "pack:";
export const isPackSlug = (slug: string) => slug.startsWith(PREFIX);

/** Basket slug of a box: its pieces, sorted, so the same box is always the same line. */
export const packSlug = (pieceSlugs: string[]) => PREFIX + [...pieceSlugs].sort().join("+");

/** Piece slugs of a box slug, or null when it is not a box. */
export function packPieces(slug: string): string[] | null {
  if (!isPackSlug(slug)) return null;
  const parts = slug.slice(PREFIX.length).split("+").filter(Boolean);
  return parts.length ? parts : null;
}

const isPieceCategory = (c: Category): c is PackPieceCategory => (PACK_PIECE_CATEGORIES as readonly string[]).includes(c);

/**
 * Can this product go in a box? A single piece, in stock, without a color choice
 * (pieces with colors are ordered from their own page).
 */
export const isPackPiece = (p: Product) => isPieceCategory(p.category) && p.inStock && p.colors.length === 0;

/** The pieces the builder offers, grouped by kind (kinds with nothing to offer are left out). */
export function packChoices(catalog: Product[]) {
  return PACK_PIECE_CATEGORIES.map((category) => ({
    category,
    pieces: catalog.filter((p) => p.category === category && isPackPiece(p)),
  })).filter((g) => g.pieces.length > 0);
}

/** The builder only makes sense with at least two kinds of pieces to combine. */
export const packBuilderAvailable = (catalog: Product[]) => packChoices(catalog).length >= PACK_MIN_PIECES;

export type PackQuote = { pieces: Product[]; subtotal: number; percent: number; price: number };

/** Price of a box: sum of its pieces minus the discount, rounded to the dirham. */
export function quotePack(pieces: Product[]): PackQuote {
  const subtotal = pieces.reduce((sum, p) => sum + p.price, 0);
  const percent = packDiscount(pieces.length);
  return { pieces, subtotal, percent, price: Math.round(subtotal * (1 - percent / 100)) };
}

/** A valid box from its slug (2-5 orderable pieces, one per kind), or null. */
export function resolvePack(slug: string, catalog: Product[]): PackQuote | null {
  const slugs = packPieces(slug);
  if (!slugs || slugs.length < PACK_MIN_PIECES || slugs.length > PACK_MAX_PIECES) return null;
  const pieces: Product[] = [];
  const kinds = new Set<Category>();
  for (const s of slugs) {
    const p = catalog.find((x) => x.slug === s);
    if (!p || !isPackPiece(p) || kinds.has(p.category)) return null;
    kinds.add(p.category);
    pieces.push(p);
  }
  // Same order as the builder (watch, necklace, earrings, ...).
  pieces.sort((a, b) => PACK_PIECE_CATEGORIES.indexOf(a.category as PackPieceCategory) - PACK_PIECE_CATEGORIES.indexOf(b.category as PackPieceCategory));
  return quotePack(pieces);
}

const PACK_NAME = { ar: "باك على ذوقك", fr: "Coffret sur mesure", en: "Your own gift box" };

/** Name saved with the order: "باك على ذوقك: ساعة ... + قلادة ...". */
export const packOrderName = (quote: PackQuote) => `${PACK_NAME.ar}: ${quote.pieces.map((p) => p.name.ar).join(" + ")}`;

/** A box shown like a product in the basket (photo of its first piece, discounted price). */
export function packAsProduct(slug: string, quote: PackQuote): Product {
  const list = (l: "ar" | "fr" | "en") => quote.pieces.map((p) => p.name[l]).join(" + ");
  const includes = [...new Set<ItemKey>([...quote.pieces.flatMap((p) => p.includes), "giftBox"])];
  return {
    id: slug,
    slug,
    category: "packs",
    name: PACK_NAME,
    description: { ar: list("ar"), fr: list("fr"), en: list("en") },
    price: quote.price,
    compareAt: quote.percent > 0 ? quote.subtotal : undefined,
    images: quote.pieces.flatMap((p) => p.images.slice(0, 1)),
    includes,
    colors: [],
    inStock: true,
    isActive: true,
    sortOrder: 0,
  };
}
