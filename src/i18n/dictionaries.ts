import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "./config";
import type ar from "./dictionaries/ar.json";

export type Dictionary = typeof ar;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  ar: () => import("./dictionaries/ar.json").then((m) => m.default),
  fr: () => import("./dictionaries/fr.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
};

/** Returns the current locale (from the URL) and its dictionary. */
export async function getDictionary(): Promise<{
  locale: Locale;
  dict: Dictionary;
}> {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  return { locale, dict: await dictionaries[locale]() };
}
