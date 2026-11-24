import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/InfoPage";
import { getDictionary } from "@/i18n/dictionaries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getDictionary();
  const t = dict.pages.privacy;
  return pageMetadata({ locale, path: "/privacy", title: `${t.title} | Elsanour`, description: t.description });
}

// Privacy: what is collected, why, cookies (basket, Meta Pixel) and rights (law 09-08).
export default async function PrivacyPage() {
  const { locale, dict } = await getDictionary();
  const t = dict.pages.privacy;

  return (
    <InfoPage title={t.title} intro={t.description}>
      {t.sections.map((s) => (
        <InfoSection key={s.title} title={s.title}>
          <p>{s.text}</p>
        </InfoSection>
      ))}
      <Link href={`/${locale}/contact`} className="gem gem-dark mx-auto mt-2">
        <span className="gem-face">{dict.pages.contact.title}</span>
      </Link>
    </InfoPage>
  );
}
