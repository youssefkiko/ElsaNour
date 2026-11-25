import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { categoryHref } from "@/lib/categories";

type Props = { locale: Locale; dict: Dictionary };

/**
 * Two tall photos side by side, like a luxury magazine (owner request, after Tiffany's
 * "Gifts for Her / Heart Shaped Jewelry"): Sets and Gift packs, each with its title and a
 * quiet "Shop now" under it. Photos: public/collections/sets-tall.webp and packs-tall.webp
 * (cut from the owner's photos; replace a file to change it).
 */
export function EditorialPair({ locale, dict }: Props) {
  const tiles = [
    { href: categoryHref(locale, "sets"), src: "/collections/sets-tall.webp", title: dict.collections.items.sets },
    { href: categoryHref(locale, "packs"), src: "/collections/packs-tall.webp", title: dict.collections.giftsTitle },
  ];

  return (
    <section className="py-12 md:py-16">
      <ul className="mx-auto grid max-w-6xl gap-10 px-4 sm:grid-cols-2 sm:gap-6 sm:px-6">
        {tiles.map((tile) => (
          <li key={tile.href} className="reveal-up">
            <Link href={tile.href} className="group flex flex-col items-center gap-3 text-center">
              <span className="relative block aspect-[4/5] w-full overflow-hidden rounded-sm bg-noir-800">
                <Image
                  src={tile.src}
                  alt=""
                  fill
                  sizes="(min-width: 1152px) 540px, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />
              </span>
              <h3 className="mt-3 font-heading text-2xl font-semibold text-ivory sm:text-3xl">{tile.title}</h3>
              <span className="shop-link">{dict.collections.shopNow}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
