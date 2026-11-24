import type { Metadata } from "next";
import { InfoPage, InfoSection } from "@/components/InfoPage";
import { getDictionary } from "@/i18n/dictionaries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getDictionary();
  const t = dict.pages.about;
  return pageMetadata({ locale, path: "/about", title: `${t.title} | Elsanour`, description: t.description });
}

// About the shop.
export default async function AboutPage() {
  const { dict } = await getDictionary();
  const t = dict.pages.about;

  return (
    <InfoPage title={t.title}>
      <InfoSection title="Elsanour">
        <p>{t.p1}</p>
        <p className="mt-3">{t.p2}</p>
        <p className="mt-3">{t.p3}</p>
      </InfoSection>
    </InfoPage>
  );
}
