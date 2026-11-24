import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill, formatPrice } from "@/lib/site";

type Props = { locale: Locale; dict: Dictionary; freeThreshold: number | null };

/**
 * Thin gold ribbon above the header with the shop's promises, sliding slowly
 * ("free delivery from 300 MAD ✦ cash on delivery ✦ gift box"). The amount comes from
 * the admin settings. Still for visitors who prefer reduced motion; pauses on hover.
 */
export function AnnouncementBar({ locale, dict, freeThreshold }: Props) {
  const items = [
    freeThreshold !== null ? fill(dict.basket.freeFrom, { amount: formatPrice(freeThreshold, locale) }) : null,
    dict.trust.cod.title,
    dict.trust.gift.title,
    dict.trust.delivery.title,
  ].filter((x): x is string => !!x);

  // Enough copies to fill a wide screen; the track holds the list twice for a seamless loop.
  const group = [...items, ...items, ...items];

  return (
    <div className="announce relative z-50 overflow-hidden border-b border-gold-500/40 bg-gradient-to-r from-[#0b3d2e] via-[#0f5a43] to-[#0b3d2e] text-[#f6e3b0]">
      <p className="sr-only">{items.join(" · ")}</p>
      <div aria-hidden="true" className="announce-track flex w-max">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center">
            {group.map((text, i) => (
              <li key={`${copy}-${i}`} className="flex h-9 items-center gap-6 px-6 text-[13px] font-semibold whitespace-nowrap">
                <span>{text}</span>
                <span className="text-[10px] text-[#ecc97a]">✦</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
