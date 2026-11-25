import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { categoryHref, type Category } from "@/lib/categories";
import type { ShopCollection } from "@/lib/catalog";
import { SectionTitle } from "./SectionTitle";

type Props = { locale: Locale; dict: Dictionary; collections: ShopCollection[] };

/**
 * Close-up square photo of one piece per collection, in public/collections/<collection>.webp
 * (cut from the owner's photos). Replace a file to change its photo. A collection without
 * its own file shows the photo of its first piece.
 */
const SQUARE_COVERS: Partial<Record<Category, string>> = {
  sets: "/collections/sets.webp",
  necklaces: "/collections/necklaces.webp",
  earrings: "/collections/earrings.webp",
  bracelets: "/collections/bracelets.webp",
  rings: "/collections/rings.webp",
};

/**
 * Right under the video, in the style of luxury catalogs (owner request, like Tiffany's
 * "The Art of Gifting"): one square photo per collection with its name underlined below.
 * Phones: a row that slides sideways. Computers: all in one line.
 */
export function CollectionStrip({ locale, dict, collections }: Props) {
  if (collections.length === 0) return null;

  return (
    <section id="collections" aria-labelledby="strip-title" className="scroll-mt-20 overflow-x-clip pt-16 pb-4 md:pt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div id="strip-title">
          <SectionTitle title={dict.collections.stripTitle} />
        </div>
        <ul className="-mx-4 mt-10 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:justify-center sm:gap-6 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
          {collections.map(({ category, covers }) => {
            const src = SQUARE_COVERS[category] ?? covers[0];
            return (
              <li key={category} className="w-[38%] shrink-0 snap-start sm:w-auto sm:max-w-44 sm:flex-1">
                <Link href={categoryHref(locale, category)} className="group flex flex-col items-center gap-4 text-center">
                  <span className="relative block aspect-square w-full overflow-hidden rounded-sm bg-noir-800">
                    {src && (
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="(min-width: 640px) 176px, 38vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    )}
                  </span>
                  <span className="shop-link">{dict.collections.items[category]}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
