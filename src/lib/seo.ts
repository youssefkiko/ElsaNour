import type { Metadata } from "next";
import { locales, type Locale } from "@/i18n/config";

/**
 * Public address of the site, used for links in Google, sitemaps and share previews.
 * Set NEXT_PUBLIC_SITE_URL to the real domain at launch (Phase 8).
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.elsanour.com").replace(/\/$/, "");

const ogLocale: Record<Locale, string> = { ar: "ar_MA", fr: "fr_MA", en: "en_US" };

/** Default share image (1200x630): brand on emerald, made from the logo. */
export const DEFAULT_SHARE_IMAGE = { url: "/brand/og-default.jpg", width: 1200, height: 630, alt: "Elsanour" };

type Options = {
  locale: Locale;
  /** Path after the language, e.g. "" (home), "/delivery", "/product/nour-necklace". */
  path: string;
  title: string;
  description: string;
  /** Share image(s); the default brand image when not given. */
  images?: { url: string; width?: number; height?: number; alt?: string }[];
};

/**
 * Title, description, language versions (hreflang) and share preview (WhatsApp,
 * Instagram, Facebook) for one page.
 */
export function pageMetadata({ locale, path, title, description, images }: Options): Metadata {
  const url = `/${locale}${path}`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: Object.fromEntries([
        ...locales.map((l) => [l, `/${l}${path}`]),
        ["x-default", `/ar${path}`],
      ]),
    },
    openGraph: {
      type: "website",
      siteName: "Elsanour",
      locale: ogLocale[locale],
      url,
      title,
      description,
      images: images?.length ? images : [DEFAULT_SHARE_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: (images?.length ? images : [DEFAULT_SHARE_IMAGE]).map((i) => i.url),
    },
  };
}
