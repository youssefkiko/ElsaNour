"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import { COUPON_DAYS, COUPON_PERCENT, COUPON_RE } from "@/lib/coupons";
import { fill } from "@/lib/site";

/**
 * Thank-you page: the coupon this order earned (?c=ELS-XXXXXX), with a copy button.
 * The code only works with the customer's phone number, so showing it is safe.
 */
export function CouponGift({ t }: { t: Dictionary["order"]["thanks"]["coupon"] }) {
  const code = useSearchParams().get("c") ?? "";
  const [copied, setCopied] = useState(false);
  if (!COUPON_RE.test(code)) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the code stays visible to copy by hand.
    }
  };

  return (
    <section aria-labelledby="coupon-gift" className="mt-6 w-full border border-dashed border-gold-400/60 bg-noir-900 px-6 py-5">
      <h2 id="coupon-gift" className="font-heading text-lg font-bold text-ivory">
        <span aria-hidden="true">🎁 </span>
        {t.title}
      </h2>
      <p dir="ltr" className="mt-3 font-display text-3xl font-bold tracking-[0.18em] text-gold-300 select-all">
        {code}
      </p>
      <p className="mt-3 text-sm leading-6 text-muted">{fill(t.text, { p: COUPON_PERCENT, days: COUPON_DAYS })}</p>
      <button type="button" onClick={copy} className="gem gem-sm mt-4">
        <span className="gem-face">{copied ? t.copied : t.copy}</span>
      </button>
      <p className="mt-3 text-xs text-muted">{t.keep}</p>
    </section>
  );
}
