import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { ProductCard } from "@/components/catalog/ProductCard";
import { categoryIcons } from "@/components/categoryIcons";
import type { Product } from "@/data/products";
import { getDictionary } from "@/i18n/dictionaries";
import { collectionItems, getCatalog } from "@/lib/catalog";
import { breadcrumbJsonLd } from "@/lib/jsonLd";
import { pageMetadata } from "@/lib/seo";
import { categories, isCategory, type Category } from "@/lib/categories";
import { fill } from "@/lib/site";

// The 6 known categories are prerendered (instant). An unknown slug renders the 404 page,
// which is allowed to block: no instant-navigation validation for this segment.
export const instant = false;

export async function generateStaticParams() {
  return categories.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { locale, dict } = await getDictionary();
  if (!isCategory(slug)) return {};
  return pageMetadata({
    locale,
    path: `/category/${slug}`,
    // Words customers type in Google, e.g. "Parures de bijoux femme au Maroc".
    title: `${dict.meta.collections[slug]} | Elsanour`,
    description: `${dict.catalog.blurb[slug]} ${dict.meta.suffix}`,
  });
}

/**
 * Up to 8 pieces from the other collections that are not already on this page, taking
 * turns between the collections (necklace, earrings, ring, ...), in stock first.
 */
function otherPieces(catalog: Product[], current: Category, shown: Product[]) {
  const onPage = new Set(shown.map((p) => p.slug));
  const lists = categories
    .filter((c) => c !== current)
    .map((c) =>
      catalog
        .filter((p) => p.category === c && !onPage.has(p.slug))
        .sort((a, b) => Number(b.inStock) - Number(a.inStock)),
    );
  const picked: Product[] = [];
  for (let round = 0; picked.length < 8 && lists.some((l) => l[round]); round++) {
    for (const list of lists) if (list[round] && picked.length < 8) picked.push(list[round]);
  }
  return picked;
}

// Category page: the products of one collection (from the database, edited in /admin).
export default async function CategoryPage({ params }: PageProps<"/[lang]/category/[slug]">) {
  const { slug } = await params;
  if (!isCategory(slug)) notFound();
  const { locale, dict } = await getDictionary();
  const Icon = categoryIcons[slug];
  const catalog = await getCatalog();
  // Own products first, then the sets / gift packs that contain this piece.
  const items = collectionItems(catalog, slug);
  const others = otherPieces(catalog, slug, items);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Elsanour", path: `/${locale}` },
          { name: dict.collections.items[slug], path: `/${locale}/category/${slug}` },
        ])}
      />
      <header className="flex flex-col items-center text-center">
        <span className="flex size-16 items-center justify-center rounded-full border border-gold-400/40 text-gold-300">
          <Icon className="size-8" />
        </span>
        <h1 className="mt-5 font-heading text-3xl font-bold text-ivory sm:text-4xl">{dict.collections.items[slug]}</h1>
        <div aria-hidden="true" className="mt-4 flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-gold-400/60" />
          <span className="size-1.5 rotate-45 bg-gold-400" />
          <span className="h-px w-10 bg-gold-400/60" />
        </div>
        <p className="mt-4 max-w-md text-base leading-8 text-muted">{dict.catalog.blurb[slug]}</p>
        <p className="mt-2 text-sm text-gold-300">{fill(dict.catalog.count, { n: items.length })}</p>
      </header>

      {items.length > 0 ? (
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-6">
          {items.map((product) => (
            <li key={product.slug} className="cat-card">
              <ProductCard locale={locale} dict={dict} product={product} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 text-center text-muted">{dict.catalog.empty}</p>
      )}

      {/* Other pieces from the other collections (photos, not category buttons). */}
      {others.length > 0 && (
        <section aria-labelledby="more-pieces" className="mt-16">
          <h2 id="more-pieces" className="text-center font-heading text-2xl font-bold text-ivory">
            {dict.category.morePieces}
          </h2>
          <div aria-hidden="true" className="mt-3 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-gold-400/60" />
            <span className="size-1.5 rotate-45 bg-gold-400" />
            <span className="h-px w-10 bg-gold-400/60" />
          </div>
          {/* Phones: swipe sideways. Computers: 4 per row. */}
          <ul className="relative -mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 md:mx-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
            {others.map((p) => (
              <li key={p.slug} className="w-[46%] shrink-0 snap-start sm:w-[31%] md:w-auto">
                <ProductCard locale={locale} dict={dict} product={p} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
