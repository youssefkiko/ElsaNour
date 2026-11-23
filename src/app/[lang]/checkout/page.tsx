import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/order/CheckoutForm";
import { getDictionary } from "@/i18n/dictionaries";
import { getDeliverySettings } from "@/lib/settings";
import { placeOrder } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  // A checkout page has nothing to show in Google.
  return { title: `${dict.order.metaTitle} | Elsanour`, robots: { index: false, follow: false } };
}

// Checkout (cash on delivery): the basket summary + the customer's details.
// The basket lives in the visitor's browser, so the form reads it there.
export default async function CheckoutPage() {
  const { locale, dict } = await getDictionary();
  const t = dict.order;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-16 sm:px-6">
      <Link
        href={`/${locale}#collections`}
        className="inline-flex min-h-11 items-center gap-2 text-sm text-gold-300 hover:text-gold-200"
      >
        <span aria-hidden="true" className="rtl:rotate-180">←</span>
        {t.back}
      </Link>

      <header className="mt-2">
        <h1 className="font-heading text-3xl font-bold text-ivory sm:text-4xl">{t.title}</h1>
        <p className="mt-2 text-base leading-7 text-muted">{t.subtitle}</p>
      </header>

      <CheckoutForm
        action={placeOrder.bind(null, locale)}
        locale={locale}
        t={t}
        tb={dict.basket}
        categoryNames={dict.collections.items}
        settings={await getDeliverySettings()}
      />
    </div>
  );
}
