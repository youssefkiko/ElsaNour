import type { Locale } from "@/i18n/config";
import type { Product } from "@/data/products";
import { SITE_URL } from "./seo";
import { FACEBOOK_URL, INSTAGRAM_URL } from "./site";

/**
 * "Cards" for Google (structured data, schema.org JSON-LD). They let Google show the
 * shop name, logo, product photo, price and "in stock" directly in the search results.
 * Test a page at https://search.google.com/test/rich-results.
 */

type Json = Record<string, unknown>;

const STORE_ID = `${SITE_URL}/#store`;
const abs = (path: string) => new URL(path, SITE_URL).toString();

/** The shop itself and the website (home page only, as Google recommends). */
export function storeJsonLd({ locale, description, phone }: { locale: Locale; description: string; phone: string | null }): Json {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "OnlineStore",
        "@id": STORE_ID,
        name: "Elsanour",
        alternateName: ["Elsanour Accessoires", "إلسانور"],
        url: `${SITE_URL}/${locale}`,
        logo: abs("/brand/elsanour-mark.png"),
        image: abs("/brand/og-default.jpg"),
        description,
        sameAs: [INSTAGRAM_URL, FACEBOOK_URL],
        ...(phone ? { telephone: phone } : {}),
        areaServed: { "@type": "Country", name: "Morocco" },
        currenciesAccepted: "MAD",
        paymentAccepted: "Cash on delivery",
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "Elsanour",
        alternateName: "Elsanour Accessoires",
        url: SITE_URL,
        inLanguage: ["ar", "fr", "en"],
        publisher: { "@id": STORE_ID },
      },
    ],
  };
}

/** "Home > Collection > Product" path, shown by Google instead of the raw address. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}

/** One product with its photos, price in MAD, stock and delivery inside Morocco. */
export function productJsonLd({
  product,
  locale,
  name,
  description,
  categoryName,
  deliveryFee,
  deliveryFreeFrom,
}: {
  product: Product;
  locale: Locale;
  name: string;
  description: string;
  categoryName: string;
  /** Highest delivery fee (cities other than Casablanca), in MAD. */
  deliveryFee: number;
  /** Free delivery from this order total (MAD), or null. */
  deliveryFreeFrom: number | null;
}): Json {
  const url = abs(`/${locale}/product/${product.slug}`);
  const photos = [...product.images, ...product.colors.flatMap((c) => c.images)];
  const images = [...new Set(photos)].slice(0, 10).map(abs);
  const shippingCost = deliveryFreeFrom !== null && product.price >= deliveryFreeFrom ? 0 : deliveryFee;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    ...(images.length ? { image: images } : {}),
    sku: product.slug,
    category: categoryName,
    brand: { "@type": "Brand", name: "Elsanour" },
    url,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "MAD",
      price: product.price,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": STORE_ID },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: shippingCost, currency: "MAD" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "MA" },
        // Owner's promise: delivered in 24 to 72 hours to every Moroccan city.
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" },
        },
      },
    },
  };
}
