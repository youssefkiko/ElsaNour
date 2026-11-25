import { Collections } from "@/components/home/Collections";
import { Hero } from "@/components/home/Hero";
import { InstagramCta } from "@/components/home/InstagramCta";
import { NewArrivals } from "@/components/home/NewArrivals";
import { TrustStrip } from "@/components/home/TrustStrip";
import type { Metadata } from "next";
import { getDictionary } from "@/i18n/dictionaries";
import { getCatalog, shopCollections } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getDictionary();
  return pageMetadata({ locale, path: "", title: dict.meta.title, description: dict.meta.description });
}

export default async function HomePage() {
  const { locale, dict } = await getDictionary();
  const catalog = await getCatalog();

  return (
    <>
      <Hero locale={locale} dict={dict} />
      {/* Order inspired by luxury catalogs: collections first, then the product row. */}
      <Collections locale={locale} dict={dict} collections={shopCollections(catalog)} />
      <NewArrivals locale={locale} dict={dict} catalog={catalog} />
      <TrustStrip locale={locale} dict={dict} />
      <InstagramCta dict={dict} />
    </>
  );
}
