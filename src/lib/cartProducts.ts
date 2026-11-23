import { getProduct } from "@/data/products";
import type { ResolvedLine } from "@/components/cart/BasketLines";
import type { CartLine } from "./cart";

/** A product can go in the basket / be ordered only if it is active and in stock. */
export const isOrderable = (slug: string) => {
  const p = getProduct(slug);
  return !!p && p.inStock;
};

/** Basket lines with their product data (unknown or out-of-stock products are left out). */
export function resolveCart(lines: CartLine[]): ResolvedLine[] {
  const out: ResolvedLine[] = [];
  for (const l of lines) {
    const product = getProduct(l.slug);
    if (product && product.inStock) out.push({ product, qty: l.qty });
  }
  return out;
}

export const cartSubtotal = (lines: ResolvedLine[]) =>
  Math.round(lines.reduce((sum, l) => sum + l.product.price * l.qty, 0) * 100) / 100;
