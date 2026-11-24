import type { Metadata } from "next";
import { CheckIcon, GiftIcon, ShieldIcon } from "@/components/icons";
import { InfoPage, InfoSection } from "@/components/InfoPage";
import { getDictionary } from "@/i18n/dictionaries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getDictionary();
  const t = dict.pages.returns;
  return pageMetadata({ locale, path: "/returns", title: `${t.title} | Elsanour`, description: t.description });
}

// Returns and exchanges: check before paying; after payment only broken / wrong items are exchanged.
export default async function ReturnsPage() {
  const { dict } = await getDictionary();
  const t = dict.pages.returns;

  return (
    <InfoPage title={t.title}>
      <InfoSection title={t.checkTitle} icon={<ShieldIcon className="size-6" />}>
        <p>{t.check}</p>
      </InfoSection>

      <InfoSection title={t.afterTitle} icon={<GiftIcon className="size-6" />}>
        <p>{t.after}</p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {t.cases.map((c) => (
            <li key={c} className="flex items-start gap-2">
              <CheckIcon className="mt-1.5 size-4 shrink-0 text-gold-300" />
              {c}
            </li>
          ))}
        </ul>
      </InfoSection>

      <InfoSection title={t.howTitle}>
        <p>{t.how}</p>
        <p className="mt-2 text-sm text-muted">{t.hygiene}</p>
      </InfoSection>
    </InfoPage>
  );
}
