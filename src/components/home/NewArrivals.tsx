import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Product } from "@/data/products";
import { collectionItems, HOME_ORDER, rowProducts } from "@/lib/catalog";
import { ProductCard } from "../catalog/ProductCard";
import { ScrollRow, SliderTabs } from "./ProductSlider";
import { SectionTitle } from "./SectionTitle";

type Props = { locale: Locale; dict: Dictionary; catalog: Product[] };

/**
 * "New arrivals" on the home page, in the calm style of luxury catalogs: tabs (All, Sets,
 * Necklaces...) above a row of products that slides sideways. Only real products with a
 * photo; a tab appears only when its collection has some. Hidden when there is nothing.
 */
export function NewArrivals({ locale, dict, catalog }: Props) {
  const all = rowProducts(catalog);
  if (all.length === 0) return null;

  const tabs = [
    { key: "all", label: dict.newArrivals.all, products: all },
    ...HOME_ORDER.map((category) => ({
      key: category,
      label: dict.collections.items[category],
      products: rowProducts(collectionItems(catalog, category)),
    })).filter((tab) => tab.products.length > 0),
  ];

  return (
    <section id="new" className="overflow-x-clip py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle title={dict.newArrivals.title} subtitle={dict.newArrivals.subtitle} />
        <div className="mt-10">
          <SliderTabs tabs={tabs.map(({ key, label }) => ({ key, label }))}>
            {tabs.map((tab) => (
              <ScrollRow key={tab.key}>
                {tab.products.map((product) => (
                  <li key={product.slug} className="w-[46%] shrink-0 snap-start sm:w-[31%] md:w-[calc(25%-1.125rem)]">
                    <ProductCard locale={locale} dict={dict} product={product} variant="minimal" />
                  </li>
                ))}
              </ScrollRow>
            ))}
          </SliderTabs>
        </div>
      </div>
    </section>
  );
}
