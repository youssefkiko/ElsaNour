import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/** /robots.txt: everything public is open to Google, except the admin and the checkout. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/ar/checkout", "/fr/checkout", "/en/checkout"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
