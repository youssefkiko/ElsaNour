import type { Locale } from "@/i18n/config";
import { formatPrice } from "@/lib/site";

type Props = {
  locale: Locale;
  price: number;
  compareAt?: number;
  size?: "md" | "lg";
};

/** Price in MAD, with the old price crossed out when there is one. */
export function Price({ locale, price, compareAt, size = "md" }: Props) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-2">
      <span className={`font-bold text-gold-300 ${size === "lg" ? "text-2xl sm:text-3xl" : "text-lg"}`}>
        {formatPrice(price, locale)}
      </span>
      {compareAt && compareAt > price && (
        <s className={`text-muted ${size === "lg" ? "text-base" : "text-sm"}`}>{formatPrice(compareAt, locale)}</s>
      )}
    </p>
  );
}
