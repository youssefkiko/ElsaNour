"use client";

import { useState } from "react";

type Props = {
  label: string;
  soonMessage: string;
  outOfStockLabel: string;
  inStock: boolean;
  /** Price text shown next to the button in the sticky bar on phones. */
  priceText: string;
};

/**
 * "Order now" button. Phase 2: ordering is not open yet, so it shows a short message.
 * Phase 3 will turn it into a link to /[lang]/order/[slug].
 * On phones the button is also repeated in a bar fixed at the bottom of the screen.
 */
export function OrderButton({ label, soonMessage, outOfStockLabel, inStock, priceText }: Props) {
  const [showSoon, setShowSoon] = useState(false);

  const button = (extra = "") => (
    <button
      type="button"
      disabled={!inStock}
      onClick={() => setShowSoon(true)}
      className={`inline-flex min-h-12 items-center justify-center rounded-full px-8 text-base font-bold transition-colors ${
        inStock
          ? "bg-cta text-on-cta shadow-[0_8px_30px_-10px] shadow-cta/60 hover:bg-cta-hover"
          : "cursor-not-allowed bg-noir-700 text-muted"
      } ${extra}`}
    >
      {inStock ? label : outOfStockLabel}
    </button>
  );

  return (
    <>
      {/* In the page (all screens) */}
      <div className="mt-6">
        {button("w-full sm:w-auto")}
        <p aria-live="polite" className="mt-3 min-h-6 text-sm leading-6 text-gold-300">
          {showSoon ? soonMessage : ""}
        </p>
      </div>

      {/* Sticky bar at the bottom on phones */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gold-400/20 bg-noir-950/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
          <span className="text-lg font-bold text-gold-300">{priceText}</span>
          {button("flex-1")}
        </div>
      </div>
    </>
  );
}
