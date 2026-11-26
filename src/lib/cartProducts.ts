import type { ResolvedLine } from "@/components/cart/BasketLines";
import type { Product } from "@/data/products";
import type { CartLine } from "./cart";
import { isPackSlug, packAsProduct, resolvePack } from "./customPack";

/**
 * The basket only stores slugs, colors and quantities; the product data comes from the
 * catalog the server passes to the page (visible products only).
 */

/** Can this product (in this color) still be ordered? */
export function canOrder(product: Product | undefined, color?: string): boolean {
  if (!product || !product.inStock) return false;
  if (product.colors.length === 0) return !color;
  const c = product.colors.find((x) => x.id === color);
  return !!c && c.inStock;
}

export const isOrderableIn = (catalog: Product[]) => (slug: string, color?: string) =>
  isPackSlug(slug)
    ? !color && resolvePack(slug, catalog) !== null
    : canOrder(
        catalog.find((p) => p.slug === slug),
        color,
      );

/** Basket lines with their product (and color) data; lines that cannot be ordered are left out. */
export function resolveCart(lines: CartLine[], catalog: Product[]): ResolvedLine[] {
  const bySlug = new Map(catalog.map((p) => [p.slug, p]));
  const out: ResolvedLine[] = [];
  for (const l of lines) {
    // "Build your own gift box": shown as one product made of its pieces.
    if (isPackSlug(l.slug)) {
      const quote = resolvePack(l.slug, catalog);
      if (quote && !l.color) out.push({ product: packAsProduct(l.slug, quote), qty: l.qty });
      continue;
    }
    const product = bySlug.get(l.slug);
    if (!canOrder(product, l.color) || !product) continue;
    const color = l.color ? product.colors.find((c) => c.id === l.color) : undefined;
    out.push({ product, qty: l.qty, color });
  }
  return out;
}

export const cartSubtotal = (lines: ResolvedLine[]) =>
  Math.round(lines.reduce((sum, l) => sum + l.product.price * l.qty, 0) * 100) / 100;

/** The basket as sent to the server with the order. */
export const cartPayload = (lines: ResolvedLine[]) =>
  lines.map((l) => (l.color ? { slug: l.product.slug, qty: l.qty, color: l.color.id } : { slug: l.product.slug, qty: l.qty }));
