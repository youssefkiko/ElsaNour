import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Product } from "@/data/products";
import { ProductCard } from "../catalog/ProductCard";
import { SectionTitle } from "./SectionTitle";

type Props = { locale: Locale; dict: Dictionary; products: Product[] };

/**
 * "New arrivals" on the home page, right under the video: real products with their photo,
 * price and "add to basket", so a visitor coming from an ad sees the pieces at once.
 * Hidden when there is no product with a photo yet.
 */
export function NewArrivals({ locale, dict, products }: Props) {
  if (products.length === 0) return null;

  return (
    <section id="new" className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle title={dict.newArrivals.title} subtitle={dict.newArrivals.subtitle} />
        {/* 2 per row on phones, 4 on computers; fewer than 4 pieces stay centered. */}
        <ul className="mt-10 flex flex-wrap justify-center gap-3 sm:gap-6">
          {products.map((product) => (
            <li
              key={product.slug}
              className="cat-card w-[calc(50%-0.375rem)] sm:w-[calc(50%-0.75rem)] md:w-[calc(25%-1.125rem)]"
            >
              <ProductCard locale={locale} dict={dict} product={product} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
