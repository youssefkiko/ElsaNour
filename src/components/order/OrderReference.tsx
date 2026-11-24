"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { clearCart } from "@/lib/cart";
import { track } from "@/lib/pixel";

type Props = { label: string; keepText: string; duplicateText: string };

/**
 * The order number from ?ref=1001 (and a note when the same order was sent twice).
 * The order is saved, so the basket is emptied.
 */
export function OrderReference({ label, keepText, duplicateText }: Props) {
  const params = useSearchParams();
  const ref = params.get("ref");
  const valid = !!ref && /^\d{1,10}$/.test(ref);

  useEffect(() => {
    if (!valid) return;
    clearCart();
    // Meta Pixel "Purchase", once per order (not again on refresh, not for a duplicate).
    const total = Number(params.get("t"));
    if (params.get("dup") === "1" || !Number.isFinite(total) || total <= 0) return;
    const key = `els_px_purchase_${ref}`;
    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      // storage blocked: send it anyway
    }
    const id = window.setTimeout(() => track("Purchase", { value: total, currency: "MAD" }, `order-${ref}`), 600);
    return () => window.clearTimeout(id);
  }, [valid, ref, params]);

  if (!valid) return null;

  return (
    <div className="mt-8 w-full rounded-2xl border border-gold-400/25 bg-noir-800 px-6 py-5">
      <p className="text-sm text-muted">{label}</p>
      <p dir="ltr" className="mt-1 font-display text-4xl font-bold tracking-wider text-gold-300">
        #{ref}
      </p>
      <p className="mt-3 text-sm leading-6 text-muted">{keepText}</p>
      {params.get("dup") === "1" && (
        <p className="mt-2 text-sm font-semibold leading-6 text-gold-200">{duplicateText}</p>
      )}
    </div>
  );
}
