"use client";

import { useEffect, useRef, useState } from "react";
import { addToCart, requestFly, type AddResult } from "@/lib/cart";
import { track } from "@/lib/pixel";
import { BasketIcon } from "./BasketIcon";

type Props = {
  slug: string;
  /** Chosen color id (products with colors). */
  color?: string;
  /** For the Meta Pixel "AddToCart" event. */
  price?: number;
  inStock: boolean;
  labels: { add: string; added: string; max: string; full: string; outOfStock: string };
  /** Extra classes on the gem (size, width). */
  className?: string;
  /** Small gem with a short text (product cards). */
  small?: boolean;
};

/**
 * "Add to basket" gem. The product photo (the element marked data-fly-source="<slug>")
 * flies into the golden basket, then the button says "added" for a moment.
 */
export function AddToBasketButton({ slug, color, price, inStock, labels, className = "", small = false }: Props) {
  const [result, setResult] = useState<AddResult | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  if (!inStock) {
    return (
      <button type="button" disabled className={`gem gem-sunken ${small ? "gem-sm" : ""} ${className}`}>
        <span className={`gem-face ${small ? "" : "text-base"}`}>{labels.outOfStock}</span>
      </button>
    );
  }

  const onClick = () => {
    const res = addToCart(slug, color);
    setResult(res);
    if (res === "added") {
      requestFly(findSource(slug));
      track("AddToCart", { content_ids: [slug], content_type: "product", value: price, currency: "MAD" });
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setResult(null), res === "added" ? 1600 : 2600);
  };

  const text = result === "added" ? labels.added : labels.add;

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className={`gem ${small ? "gem-sm" : ""} ${className}`}
      >
        <span className={`gem-face gap-2 ${small ? "" : "text-base"}`}>
          <BasketIcon className={small ? "size-5" : "size-6"} />
          {text}
        </span>
      </button>
      <span role="status" className={result === "max" || result === "full" ? "mt-2 block text-center text-sm text-gold-200" : "sr-only"}>
        {result === "added" ? labels.added : result === "max" ? labels.max : result === "full" ? labels.full : ""}
      </span>
    </>
  );
}

/** The product photo to fly: the first one on screen, else the first one in the page. */
function findSource(slug: string): HTMLElement | null {
  const all = Array.from(document.querySelectorAll<HTMLElement>(`[data-fly-source="${CSS.escape(slug)}"]`));
  const onScreen = all.find((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight;
  });
  return onScreen ?? all[0] ?? null;
}
