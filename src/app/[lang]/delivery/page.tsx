import type { Metadata } from "next";
import { CashIcon, GiftIcon, TruckIcon } from "@/components/icons";
import { InfoPage, InfoSection } from "@/components/InfoPage";
import { getDictionary } from "@/i18n/dictionaries";
import { pageMetadata } from "@/lib/seo";
import { getDeliverySettings } from "@/lib/settings";
import { fill, formatPrice } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getDictionary();
  const t = dict.pages.delivery;
  return pageMetadata({ locale, path: "/delivery", title: `${t.title} | Elsanour`, description: t.description });
}

// Delivery and payment: times, fees (from the admin settings) and how an order goes.
export default async function DeliveryPage() {
  const { locale, dict } = await getDictionary();
  const t = dict.pages.delivery;
  const s = await getDeliverySettings();
  const price = (n: number) => formatPrice(n, locale);

  return (
    <InfoPage title={t.title} intro={t.intro}>
      <InfoSection title={t.timesTitle} icon={<TruckIcon className="size-6" />}>
        <ul className="list-inside list-disc marker:text-gold-400">
          <li>{t.casa}</li>
          <li>{t.other}</li>
        </ul>
        <p className="mt-2 text-sm text-muted">{t.timesNote}</p>
      </InfoSection>

      <InfoSection title={t.feesTitle} icon={<CashIcon className="size-6" />}>
        <ul className="list-inside list-disc marker:text-gold-400">
          <li>{fill(t.feeCasa, { fee: price(s.deliveryFeeCasablanca) })}</li>
          <li>{fill(t.feeOther, { fee: price(s.deliveryFeeOther) })}</li>
        </ul>
        {s.freeDeliveryThreshold !== null && (
          <p className="mt-2 font-semibold text-gold-200">{fill(t.feeFree, { amount: price(s.freeDeliveryThreshold) })}</p>
        )}
      </InfoSection>

      <InfoSection title={t.stepsTitle} icon={<GiftIcon className="size-6" />}>
        <ol className="flex flex-col gap-3">
          {t.steps.map((step, i) => (
            <li key={step} className="flex items-start gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center border border-gold-400/50 font-display text-sm text-gold-300">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </InfoSection>
    </InfoPage>
  );
}
