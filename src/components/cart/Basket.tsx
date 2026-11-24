"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { FLY_EVENT, pruneCart, useCart, useCartReady, type FlyDetail } from "@/lib/cart";
import type { Product } from "@/data/products";
import { cartSubtotal, isOrderableIn, resolveCart } from "@/lib/cartProducts";
import { fill, formatPrice } from "@/lib/site";
import { CloseIcon } from "../icons";
import { BasketIcon } from "./BasketIcon";
import { BasketLines } from "./BasketLines";
import { FreeDeliveryMeter } from "./FreeDeliveryMeter";
import { TrustRow } from "./TrustRow";

type Props = {
  /** Visible products (from the server), to show names, photos and prices. */
  catalog: Product[];
  locale: Locale;
  t: Dictionary["basket"];
  categoryNames: Dictionary["collections"]["items"];
  /** Basket total from which delivery is free (settings), null = never. */
  freeThreshold: number | null;
};

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The golden basket. It pops out at the bottom of the screen as soon as something is in
 * it; each added product flies into it in an arc and the basket wobbles as it catches it.
 * A tap opens the basket panel (bottom sheet on phones, side panel on computers).
 */
export function Basket({ catalog, locale, t, categoryNames, freeThreshold }: Props) {
  const ready = useCartReady();
  const cart = useCart();
  const lines = resolveCart(cart, catalog);
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = cartSubtotal(lines);
  const pathname = usePathname() ?? "";
  const onCheckout = /\/checkout(\/|$)/.test(pathname);

  const fabRef = useRef<HTMLButtonElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Products that were removed or went out of stock leave the basket.
  useEffect(() => {
    if (ready) pruneCart(isOrderableIn(catalog));
  }, [ready, cart, catalog]);

  // Fly animation, asked for by the "add to basket" buttons.
  useEffect(() => {
    const catchIt = () => {
      if (reducedMotion()) return;
      fabRef.current?.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(1.16, 0.84) translateY(4px)" },
          { transform: "scale(0.94, 1.08) rotate(-7deg)" },
          { transform: "scale(1.04) rotate(4deg)" },
          { transform: "scale(1)" },
        ],
        { duration: 620, easing: "ease-out" },
      );
      badgeRef.current?.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.5)" }, { transform: "scale(1)" }],
        { duration: 420, delay: 80, easing: "ease-out" },
      );
    };

    const onFly = (event: Event) => {
      const { source } = (event as CustomEvent<FlyDetail>).detail;
      // Two frames: let the basket appear first when it was empty.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const target = fabRef.current;
          if (!target) return;
          if (!source || reducedMotion()) return catchIt();

          const from = source.getBoundingClientRect();
          const to = target.getBoundingClientRect();
          const size = Math.max(48, Math.min(from.width, from.height, 170));
          const startX = from.left + from.width / 2;
          const startY = from.top + from.height / 2;
          const dx = to.left + to.width / 2 - startX;
          const dy = to.top + to.height / 2 - startY;
          const lift = Math.min(170, Math.abs(dy) * 0.35 + 70);

          const ghost = source.cloneNode(true) as HTMLElement;
          ghost.removeAttribute("id");
          ghost.setAttribute("aria-hidden", "true");
          Object.assign(ghost.style, {
            position: "fixed",
            left: `${startX - size / 2}px`,
            top: `${startY - size / 2}px`,
            width: `${size}px`,
            height: `${size}px`,
            margin: "0",
            zIndex: "70",
            pointerEvents: "none",
            overflow: "hidden",
            borderRadius: "18px",
            border: "1px solid rgba(236, 201, 122, 0.6)",
            boxShadow: "0 18px 40px rgba(0, 0, 0, 0.45)",
          });
          document.body.appendChild(ghost);
          ghost.scrollLeft = source.scrollLeft;

          const flight = ghost.animate(
            [
              { transform: "translate(0, 0) scale(1) rotate(0deg)", borderRadius: "18px", opacity: 1 },
              {
                transform: `translate(${dx * 0.45}px, ${dy * 0.45 - lift}px) scale(0.6) rotate(-10deg)`,
                borderRadius: "40%",
                opacity: 1,
                offset: 0.45,
              },
              {
                transform: `translate(${dx}px, ${dy - 6}px) scale(0.16) rotate(8deg)`,
                borderRadius: "50%",
                opacity: 0.85,
              },
            ],
            { duration: 820, easing: "cubic-bezier(0.45, 0.05, 0.55, 0.95)", fill: "forwards" },
          );
          flight.onfinish = () => {
            ghost.remove();
            catchIt();
          };
          flight.oncancel = () => ghost.remove();
        }),
      );
    };

    window.addEventListener(FLY_EVENT, onFly);
    return () => window.removeEventListener(FLY_EVENT, onFly);
  }, []);

  const open = () => {
    dialogRef.current?.showModal();
    setIsOpen(true);
  };
  const close = () => dialogRef.current?.close();

  const visible = ready && count > 0 && !onCheckout;
  const freeReached = freeThreshold !== null && subtotal >= freeThreshold;

  return (
    <>
      {visible && (
        <button
          ref={fabRef}
          type="button"
          onClick={open}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-label={fill(t.open, { n: count })}
          className="basket-fab basket-pop-in fixed end-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex size-16 items-center justify-center rounded-full border border-gold-300/60 shadow-xl shadow-black/40 transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-noir-950 focus-visible:outline-none active:scale-95"
          style={{ background: "radial-gradient(circle at 35% 30%, #1f8a68, #0b4a37 60%, #06261c)" }}
        >
          <BasketIcon className="size-10 drop-shadow-[0_2px_2px_rgba(0,0,0,0.35)]" />
          <span
            ref={badgeRef}
            aria-hidden="true"
            className="absolute -top-1 -end-1 flex min-w-6 items-center justify-center rounded-full border-2 border-noir-950 bg-gold-300 px-1.5 text-xs leading-5 font-bold text-[#06140f] tabular-nums"
          >
            {count}
          </span>
        </button>
      )}

      <dialog
        ref={dialogRef}
        aria-labelledby="basket-title"
        onClose={() => setIsOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) close(); // tap outside the panel
        }}
        className="basket-dialog fixed inset-0 m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-black/65"
      >
        <div
          // Focus lands on the panel itself (no stray focus ring on the close button).
          tabIndex={-1}
          autoFocus
          className="basket-panel absolute inset-x-0 bottom-0 flex max-h-[90svh] flex-col rounded-none border-t border-gold-400/20 bg-noir-900 text-ivory shadow-[0_-24px_60px_rgba(0,0,0,0.5)] outline-none md:inset-y-0 md:start-auto md:end-0 md:max-h-none md:w-[27rem] md:rounded-none md:border-t-0 md:border-s"
        >
          {/* Grab handle (phones) */}
          <div aria-hidden="true" className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-ivory/15 md:hidden" />

          <header className="flex items-center justify-between gap-3 px-6 pt-4 pb-4 md:pt-7">
            <div className="flex items-center gap-3">
              <h2 id="basket-title" className="font-heading text-2xl font-bold tracking-tight">
                {t.title}
              </h2>
              {count > 0 && (
                <span className="border border-gold-400/30 px-2.5 py-0.5 text-xs text-gold-300 tabular-nums">
                  {fill(t.countChip, { n: count })}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={close}
              aria-label={t.close}
              className="flex size-10 items-center justify-center border border-ivory/10 text-muted transition-colors hover:border-gold-400/40 hover:text-ivory focus-visible:ring-2 focus-visible:ring-gold-300/60 focus-visible:outline-none"
            >
              <CloseIcon className="size-4" />
            </button>
          </header>
          <div aria-hidden="true" className="mx-6 h-px bg-gradient-to-r from-transparent via-gold-400/30 to-transparent" />

          {lines.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 py-14 text-center">
              <span className="mb-2 flex size-20 items-center justify-center bg-noir-800 ring-1 ring-gold-400/20">
                <BasketIcon className="size-11" />
              </span>
              <p className="font-heading text-xl font-bold">{t.empty}</p>
              <p className="max-w-60 text-sm leading-6 text-muted">{t.emptyHint}</p>
              <Link href={`/${locale}#collections`} onClick={close} className="gem gem-sm mt-4">
                <span className="gem-face">{t.browse}</span>
              </Link>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto overscroll-contain px-6 [scrollbar-color:var(--c-gold-600)_transparent] [scrollbar-width:thin]">
                <BasketLines lines={lines} locale={locale} t={t} categoryNames={categoryNames} onNavigate={close} />
              </div>

              <footer className="border-t border-gold-400/15 bg-noir-950/50 px-6 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                <FreeDeliveryMeter subtotal={subtotal} threshold={freeThreshold} locale={locale} t={t} />

                <dl className="mt-5 space-y-1.5 text-sm">
                  <div className="flex justify-between gap-4 text-muted">
                    <dt>{t.deliveryTitle}</dt>
                    <dd className={freeReached ? "font-semibold text-gold-200" : ""}>
                      {freeReached ? t.free : t.deliveryLater}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="font-semibold">{t.subtotal}</dt>
                    <dd className="font-heading text-2xl font-bold text-gold-200 tabular-nums">
                      {formatPrice(subtotal, locale)}
                    </dd>
                  </div>
                </dl>

                <Link href={`/${locale}/checkout`} onClick={close} className="gem mt-5 w-full">
                  <span className="gem-face text-base">
                    {t.checkout}
                    <span aria-hidden="true" className="rtl:rotate-180">
                      →
                    </span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={close}
                  className="mt-1 min-h-11 w-full text-sm text-gold-300 underline-offset-4 transition-colors hover:text-gold-200 hover:underline"
                >
                  {t.continue}
                </button>

                <div className="mt-3 border-t border-gold-400/10 pt-4">
                  <TrustRow t={t} />
                </div>
              </footer>
            </>
          )}
        </div>
      </dialog>
    </>
  );
}
