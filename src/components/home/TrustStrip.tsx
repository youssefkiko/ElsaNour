import type { Dictionary } from "@/i18n/dictionaries";
import { CashIcon, GiftIcon, TruckIcon } from "../icons";
import { SectionTitle } from "./FeaturedPacks";

export function TrustStrip({ dict }: { dict: Dictionary }) {
  const items = [
    { Icon: CashIcon, ...dict.trust.cod },
    { Icon: TruckIcon, ...dict.trust.delivery },
    { Icon: GiftIcon, ...dict.trust.gift },
  ];

  return (
    <section id="why" className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle title={dict.trust.title} />
        <ul className="mt-10 grid gap-4 md:grid-cols-3 md:gap-6">
          {items.map(({ Icon, title, text }) => (
            <li
              key={title}
              className="flex items-start gap-4 rounded-2xl border border-gold-400/15 bg-noir-900 p-5 md:flex-col md:items-center md:p-8 md:text-center"
            >
              <span className="flex size-14 shrink-0 items-center justify-center rounded-full border border-gold-400/40 text-gold-300">
                <Icon />
              </span>
              <div>
                <h3 className="text-lg font-bold text-ivory">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
