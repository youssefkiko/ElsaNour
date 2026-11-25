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
 * One wide row per collection, one under the other (owner choice): sets, then necklaces,
 * then earrings, bracelets... Each row shows photos of what is in that collection side by
 * side: 2 on phones, 3 on computers (fewer stay centered). Collections with nothing to show
 * are left out until a product is added.
 */
export function Collections({ locale, dict, collections }: Props) {
  if (collections.length === 0) return null;

  return (
    // Always dark: the emerald background photo needs light text on top in both themes.
    <section
      id="collections"
      data-theme="dark"
      className="relative isolate overflow-x-clip bg-noir-900 py-16 text-ivory md:py-24"
    >
      {/* Background photo behind the rows, darkened so the titles and cards stay readable */}
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

        <ul className="mt-10 flex flex-col gap-4 sm:gap-6">
          {collections.map(({ category, covers }) => {
            const Icon = categoryIcons[category];
            return (
              <li key={category} className="cat-card">
                <Link href={categoryHref(locale, category)} className="group block">
                <div className="relative flex aspect-[8/5] overflow-hidden rounded-sm border border-gold-400/25 bg-noir-950/70 backdrop-blur-[2px] sm:aspect-[12/5]">
                  {covers.length > 0 ? (
                    <div className="absolute inset-0 flex justify-center transition-transform duration-700 ease-out group-hover:scale-105">
                      {covers.map((src, k) => (
                        // Each photo takes half the row on phones (first 2 only), a third on computers.
                        <div key={src} className={`relative w-1/2 sm:block sm:w-1/3 ${k >= 2 ? "hidden" : ""}`}>
                          <Image
                            src={src}
                            alt=""
                            fill
                            sizes="(min-width: 1152px) 370px, (min-width: 640px) 33vw, 50vw"
                            className="object-cover object-[50%_35%]"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Pieces without a photo yet: clean placeholder with the collection icon.
                    <div className="absolute inset-0 flex items-center justify-center text-gold-400/70">
                      <Icon className="size-14" />
                    </div>
                  )}

                </div>

                {/* Under the photos, like a luxury catalog: the name, then a quiet "Shop now". */}
                <div className="mt-4 flex flex-col items-center gap-2 text-center sm:mt-5">
                  <h3 className="font-heading text-2xl font-semibold text-ivory sm:text-3xl">
                    {dict.collections.items[category]}
                  </h3>
                  <span className="shop-link">{dict.collections.shopNow}</span>
                </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
