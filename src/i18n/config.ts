// Shared i18n settings. Safe to import from server and client code.

export const locales = ["ar", "fr", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ar";

export const localeNames: Record<Locale, string> = {
  ar: "العربية",
  fr: "Français",
  en: "English",
};

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

export const getDirection = (locale: Locale): "rtl" | "ltr" =>
  locale === "ar" ? "rtl" : "ltr";
