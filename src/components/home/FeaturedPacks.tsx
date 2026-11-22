import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatPrice } from "@/lib/site";
import { GiftIcon } from "../icons";

type Props = { locale: Locale; dict: Dictionary };

// Placeholder prices (MAD) until the real catalog arrives in Phase 2.
const placeholderPrices: { price: number; compareAt?: number }[] = [
  { price: 249 },
  { price: 279, compareAt: 329 },
  { price: 349 },
  { price: 229 },
];

export function FeaturedPacks({ locale, dict }: Props) {
  return (
    <section id="packs" className="overflow-x-clip bg-noir-900 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle title={dict.packs.title} subtitle={dict.packs.subtitle} />

        <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          {dict.packs.items.map((item, i) => {
            const { price, compareAt } = placeholderPrices[i] ?? placeholderPrices[0];
            return (
              <li key={item.name} className="pack-card">
                <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gold-400/15 bg-noir-800">
                  {/* Clean placeholder until the real photos are added */}
                  <div className="relative flex aspect-[4/5] flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_50%_40%,var(--color-noir-600),var(--color-noir-800)_70%)] text-gold-400/70">
                    <GiftIcon className="size-10 sm:size-12" />
                    <span className="text-xs text-gold-200/60">{dict.packs.photoSoon}</span>
                    {compareAt && (
                      <span dir="ltr" className="absolute top-2 start-2 rounded-full bg-gold-400 px-2 py-0.5 text-xs font-bold text-noir-950">
                        −{Math.round((1 - price / compareAt) * 100)}%
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-3 sm:p-4">
                    <h3 className="text-base font-bold text-ivory sm:text-lg">{item.name}</h3>
                    <p className="mt-1 text-xs leading-5 text-muted sm:text-sm">{item.includes}</p>
                    <p className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-3">
                      <span className="text-lg font-bold text-gold-300">{formatPrice(price, locale)}</span>
                      {compareAt && (
                        <s className="text-sm text-muted">{formatPrice(compareAt, locale)}</s>
                      )}
                    </p>
                    <span className="mt-3 inline-flex min-h-9 items-center justify-center rounded-full border border-gold-400/30 px-3 text-center text-xs text-gold-200/80">
                      {dict.packs.soon}
                    </span>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="reveal-up text-center">
      <h2 className="text-2xl font-bold text-ivory sm:text-3xl">{title}</h2>
      <div aria-hidden="true" className="mt-4 flex items-center justify-center gap-3">
        <span className="h-px w-10 bg-gold-400/60" />
        <span className="size-1.5 rotate-45 bg-gold-400" />
        <span className="h-px w-10 bg-gold-400/60" />
      </div>
      {subtitle && <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted sm:text-base">{subtitle}</p>}
    </div>
  );
}
