import type { Metadata } from "next";
import Link from "next/link";
import { PackBuilder } from "@/components/pack/PackBuilder";
import { getDictionary } from "@/i18n/dictionaries";
import { getCatalog } from "@/lib/catalog";
import { categoryHref } from "@/lib/categories";
import { discountLine, packChoices, PACK_MIN_PIECES } from "@/lib/customPack";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getDictionary();
  return pageMetadata({
    locale,
    path: "/build-your-box",
    title: `${dict.pack.metaTitle} | Elsanour`,
    description: dict.pack.metaDescription,
  });
}

// "Build your own gift box" page: single pieces grouped by kind, chosen one per kind.
export default async function BuildYourBoxPage() {
  const { locale, dict } = await getDictionary();
  const groups = packChoices(await getCatalog()).map((g) => ({ ...g, label: dict.collections.items[g.category] }));
  const ready = groups.length >= PACK_MIN_PIECES;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="flex flex-col items-center text-center">
        <h1 className="font-heading text-3xl font-bold text-ivory sm:text-4xl">{dict.pack.title}</h1>
        <div aria-hidden="true" className="mt-4 flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-gold-400/60" />
          <span className="size-1.5 rotate-45 bg-gold-400" />
          <span className="h-px w-10 bg-gold-400/60" />
        </div>
        <p className="mt-4 max-w-xl text-base leading-8 text-muted">{dict.pack.subtitle}</p>
        {ready && (
          <p className="mt-3 border border-gold-400/30 px-4 py-1.5 text-sm font-semibold text-gold-300">
            {discountLine(dict.pack.discounts)}
          </p>
        )}
      </header>

      {ready ? (
        <PackBuilder groups={groups} locale={locale} t={dict.pack} basket={{ max: dict.basket.max, full: dict.basket.full }} />
      ) : (
        // Not enough single pieces yet: point to the ready-made sets and boxes.
        <div className="mt-12 flex flex-col items-center gap-6 text-center">
          <p className="max-w-md text-muted">{dict.pack.soon}</p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href={categoryHref(locale, "sets")} className="shop-link">{dict.collections.items.sets}</Link>
            <Link href={categoryHref(locale, "packs")} className="shop-link">{dict.collections.items.packs}</Link>
          </div>
        </div>
      )}
    </div>
  );
}
