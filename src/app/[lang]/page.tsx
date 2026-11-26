import { CollectionStrip } from "@/components/home/CollectionStrip";
import { EditorialPair } from "@/components/home/EditorialPair";
import { Hero } from "@/components/home/Hero";
import { InstagramCta } from "@/components/home/InstagramCta";
import { NewArrivals } from "@/components/home/NewArrivals";
import { Reviews } from "@/components/home/Reviews";
import { TrustStrip } from "@/components/home/TrustStrip";
import type { Metadata } from "next";
import { getDictionary } from "@/i18n/dictionaries";
import { getCatalog, shopCollections } from "@/lib/catalog";
import { JsonLd } from "@/components/JsonLd";
import { storeJsonLd } from "@/lib/jsonLd";
import { getStorePhone } from "@/lib/settings";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getDictionary();
  return pageMetadata({ locale, path: "", title: dict.meta.title, description: dict.meta.description });
}

export default async function HomePage() {
  const { locale, dict } = await getDictionary();
  const catalog = await getCatalog();
  const collections = shopCollections(catalog);

  return (
    <>
      {/* Shop name, logo, Instagram / Facebook for Google (home page only). */}
      <JsonLd data={storeJsonLd({ locale, description: dict.meta.description, phone: await getStorePhone() })} />
      <Hero locale={locale} dict={dict} />
      {/* Order like a luxury catalog (owner request): square collection photos, two tall
          photos (sets, gift packs), then the sliding product row. */}
      <CollectionStrip locale={locale} dict={dict} collections={collections} />
      <EditorialPair locale={locale} dict={dict} />
      <NewArrivals locale={locale} dict={dict} catalog={catalog} />
      {/* Real customer reviews, moving by themselves (hidden until there are 3). */}
      <Reviews dict={dict} />
      <TrustStrip locale={locale} dict={dict} />
      <InstagramCta dict={dict} />
    </>
  );
}
