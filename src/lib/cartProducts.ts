import type { ResolvedLine } from "@/components/cart/BasketLines";
import type { Product } from "@/data/products";
import type { CartLine } from "./cart";

/**
 * The basket only stores slugs and quantities; the product data comes from the catalog
 * the server passes to the page (visible products only).
 */

/** A product can go in the basket / be ordered only if it is shown and in stock. */
export const isOrderableIn = (catalog: Product[]) => (slug: string) =>
  catalog.some((p) => p.slug === slug && p.inStock);

/** Basket lines with their product data (unknown, hidden or out-of-stock products are left out). */
export function resolveCart(lines: CartLine[], catalog: Product[]): ResolvedLine[] {
  const bySlug = new Map(catalog.map((p) => [p.slug, p]));
  const out: ResolvedLine[] = [];
  for (const l of lines) {
    const product = bySlug.get(l.slug);
    if (product && product.inStock) out.push({ product, qty: l.qty });
  }
  return out;
}

export const cartSubtotal = (lines: ResolvedLine[]) =>
  Math.round(lines.reduce((sum, l) => sum + l.product.price * l.qty, 0) * 100) / 100;
