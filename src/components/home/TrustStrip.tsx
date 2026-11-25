import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { CashIcon, GiftIcon, ShieldIcon, TruckIcon } from "../icons";
import { SectionTitle } from "./SectionTitle";

/**
 * "The Elsanour experience": our 4 promises in the calm style of luxury catalogs
 * (no boxes, thin lines between the columns, a quiet "Learn more" link to the details).
 */
export function TrustStrip({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items = [
    { Icon: CashIcon, href: "/delivery", ...dict.trust.cod },
    { Icon: TruckIcon, href: "/delivery", ...dict.trust.delivery },
    { Icon: GiftIcon, href: "/about", ...dict.trust.gift },
    { Icon: ShieldIcon, href: "/returns", ...dict.trust.warranty },
  ];

  return (
    <section id="why" className="border-t border-gold-400/10 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle title={dict.trust.title} />
        <ul className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-gold-400/15 lg:rtl:divide-x-reverse">
          {items.map(({ Icon, href, title, text }) => (
            <li key={title} className="flex flex-col items-center px-4 text-center lg:px-8">
              <Icon className="size-8 text-gold-300" />
              <h3 className="mt-4 font-heading text-lg font-semibold text-ivory">{title}</h3>
              <p className="mt-2 max-w-64 text-sm leading-7 text-muted">{text}</p>
              <Link href={`/${locale}${href}`} className="shop-link mt-4">
                {dict.trust.more}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
