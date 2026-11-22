import Link from "next/link";
import type { ComponentType } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { categories, categoryHref, type Category } from "@/lib/categories";
import { BraceletIcon, EarringIcon, GiftIcon, NecklaceIcon, RingIcon } from "../icons";
import { SectionTitle } from "./SectionTitle";

type Props = { locale: Locale; dict: Dictionary };

export const categoryIcons: Record<Category, ComponentType<{ className?: string }>> = {
  necklaces: NecklaceIcon,
  earrings: EarringIcon,
  rings: RingIcon,
  bracelets: BraceletIcon,
  packs: GiftIcon,
};

/*
 * Layout of the 5 tiles:
 * - phones: 2 per row, the last one (packs) takes the full row;
 * - tablets and desktop: 3 per row, all the same size; the second row
 *   (bracelets, packs) is centered under the first one.
 * The grid has 6 columns from 640px: each tile spans 2, the 4th starts at column 2.
 */
const tileSpan = [
  "sm:col-span-2",
  "sm:col-span-2",
  "sm:col-span-2",
  "sm:col-span-2 sm:col-start-2",
  "col-span-2 sm:col-span-2",
];

export function Collections({ locale, dict }: Props) {
  return (
    <section id="collections" className="overflow-x-clip bg-noir-900 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle title={dict.collections.title} subtitle={dict.collections.subtitle} />

        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-6 sm:gap-5">
          {categories.map((category, i) => {
            const Icon = categoryIcons[category];
            const isWide = i === categories.length - 1;
            return (
              <li key={category} className={`cat-card ${tileSpan[i]}`}>
                <Link
                  href={categoryHref(locale, category)}
                  className={`group relative flex overflow-hidden rounded-sm border border-gold-400/15 bg-noir-800 ${
                    isWide ? "aspect-[2/1] sm:aspect-[4/5]" : "aspect-[3/4] sm:aspect-[4/5]"
                  }`}
                >
                  {/* Clean placeholder until the category photo is added */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_50%_38%,var(--color-noir-600),var(--color-noir-800)_72%)] text-gold-400/70 transition-transform duration-700 ease-out group-hover:scale-105">
                    <Icon className="size-12 sm:size-14" />
                    <span className="text-xs text-gold-200/50">{dict.collections.photoSoon}</span>
                  </div>

                  {/* Label, like a small white tag at the bottom */}
                  <span className="absolute start-3 bottom-4 inline-flex min-h-10 items-center bg-ivory px-4 text-xs font-semibold tracking-[0.15em] text-noir-950 uppercase transition-colors group-hover:bg-gold-300 sm:start-5 sm:bottom-6 sm:px-6 sm:text-sm">
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
