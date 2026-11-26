import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CouponGift } from "@/components/order/CouponGift";
import { OrderReference } from "@/components/order/OrderReference";
import { getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return { title: `${dict.order.thanks.metaTitle} | Elsanour`, robots: { index: false, follow: false } };
}

// Shown after a successful order. The reference number comes from the URL (?ref=1001),
// so the page itself stays static and opens instantly.
export default async function ThankYouPage() {
  const { locale, dict } = await getDictionary();
  const t = dict.order.thanks;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-24">
      <span
        aria-hidden="true"
        className="flex size-16 items-center justify-center rounded-full border border-gold-400/50 text-3xl text-gold-300"
      >
        ✓
      </span>
      <h1 className="mt-6 font-heading text-3xl font-bold text-ivory sm:text-4xl">{t.title}</h1>
      <div aria-hidden="true" className="mt-4 flex items-center justify-center gap-3">
        <span className="h-px w-10 bg-gold-400/60" />
        <span className="size-1.5 rotate-45 bg-gold-400" />
        <span className="h-px w-10 bg-gold-400/60" />
      </div>

      <Suspense fallback={<div className="mt-8 h-24" />}>
        <OrderReference label={t.reference} keepText={t.keep} duplicateText={t.duplicate} />
        <CouponGift t={t.coupon} />
      </Suspense>

      <p className="mt-6 text-base leading-8 text-muted">{t.message}</p>

      <Link href={`/${locale}`} className="gem mt-10">
        <span className="gem-face text-base">{t.home}</span>
      </Link>
    </div>
  );
}
