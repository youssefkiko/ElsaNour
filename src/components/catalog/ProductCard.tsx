import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { discountPercent, productHref, type Product } from "@/data/products";
import { Price } from "./Price";
import { ProductPlaceholder } from "./ProductPlaceholder";

type Props = { locale: Locale; dict: Dictionary; product: Product };

export function ProductCard({ locale, dict, product }: Props) {
  const off = discountPercent(product);
  const name = product.name[locale];

  return (
    <Link
      href={productHref(locale, product.slug)}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gold-400/15 bg-noir-800 transition-colors hover:border-gold-400/40"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
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
        {!product.inStock && (
          <span className="absolute inset-x-0 bottom-3 flex justify-center">
            <span className="gem gem-sm gem-sunken">
              <span className="gem-face text-sm">{dict.product.outOfStock}</span>
            </span>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <h3 className="font-heading text-base font-bold text-ivory sm:text-lg">{name}</h3>
        <div className="mt-auto">
          <Price locale={locale} price={product.price} compareAt={product.compareAt} />
        </div>
      </div>
    </Link>
  );
}
