import type { Locale } from "@/i18n/config";

export const INSTAGRAM_URL = "https://www.instagram.com/elsanour.ma/";
export const INSTAGRAM_HANDLE = "@elsanour.ma";

const currencyLabel: Record<Locale, string> = {
  ar: "درهم",
  fr: "DH",
  en: "MAD",
};

/** Formats a MAD price for display, e.g. "249 درهم", "249 DH", "249 MAD". */
export function formatPrice(amount: number, locale: Locale): string {
  const value = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(amount);
  return `${value} ${currencyLabel[locale]}`;
}
