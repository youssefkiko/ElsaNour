"use client";

import Image from "next/image";
import { createContext, useContext, useState, type ReactNode } from "react";
import { defaultColor, type ProductColor } from "@/data/products";
import type { Locale } from "@/i18n/config";
import type { Category } from "@/lib/categories";
import { ProductGallery } from "./ProductGallery";
import { ProductPlaceholder } from "./ProductPlaceholder";

/**
 * Product colors: small photo thumbnails, one per color. Tapping one shows that color's
 * photos in the gallery (same page) and the "add to basket" button adds that color.
 */

type ColorState = { colors: ProductColor[]; selected?: ProductColor; select: (id: string) => void };
const ColorContext = createContext<ColorState | null>(null);

export function ColorProvider({ colors, children }: { colors: ProductColor[]; children: ReactNode }) {
  const [selectedId, setSelectedId] = useState(() => defaultColor({ colors })?.id);
  const selected = colors.find((c) => c.id === selectedId);
  return <ColorContext.Provider value={{ colors, selected, select: setSelectedId }}>{children}</ColorContext.Provider>;
}

/** The color currently chosen on the page (undefined for a product without colors). */
export const useSelectedColor = () => useContext(ColorContext)?.selected;

type GalleryProps = {
  slug: string;
  name: string;
  category: Category;
  /** Product photos, used when the chosen color has none. */
  fallbackImages: string[];
  photoLabel: string;
  photoSoon: string;
};

/** Gallery showing the photos of the chosen color. */
export function ColorGallery({ slug, name, category, fallbackImages, photoLabel, photoSoon }: GalleryProps) {
  const selected = useSelectedColor();
  const images = selected?.images.length ? selected.images : fallbackImages;
  const slides =
    images.length > 0
      ? images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={`${name}${selected ? ` (${selected.name.ar})` : ""} ${i + 1}`}
            fill
            preload={i === 0}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        ))
      : [0, 1, 2].map((i) => (
          <ProductPlaceholder key={i} category={category} index={i} label={photoSoon} className="absolute inset-0" />
        ));

  // key: a new color starts again at its first photo.
  return (
    <ProductGallery key={selected?.id ?? "none"} photoLabel={photoLabel} flySource={slug}>
      {slides}
    </ProductGallery>
  );
}

/** Thumbnails to choose the color, with the chosen color's name. */
export function ColorPicker({ locale, labels }: { locale: Locale; labels: { color: string; soldOut: string } }) {
  const ctx = useContext(ColorContext);
  if (!ctx || ctx.colors.length === 0) return null;
  const { colors, selected, select } = ctx;

  return (
    <fieldset className="mt-6">
      <legend className="text-sm font-semibold text-ivory">
        {labels.color}: <span className="text-gold-200">{selected?.name[locale]}</span>
      </legend>
      <div className="mt-3 flex flex-wrap gap-2.5">
        {colors.map((c) => {
          const active = c.id === selected?.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => select(c.id)}
              aria-pressed={active}
              aria-label={`${c.name[locale]}${c.inStock ? "" : ` (${labels.soldOut})`}`}
              title={c.name[locale]}
              className={`relative size-16 overflow-hidden border bg-noir-800 transition-all ${
                active ? "border-gold-300 ring-2 ring-gold-300/50" : "border-ivory/15 hover:border-gold-400/60"
              }`}
            >
              {c.images[0] ? (
                <Image src={c.images[0]} alt="" fill sizes="64px" className={`object-cover ${c.inStock ? "" : "opacity-40 grayscale"}`} />
              ) : (
                <span className="flex size-full items-center justify-center p-1 text-[11px] leading-tight text-ivory/80">
                  {c.name[locale]}
                </span>
              )}
              {!c.inStock && (
                <span className="absolute inset-x-0 bottom-0 bg-noir-950/85 text-[10px] font-semibold text-muted">
                  {labels.soldOut}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
