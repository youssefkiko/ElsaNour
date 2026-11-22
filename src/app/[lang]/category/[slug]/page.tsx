import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryIcons } from "@/components/home/Collections";
import { getDictionary } from "@/i18n/dictionaries";
import { categories, categoryHref, isCategory } from "@/lib/categories";

export async function generateStaticParams() {
  return categories.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { dict } = await getDictionary();
  if (!isCategory(slug)) return {};
  return { title: `${dict.collections.items[slug]} | Elsanour` };
}

// Phase 1: a simple page per category. The products list comes in Phase 2.
export default async function CategoryPage({ params }: PageProps<"/[lang]/category/[slug]">) {
  const { slug } = await params;
  if (!isCategory(slug)) notFound();
  const { locale, dict } = await getDictionary();
  const Icon = categoryIcons[slug];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center px-4 py-16 text-center sm:py-24">
      <span className="flex size-20 items-center justify-center rounded-full border border-gold-400/40 text-gold-300">
        <Icon className="size-10" />
      </span>
      <h1 className="mt-6 text-3xl font-bold text-ivory sm:text-4xl">{dict.collections.items[slug]}</h1>
      <div aria-hidden="true" className="mt-4 flex items-center justify-center gap-3">
        <span className="h-px w-10 bg-gold-400/60" />
        <span className="size-1.5 rotate-45 bg-gold-400" />
        <span className="h-px w-10 bg-gold-400/60" />
      </div>
      <p className="mt-5 max-w-md text-base leading-8 text-muted">{dict.category.soon}</p>

      <Link
        href={`/${locale}#collections`}
        className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full border border-gold-400 px-6 font-semibold text-gold-300 transition-colors hover:bg-gold-400 hover:text-noir-950"
      >
        {dict.category.back}
      </Link>

      <h2 className="mt-16 text-sm font-semibold text-gold-300">{dict.category.others}</h2>
      <ul className="mt-4 flex flex-wrap justify-center gap-2">
        {categories
          .filter((c) => c !== slug)
          .map((c) => (
            <li key={c}>
              <Link
                href={categoryHref(locale, c)}
                className="inline-flex min-h-11 items-center rounded-full border border-white/10 px-4 text-sm text-ivory/85 transition-colors hover:border-gold-400 hover:text-gold-300"
              >
                {dict.collections.items[c]}
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
}
