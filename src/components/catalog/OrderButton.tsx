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
 * "Order now" button, a 3D emerald gem. Phase 2: ordering is not open yet, so it shows a
 * short message. Phase 3 will turn it into a link to /[lang]/order/[slug].
 * Out of stock: a sunken gem that cannot be pressed.
 * On phones the button is also repeated in a bar fixed at the bottom of the screen.
 */
export function OrderButton({ label, soonMessage, outOfStockLabel, inStock, priceText }: Props) {
  const [showSoon, setShowSoon] = useState(false);

  const button = (extra = "") => (
    <button
      type="button"
      disabled={!inStock}
      onClick={() => setShowSoon(true)}
      className={`gem ${inStock ? "" : "gem-sunken"} ${extra}`}
    >
      <span className="gem-face text-base">{inStock ? label : outOfStockLabel}</span>
    </button>
  );

  return (
    <>
      {/* In the page (all screens) */}
      <div className="mt-6">
        {button("w-full sm:w-auto sm:min-w-64")}
        <p aria-live="polite" className="mt-3 min-h-6 text-sm leading-6 text-gold-300">
          {showSoon ? soonMessage : ""}
        </p>
      </div>

      {/* Sticky bar at the bottom on phones */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gold-400/20 bg-noir-950/95 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
          <span className="text-lg font-bold text-gold-300">{priceText}</span>
          {button("flex-1")}
        </div>
      </div>
    </>
  );
}
