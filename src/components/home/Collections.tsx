import Image from "next/image";
import Link from "next/link";
import collectionsBg from "../../../public/brand/collections-bg.jpg";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { categoryHref } from "@/lib/categories";
import type { ShopCollection } from "@/lib/catalog";
import { categoryIcons } from "../categoryIcons";
import { SectionTitle } from "./SectionTitle";

type Props = { locale: Locale; dict: Dictionary; collections: ShopCollection[] };

/*
 * Only the collections that have products (empty ones are hidden), each with the photo
 * of its first product. The layout fits any number of tiles, with no hole:
 * - phones: 2 per row; with an odd number, the last tile is wide;
 * - tablets and desktop: 3 per row; a last row of 1 tile is wide, a last row of 2 shares the row.
 */
export function Collections({ locale, dict, collections }: Props) {
  if (collections.length === 0) return null;
  const n = collections.length;
  const lastRow = n % 3;

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

        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-6 sm:gap-5">
          {collections.map(({ category, covers }, i) => {
            const cover = covers[0];
            const Icon = categoryIcons[category];
            const wideOnPhone = n % 2 === 1 && i === n - 1;
            const inLastRow = i >= n - lastRow;
            // Desktop: a lone last tile takes the whole row, a last pair takes half each.
            const desktop = inLastRow && lastRow === 1 ? "wide" : inLastRow && lastRow === 2 ? "half" : "third";
            return (
              <li
                key={category}
                className={`cat-card ${wideOnPhone ? "col-span-2" : ""} ${
                  desktop === "wide" ? "sm:col-span-6" : desktop === "half" ? "sm:col-span-3" : "sm:col-span-2"
                }`}
              >
                <Link
                  href={categoryHref(locale, category)}
                  className={`group relative flex overflow-hidden rounded-sm border border-gold-400/25 bg-noir-800/35 backdrop-blur-[2px] ${
                    wideOnPhone ? "aspect-[4/3]" : "aspect-[3/4]"
                  } ${desktop === "wide" ? "sm:aspect-[12/5]" : desktop === "half" ? "sm:aspect-[6/5]" : "sm:aspect-[4/5]"}`}
                >
                  {cover ? (
                    // A wide tile shows its photos side by side (2 on phones, 3 on computers),
                    // so portrait photos are not cut in half; a normal tile shows the first one.
                    <div className="absolute inset-0 flex transition-transform duration-700 ease-out group-hover:scale-105">
                      {covers.map((src, k) => {
                        const onPhone = wideOnPhone ? k < 2 : k === 0;
                        const onDesktop = desktop === "wide" ? true : desktop === "half" ? k < 2 : k === 0;
                        if (!onPhone && !onDesktop) return null;
                        return (
                          <div
                            key={src}
                            className={`relative min-w-0 flex-1 ${onPhone ? "" : "hidden"} ${onDesktop ? "sm:block" : "sm:hidden"}`}
                          >
                            <Image
                              src={src}
                              alt=""
                              fill
                              sizes="(min-width: 640px) 33vw, 50vw"
                              className="object-cover object-[50%_35%]"
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    // No photo yet in this collection: clean placeholder with its icon.
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_50%_38%,color-mix(in_oklab,var(--c-noir-600)_45%,transparent),color-mix(in_oklab,var(--c-noir-800)_55%,transparent)_72%)] text-gold-400/70 transition-transform duration-700 ease-out group-hover:scale-105">
                      <Icon className="size-12 sm:size-14" />
                    </div>
                  )}

                  {/* Dark fade at the bottom so the label stays readable on any photo. */}
                  {cover && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-noir-950/85 to-transparent"
                    />
                  )}

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
