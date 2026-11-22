import { Collections } from "@/components/home/Collections";
import { Hero } from "@/components/home/Hero";
import { InstagramCta } from "@/components/home/InstagramCta";
import { TrustStrip } from "@/components/home/TrustStrip";
import { getDictionary } from "@/i18n/dictionaries";

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
