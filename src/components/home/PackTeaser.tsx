import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/products";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { discountLine, packChoices, packHref, PACK_MIN_PIECES } from "@/lib/customPack";

type Props = { locale: Locale; dict: Dictionary; catalog: Product[] };

/**
 * Home section "Build your own gift box" (owner request): one photo per kind of piece in a
 * row, the discount, and a button to the builder. Hidden until there are single pieces of
 * at least two kinds to combine.
 */
export function PackTeaser({ locale, dict, catalog }: Props) {
  const groups = packChoices(catalog);
  if (groups.length < PACK_MIN_PIECES) return null;
  const photos = groups
    .map((g) => g.pieces.find((p) => p.images[0]))
    .filter((p): p is Product => !!p)
    .slice(0, 5);

  return (
    <section aria-labelledby="pack-teaser" className="border-y border-gold-400/15 bg-noir-900 py-14 md:py-20">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 text-center sm:px-6">
        <div className="reveal-up flex flex-col items-center">
          <h2 id="pack-teaser" className="font-heading text-2xl font-bold text-ivory sm:text-3xl">{dict.pack.title}</h2>
          <div aria-hidden="true" className="mt-4 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-gold-400/60" />
            <span className="size-1.5 rotate-45 bg-gold-400" />
            <span className="h-px w-10 bg-gold-400/60" />
          </div>
          <p className="mt-4 max-w-lg text-base leading-8 text-muted">{discountLine(dict.pack.teaser)}</p>
        </div>

        {/* One piece of each kind, joined by "+" like a recipe. */}
        <ul className="reveal-up flex flex-wrap items-center justify-center gap-2 sm:gap-3" aria-hidden="true">
          {photos.map((p, i) => (
            <li key={p.slug} className="flex items-center gap-2 sm:gap-3">
              {i > 0 && <span className="font-heading text-xl text-gold-400">+</span>}
              <span className="relative block size-16 overflow-hidden rounded-full bg-noir-800 ring-1 ring-gold-400/40 sm:size-24">
                <Image src={p.images[0]} alt="" fill sizes="96px" className="object-cover" />
              </span>
            </li>
          ))}
        </ul>

        <Link href={packHref(locale)} className="gem">
          <span className="gem-face text-base">{dict.pack.cta}</span>
        </Link>
      </div>
    </section>
  );
}
