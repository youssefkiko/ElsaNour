import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { discountPercent, mainImage, productHref, type Product } from "@/data/products";
import { AddToBasketButton } from "../cart/AddToBasketButton";
import { fill } from "@/lib/site";
import { BasketIcon } from "../cart/BasketIcon";
import { Price } from "./Price";
import { ProductPlaceholder } from "./ProductPlaceholder";

type Props = { locale: Locale; dict: Dictionary; product: Product };

/** Product tile: photo + name + price (opens the product page) and an "add to basket" gem. */
export function ProductCard({ locale, dict, product }: Props) {
  const off = discountPercent(product);
  const name = product.name[locale];
  const photo = mainImage(product);
  const hasColors = product.colors.length > 0;

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-gold-400/15 bg-noir-800 transition-colors hover:border-gold-400/40">
      <Link href={productHref(locale, product.slug)} className="group flex flex-1 flex-col">
        {/* data-fly-source: this photo flies into the basket when the product is added. */}
        <div data-fly-source={product.slug} className="relative aspect-[4/5] overflow-hidden">
          {photo ? (
            <Image
              src={photo}
              alt={name}
              fill
              sizes="(min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <ProductPlaceholder
              category={product.category}
              label={dict.product.photoSoon}
              className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
            />
          )}
          {off > 0 && (
            <span className="gem gem-chip absolute top-2 start-2">
              <span dir="ltr" className="gem-face">
                −{off}%
              </span>
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
          <h3 className="font-heading text-base font-bold text-ivory sm:text-lg">{name}</h3>
          {hasColors && <p className="text-xs text-gold-300/90">{fill(dict.basket.colorsCount, { n: product.colors.length })}</p>}
          <div className="mt-auto">
            <Price locale={locale} price={product.price} compareAt={product.compareAt} />
          </div>
        </div>
      </Link>

      <div className="px-3 pb-3 sm:px-4 sm:pb-4">
        {hasColors && product.inStock ? (
          // The color is chosen on the product page.
          <Link href={productHref(locale, product.slug)} className="gem gem-sm w-full">
            <span className="gem-face gap-2">
              <BasketIcon className="size-5" />
              {dict.basket.chooseColor}
            </span>
          </Link>
        ) : (
        <AddToBasketButton
          slug={product.slug}
          price={product.price}
          inStock={product.inStock}
          small
          className="w-full"
          labels={{
            add: dict.basket.addShort,
            added: dict.basket.addedShort,
            max: dict.basket.max,
            full: dict.basket.full,
            outOfStock: dict.product.outOfStock,
          }}
        />
        )}
      </div>
    </div>
  );
}
