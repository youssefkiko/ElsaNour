import Image from "next/image";
import Link from "next/link";
import collectionsBg from "../../../public/brand/collections-bg.jpg";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { categories, categoryHref } from "@/lib/categories";
import { categoryIcons } from "../categoryIcons";
import { SectionTitle } from "./SectionTitle";

type Props = { locale: Locale; dict: Dictionary };


/*
 * Layout of the 7 tiles:
 * - phones: 2 per row (3 rows), then the last one (gift packs) as one wide tile;
 * - tablets and desktop: 3 per row (2 rows), then the same wide tile across the row.
 */
export function Collections({ locale, dict }: Props) {
  return (
    // Always dark: the emerald background photo needs light text on top in both themes.
    <section
      id="collections"
      data-theme="dark"
      className="relative isolate overflow-x-clip bg-noir-900 py-16 text-ivory md:py-24"
    >
      {/* Background photo behind the tiles, darkened so the titles and cards stay readable */}
      <Image
        src={collectionsBg}
        alt=""
        fill
        sizes="100vw"
        quality={75}
        className="-z-20 object-cover object-[50%_30%]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,var(--c-noir-950)_0%,color-mix(in_oklab,var(--c-noir-950)_55%,transparent)_18%,color-mix(in_oklab,var(--c-noir-950)_45%,transparent)_50%,color-mix(in_oklab,var(--c-noir-950)_60%,transparent)_82%,var(--c-noir-950)_100%)]"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle title={dict.collections.title} subtitle={dict.collections.subtitle} />

        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
          {categories.map((category, i) => {
            const Icon = categoryIcons[category];
            const wide = i === categories.length - 1 && categories.length % 2 === 1;
            return (
              <li key={category} className={`cat-card ${wide ? "col-span-2 sm:col-span-3" : ""}`}>
                <Link
                  href={categoryHref(locale, category)}
                  className={`group relative flex overflow-hidden rounded-sm border border-gold-400/25 bg-noir-800/35 backdrop-blur-[2px] ${
                    wide ? "aspect-[2/1] sm:aspect-[3/1]" : "aspect-[3/4] sm:aspect-[4/5]"
                  }`}
                >
                  {/* Clean placeholder until the category photo is added */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_50%_38%,color-mix(in_oklab,var(--c-noir-600)_45%,transparent),color-mix(in_oklab,var(--c-noir-800)_55%,transparent)_72%)] text-gold-400/70 transition-transform duration-700 ease-out group-hover:scale-105">
                    <Icon className="size-12 sm:size-14" />
                    <span className="text-sm text-gold-200/60">{dict.collections.photoSoon}</span>
                  </div>

                  {/* Label: a small 3D emerald gem at the bottom of the tile.
                      Latin: spaced capitals. Arabic: no letter spacing (it breaks the joined letters). */}
                  <span className="gem gem-sm absolute start-3 bottom-4 sm:start-5 sm:bottom-6">
                    <span className="gem-face text-base ltr:text-sm ltr:tracking-[0.15em] ltr:uppercase">
                      {dict.collections.items[category]}
                    </span>
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
