import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/catalog/ProductCard";
import { categoryIcons } from "@/components/home/Collections";
import { productsInCategory } from "@/data/products";
import { getDictionary } from "@/i18n/dictionaries";
import { categories, categoryHref, isCategory } from "@/lib/categories";
import { fill } from "@/lib/site";

// The 6 known categories are prerendered (instant). An unknown slug renders the 404 page,
// which is allowed to block: no instant-navigation validation for this segment.
export const instant = false;

export async function generateStaticParams() {
  return categories.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { dict } = await getDictionary();
  if (!isCategory(slug)) return {};
  return {
    title: `${dict.collections.items[slug]} | Elsanour`,
    description: dict.catalog.blurb[slug],
  };
}

// Category page: the products of one collection (Phase 2: static placeholder data).
export default async function CategoryPage({ params }: PageProps<"/[lang]/category/[slug]">) {
  const { slug } = await params;
  if (!isCategory(slug)) notFound();
  const { locale, dict } = await getDictionary();
  const Icon = categoryIcons[slug];
  const items = productsInCategory(slug);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
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

      <nav aria-label={dict.category.others} className="mt-16 text-center">
        <h2 className="text-sm font-semibold text-gold-300">{dict.category.others}</h2>
        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {categories
            .filter((c) => c !== slug)
            .map((c) => (
              <li key={c}>
                <Link
                  href={categoryHref(locale, c)}
                  className="inline-flex min-h-11 items-center rounded-full border border-gold-400/20 px-4 text-sm text-ivory/85 transition-colors hover:border-gold-400 hover:text-gold-300"
                >
                  {dict.collections.items[c]}
                </Link>
              </li>
            ))}
        </ul>
      </nav>
    </div>
  );
}
