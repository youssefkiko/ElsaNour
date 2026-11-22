import Link from "next/link";
import type { ComponentType } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { categories, categoryHref, type Category } from "@/lib/categories";
import { BraceletIcon, EarringIcon, GiftIcon, NecklaceIcon, RingIcon, WatchIcon } from "../icons";
import { SectionTitle } from "./SectionTitle";

type Props = { locale: Locale; dict: Dictionary };

export const categoryIcons: Record<Category, ComponentType<{ className?: string }>> = {
  necklaces: NecklaceIcon,
  earrings: EarringIcon,
  rings: RingIcon,
  bracelets: BraceletIcon,
  watches: WatchIcon,
  packs: GiftIcon,
};

/*
 * Layout of the 6 tiles, all the same size:
 * - phones: 2 per row (3 rows);
 * - tablets and desktop: 3 per row (2 rows).
 */
export function Collections({ locale, dict }: Props) {
  return (
    <section id="collections" className="overflow-x-clip bg-noir-900 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle title={dict.collections.title} subtitle={dict.collections.subtitle} />

        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
          {categories.map((category) => {
            const Icon = categoryIcons[category];
            return (
              <li key={category} className="cat-card">
                <Link
                  href={categoryHref(locale, category)}
                  className="group relative flex aspect-[3/4] overflow-hidden rounded-sm border border-gold-400/15 bg-noir-800 sm:aspect-[4/5]"
                >
                  {/* Clean placeholder until the category photo is added */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_50%_38%,var(--c-noir-600),var(--c-noir-800)_72%)] text-gold-400/70 transition-transform duration-700 ease-out group-hover:scale-105">
                    <Icon className="size-12 sm:size-14" />
                    <span className="text-sm text-gold-200/60">{dict.collections.photoSoon}</span>
                  </div>

                  {/* Label, like a small white tag at the bottom */}
                  {/* Latin: small caps with letter spacing. Arabic: no letter spacing (it breaks the joined letters). */}
                  <span className="absolute start-3 bottom-4 inline-flex min-h-11 items-center bg-ivory px-4 text-base font-bold text-noir-950 transition-colors group-hover:bg-gold-300 ltr:text-sm ltr:font-semibold ltr:tracking-[0.15em] ltr:uppercase sm:start-5 sm:bottom-6 sm:px-6">
                    {dict.collections.items[category]}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
