import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { getCatalog, shopCollections } from "@/lib/catalog";
import { SITE_URL } from "@/lib/seo";

/** /sitemap.xml: every public page in the 3 languages (products from the database). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getCatalog();
  const paths = [
    "",
    // Only collections that have products (empty ones are hidden in the shop too).
    ...shopCollections(products).map((c) => `/category/${c.category}`),
    ...products.map((p) => `/product/${p.slug}`),
    "/delivery",
    "/returns",
    "/about",
    "/contact",
    "/privacy",
  ];

  return paths.map((path) => ({
    url: `${SITE_URL}/ar${path}`,
    changeFrequency: path.startsWith("/product") || path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/category") ? 0.8 : path.startsWith("/product") ? 0.7 : 0.4,
    alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}${path}`])) },
  }));
}
