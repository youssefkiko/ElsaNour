import { FeaturedPacks } from "@/components/home/FeaturedPacks";
import { Hero } from "@/components/home/Hero";
import { InstagramCta } from "@/components/home/InstagramCta";
import { TrustStrip } from "@/components/home/TrustStrip";
import { getDictionary } from "@/i18n/dictionaries";

export default async function HomePage() {
  const { locale, dict } = await getDictionary();

  return (
    <>
      <Hero locale={locale} dict={dict} />
      <FeaturedPacks locale={locale} dict={dict} />
      <TrustStrip dict={dict} />
      <InstagramCta dict={dict} />
    </>
  );
}
