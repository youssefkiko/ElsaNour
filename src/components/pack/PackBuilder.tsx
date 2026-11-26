"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/data/products";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { addToCart, requestFly, type AddResult } from "@/lib/cart";
import { packDiscount, packSlug, PACK_MIN_PIECES, quotePack, type PackPieceCategory } from "@/lib/customPack";
import { track } from "@/lib/pixel";
import { fill, formatPrice } from "@/lib/site";
import { BasketIcon } from "../cart/BasketIcon";

type Group = { category: PackPieceCategory; label: string; pieces: Product[] };

type Props = {
  groups: Group[];
  locale: Locale;
  t: Dictionary["pack"];
  basket: Pick<Dictionary["basket"], "max" | "full">;
};

/**
 * "Build your own gift box": one row per kind of piece (watch, necklace, ...). Tapping a
 * piece chooses it (one per kind), tapping it again removes it. The summary (side panel on
 * computers, floating card on phones) shows the price with the discount and adds the box
 * to the basket as one line.
 */
export function PackBuilder({ groups, locale, t, basket }: Props) {
  const [chosen, setChosen] = useState<Partial<Record<PackPieceCategory, string>>>({});
  const [result, setResult] = useState<AddResult | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const reviewRef = useRef<HTMLDialogElement>(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const pieces = groups.flatMap((g) => g.pieces.filter((p) => chosen[g.category] === p.slug));
  const quote = quotePack(pieces);
  const count = pieces.length;
  const nextPercent = packDiscount(count + 1);
  const canAddMore = count < groups.length;
  const countText = count === 1 ? t.onePiece : fill(t.pieces, { n: count });

  const toggle = (category: PackPieceCategory, slug: string) => {
    setResult(null);
    setChosen((c) => ({ ...c, [category]: c[category] === slug ? undefined : slug }));
  };

  // Owner request: before anything goes in the basket, the customer sees her box.
  const openReview = () => {
    if (count >= PACK_MIN_PIECES) reviewRef.current?.showModal();
  };

  const add = () => {
    if (count < PACK_MIN_PIECES) return;
    const slug = packSlug(pieces.map((p) => p.slug));
    const res = addToCart(slug);
    setResult(res);
    if (res === "added") {
      // The visible summary's photos fly into the basket.
      const previews = Array.from(document.querySelectorAll<HTMLElement>("[data-pack-preview]"));
      requestFly(previews.find((el) => el.getBoundingClientRect().width > 0) ?? null);
      track("AddToCart", { content_ids: pieces.map((p) => p.slug), content_type: "product", value: quote.price, currency: "MAD" });
      setChosen({});
    }
    reviewRef.current?.close();
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setResult(null), 2600);
  };

  const hint =
    count === 0 ? t.empty : count < PACK_MIN_PIECES ? t.needOne : canAddMore && nextPercent > quote.percent ? fill(t.nextDiscount, { p: nextPercent }) : t.giftBox;

  const summary = (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-xl font-bold text-ivory">{t.summary}</h2>
        {count > 0 && <span className="text-sm text-muted">{countText}</span>}
      </div>

      {/* The chosen pieces as small photos (the first one flies into the basket). */}
      <ul data-pack-preview className="flex min-h-14 flex-wrap gap-2" aria-hidden={count === 0 || undefined}>
        {pieces.map((p) => (
          <li key={p.slug} className="relative size-14 overflow-hidden rounded-sm bg-noir-800 ring-1 ring-gold-400/30">
            {p.images[0] && <Image src={p.images[0]} alt={p.name[locale]} fill sizes="56px" className="object-cover" />}
          </li>
        ))}
        {count === 0 && <li className="size-14 rounded-sm border border-dashed border-gold-400/40" />}
      </ul>

      {count > 0 && (
        <dl className="flex flex-col gap-1 text-sm">
          {quote.percent > 0 && (
            <div className="flex justify-between gap-3 text-muted">
              <dt>{t.subtotal}</dt>
              <dd className="tabular-nums line-through">{formatPrice(quote.subtotal, locale)}</dd>
            </div>
          )}
          {quote.percent > 0 && (
            <div className="flex justify-between gap-3 font-semibold text-gold-300">
              <dt>{fill(t.discount, { p: quote.percent })}</dt>
              <dd className="tabular-nums">−{formatPrice(quote.subtotal - quote.price, locale)}</dd>
            </div>
          )}
          <div className="flex items-baseline justify-between gap-3 text-ivory">
            <dt className="font-semibold">{t.total}</dt>
            <dd className="text-2xl font-bold tabular-nums text-gold-300">{formatPrice(quote.price, locale)}</dd>
          </div>
        </dl>
      )}

      <p className="text-sm leading-6 text-muted" aria-live="polite">{hint}</p>

      <button type="button" onClick={openReview} disabled={count < PACK_MIN_PIECES} className="gem w-full disabled:opacity-45">
        <span className="gem-face gap-2 text-base">
          <BasketIcon className="size-6" />
          {result === "added" ? t.added : t.review}
        </span>
      </button>
      <span role="status" className={result === "max" || result === "full" ? "text-center text-sm text-gold-200" : "sr-only"}>
        {result === "added" ? t.added : result === "max" ? basket.max : result === "full" ? basket.full : ""}
      </span>
    </div>
  );

  return (
    <div className="mt-10 grid gap-10 pb-56 lg:grid-cols-[1fr_20rem] lg:items-start lg:pb-0">
      <div className="flex flex-col gap-12">
        {groups.map((g, gi) => (
          <section key={g.category} aria-labelledby={`pack-${g.category}`}>
            <div className="flex items-baseline gap-3">
              <span className="font-heading text-sm font-bold text-gold-400 tabular-nums">{gi + 1}</span>
              <h2 id={`pack-${g.category}`} className="font-heading text-xl font-bold text-ivory">{g.label}</h2>
              <span className="text-xs text-muted">{t.optional}</span>
            </div>
            {/* Phones: swipe sideways. Computers: 4 per row. */}
            <ul className="-mx-4 mt-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
              {g.pieces.map((p) => {
                const on = chosen[g.category] === p.slug;
                return (
                  <li key={p.slug} className="w-[42%] shrink-0 snap-start sm:w-[30%] md:w-auto">
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(g.category, p.slug)}
                      className="group flex w-full flex-col text-start"
                    >
                      <span
                        className={`relative block aspect-[4/5] w-full overflow-hidden rounded-sm bg-noir-800 ring-2 transition ${
                          on ? "ring-gold-400" : "ring-transparent group-hover:ring-gold-400/40"
                        }`}
                      >
                        {p.images[0] && (
                          <Image src={p.images[0]} alt={p.name[locale]} fill sizes="(min-width: 768px) 200px, 42vw" className="object-cover" />
                        )}
                        {on && (
                          <span className="absolute top-2 end-2 flex size-7 items-center justify-center rounded-full bg-gold-400 text-sm font-bold text-noir-950" aria-hidden="true">
                            ✓
                          </span>
                        )}
                      </span>
                      <span className="mt-2 line-clamp-2 text-sm font-semibold text-ivory">{p.name[locale]}</span>
                      <span className="text-sm tabular-nums text-gold-300">{formatPrice(p.price, locale)}</span>
                      <span className={`mt-1 text-xs font-semibold ${on ? "text-gold-300" : "text-muted underline underline-offset-4"}`}>
                        {on ? `✓ ${t.chosen}` : t.choose}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      {/* Computers: summary on the side, following the scroll. */}
      <aside className="hidden border border-gold-400/20 bg-noir-900 p-5 lg:sticky lg:top-32 lg:block">{summary}</aside>

      {/* Phones and tablets: compact floating summary above the WhatsApp / basket buttons. */}
      <aside className="fixed inset-x-3 bottom-[calc(max(1rem,env(safe-area-inset-bottom))+4.5rem)] z-30 border border-gold-400/25 bg-noir-900 p-3 shadow-2xl shadow-black/40 lg:hidden">
        <div className="flex items-center gap-3">
          <ul data-pack-preview className="flex shrink-0 -space-x-3 rtl:space-x-reverse" aria-hidden="true">
            {pieces.slice(0, 4).map((p) => (
              <li key={p.slug} className="relative size-10 overflow-hidden rounded-full bg-noir-800 ring-2 ring-noir-900">
                {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="40px" className="object-cover" />}
              </li>
            ))}
            {count === 0 && <li className="size-10 rounded-full border border-dashed border-gold-400/50" />}
          </ul>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ivory">
              {t.summary}
              {count > 0 && ` · ${countText}`}
              {quote.percent > 0 && <span className="text-gold-300"> · {fill(t.discount, { p: quote.percent })}</span>}
            </p>
            {count > 0 ? (
              <p className="text-base font-bold tabular-nums text-gold-300">
                {formatPrice(quote.price, locale)}
                {quote.percent > 0 && <s className="ms-2 text-xs font-normal text-muted">{formatPrice(quote.subtotal, locale)}</s>}
              </p>
            ) : (
              <p className="truncate text-xs text-muted">{t.empty}</p>
            )}
          </div>
        </div>
        {count > 0 && <p className="mt-2 text-xs text-muted">{hint}</p>}
        <button type="button" onClick={openReview} disabled={count < PACK_MIN_PIECES} className="gem mt-2 w-full disabled:opacity-45">
          <span className="gem-face gap-2 text-sm">
            <BasketIcon className="size-5" />
            {result === "added" ? t.added : t.review}
          </span>
        </button>
      </aside>

      {/* Review window: the chosen pieces, the price, then "add" or "change my choice". */}
      <dialog
        ref={reviewRef}
        aria-labelledby="pack-review-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        className="m-auto w-[min(32rem,calc(100%-1.5rem))] border border-gold-400/25 bg-noir-900 p-0 text-ivory shadow-2xl shadow-black/50 backdrop:bg-black/65"
      >
        <div className="flex max-h-[85svh] flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-gold-400/15 px-5 py-4">
            <h2 id="pack-review-title" className="font-heading text-xl font-bold">{t.reviewTitle}</h2>
            <span className="text-sm text-muted">{countText}</span>
          </div>

          <ul data-pack-preview className="flex-1 divide-y divide-gold-400/10 overflow-y-auto px-5">
            {pieces.map((p) => (
              <li key={p.slug} className="flex items-center gap-4 py-3">
                <span className="relative size-20 shrink-0 overflow-hidden rounded-sm bg-noir-800 ring-1 ring-gold-400/25">
                  {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="80px" className="object-cover" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-medium tracking-[0.16em] text-gold-400 ltr:uppercase">
                    {groups.find((g) => g.category === p.category)?.label}
                  </span>
                  <span className="block font-heading text-base font-semibold">{p.name[locale]}</span>
                </span>
                <span className="shrink-0 text-sm tabular-nums text-ivory">{formatPrice(p.price, locale)}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 border-t border-gold-400/15 px-5 py-4">
            <dl className="flex flex-col gap-1 text-sm">
              {quote.percent > 0 && (
                <div className="flex justify-between gap-3 text-muted">
                  <dt>{t.subtotal}</dt>
                  <dd className="tabular-nums line-through">{formatPrice(quote.subtotal, locale)}</dd>
                </div>
              )}
              {quote.percent > 0 && (
                <div className="flex justify-between gap-3 font-semibold text-gold-300">
                  <dt>{fill(t.discount, { p: quote.percent })}</dt>
                  <dd className="tabular-nums">−{formatPrice(quote.subtotal - quote.price, locale)}</dd>
                </div>
              )}
              <div className="flex items-baseline justify-between gap-3">
                <dt className="font-semibold">{t.total}</dt>
                <dd className="text-2xl font-bold tabular-nums text-gold-300">{formatPrice(quote.price, locale)}</dd>
              </div>
            </dl>
            <p className="text-xs text-muted">{t.giftBox}</p>
            <button type="button" onClick={add} className="gem w-full">
              <span className="gem-face gap-2 text-base">
                <BasketIcon className="size-6" />
                {t.add}
              </span>
            </button>
            <button
              type="button"
              onClick={() => reviewRef.current?.close()}
              className="min-h-11 text-sm text-muted underline decoration-gold-400/40 underline-offset-4 hover:text-ivory"
            >
              {t.edit}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
