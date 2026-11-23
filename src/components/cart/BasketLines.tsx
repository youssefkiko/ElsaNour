"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/products";
import { productHref } from "@/data/products";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { removeFromCart, setCartQty } from "@/lib/cart";
import { fill, formatPrice } from "@/lib/site";
import { ProductPlaceholder } from "../catalog/ProductPlaceholder";
import { QuantityStepper } from "./QuantityStepper";

export type ResolvedLine = { product: Product; qty: number };

type Props = {
  lines: ResolvedLine[];
  locale: Locale;
  t: Dictionary["basket"];
  /** Category names (dict.collections.items), shown above each product name. */
  categoryNames: Dictionary["collections"]["items"];
  /** Called when a product link is followed (e.g. to close the drawer). */
  onNavigate?: () => void;
};

/** The products in the basket: photo, category, name, price, quantity pill, remove link. */
export function BasketLines({ lines, locale, t, categoryNames, onNavigate }: Props) {
  return (
    <ul className="divide-y divide-gold-400/10">
      {lines.map(({ product, qty }) => {
        const name = product.name[locale];
        const href = productHref(locale, product.slug);
        return (
          <li key={product.slug} className="flex gap-4 py-5">
            <Link
              href={href}
              onClick={onNavigate}
              tabIndex={-1}
              aria-hidden="true"
              className="relative size-22 shrink-0 overflow-hidden rounded-none bg-noir-800 ring-1 ring-gold-400/20"
            >
              {product.images[0] ? (
                <Image src={product.images[0]} alt="" fill sizes="88px" className="object-cover" />
              ) : (
                <ProductPlaceholder category={product.category} label="" className="absolute inset-0 [&_svg]:size-8" />
              )}
            </Link>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium tracking-[0.16em] text-gold-400/90 ltr:uppercase">
                    {categoryNames[product.category]}
                  </p>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    className="mt-0.5 block truncate font-heading text-[17px] font-semibold leading-7 text-ivory transition-colors hover:text-gold-200"
                  >
                    {name}
                  </Link>
                  <p className="text-xs text-muted tabular-nums">
                    {fill(t.unitPrice, { price: formatPrice(product.price, locale) })}
                  </p>
                </div>
                <span className="shrink-0 pt-4 text-[15px] font-semibold tabular-nums text-ivory">
                  {formatPrice(product.price * qty, locale)}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <QuantityStepper
                  value={qty}
                  onChange={(q) => setCartQty(product.slug, q)}
                  label={fill(t.qtyOf, { name })}
                  decreaseLabel={t.decrease}
                  increaseLabel={t.increase}
                />
                <button
                  type="button"
                  onClick={() => removeFromCart(product.slug)}
                  aria-label={fill(t.remove, { name })}
                  className="min-h-10 px-1 text-xs text-muted underline decoration-gold-400/30 underline-offset-4 transition-colors hover:text-ivory hover:decoration-gold-300"
                >
                  {t.removeShort}
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
