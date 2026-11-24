import { Collections } from "@/components/home/Collections";
import { Hero } from "@/components/home/Hero";
import { InstagramCta } from "@/components/home/InstagramCta";
import { TrustStrip } from "@/components/home/TrustStrip";
import type { Metadata } from "next";
import { getDictionary } from "@/i18n/dictionaries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getDictionary();
  return pageMetadata({ locale, path: "", title: dict.meta.title, description: dict.meta.description });
}

export default async function HomePage() {
  const { locale, dict } = await getDictionary();

  return (
    <>
      <Hero locale={locale} dict={dict} />
      <Collections locale={locale} dict={dict} />
      <TrustStrip dict={dict} />
      <InstagramCta dict={dict} />
    </>
  );
}
