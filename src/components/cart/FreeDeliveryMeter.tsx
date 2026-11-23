import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill, formatPrice } from "@/lib/site";
import { CheckIcon, TruckIcon } from "../icons";

type Props = {
  subtotal: number;
  /** Subtotal from which delivery is free (settings); null = no free delivery. */
  threshold: number | null;
  locale: Locale;
  t: Dictionary["basket"];
};

/** "Only X MAD more for free delivery", with a fine gold line that fills up. */
export function FreeDeliveryMeter({ subtotal, threshold, locale, t }: Props) {
  if (threshold === null || threshold <= 0) return null;
  const reached = subtotal >= threshold;
  const progress = Math.min(1, subtotal / threshold);

  return (
    <div>
      <p aria-live="polite" className="flex items-center gap-2 text-[13px] leading-6">
        {reached ? (
          <>
            <span className="flex size-5 items-center justify-center rounded-full bg-gold-300 text-[#06140f]">
              <CheckIcon className="size-3.5" />
            </span>
            <span className="font-semibold text-gold-200">{t.freeReached}</span>
          </>
        ) : (
          <>
            <TruckIcon className="size-5 text-gold-300" />
            <span className="text-ivory/90">
              {fill(t.freeLeft, { amount: formatPrice(Math.ceil(threshold - subtotal), locale) })}
            </span>
          </>
        )}
      </p>
      <div aria-hidden="true" className="mt-2.5 h-[3px] overflow-hidden bg-ivory/10">
        <div
          className="h-full origin-[inline-start] bg-gradient-to-r from-gold-500 via-gold-300 to-gold-200 transition-[width] duration-700 ease-out rtl:bg-gradient-to-l"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
