"use client";

import { PhotoManager } from "./PhotoManager";

export type ColorDraft = {
  id: string;
  name_ar: string;
  name_fr: string;
  name_en: string;
  images: string[];
  in_stock: boolean;
};

type Props = {
  colors: ColorDraft[];
  onChange: (colors: ColorDraft[]) => void;
  maxPhotos: number;
  error?: string;
};

const MAX_COLORS = 12;
const input = "block h-11 w-full border border-ivory/15 bg-noir-800 px-3 text-base text-ivory outline-none focus:border-gold-300";
const newId = () => `c${Math.random().toString(36).slice(2, 8)}`;

/**
 * Colors of a product: each one has a name, its own photos and its own "in stock".
 * Empty list = the product has no color choice.
 */
export function ColorsEditor({ colors, onChange, maxPhotos, error }: Props) {
  const update = (i: number, patch: Partial<ColorDraft>) =>
    onChange(colors.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  const move = (i: number, j: number) => {
    if (j < 0 || j >= colors.length) return;
    const next = [...colors];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      {colors.length === 0 && (
        <p className="text-sm leading-6 text-muted">
          هذا المنتج بلا ألوان. إذا كان عندك نفس المنتج بعدة ألوان (ذهبي، فضي...)، زد الألوان هنا: كل لون بصوره، والزبونة تختار في صفحة المنتج.
        </p>
      )}

      {colors.map((c, i) => (
        <div key={c.id} className="border border-ivory/12 bg-noir-950/40 p-3">
          <div className="flex items-end gap-2">
            <label className="block flex-1">
              <span className="mb-1 block text-sm font-semibold">
                اسم اللون {i + 1} <span className="text-gold-300">*</span>
              </span>
              <input
                value={c.name_ar}
                onChange={(e) => update(i, { name_ar: e.target.value })}
                maxLength={40}
                placeholder="مثلًا: ذهبي"
                className={input}
              />
            </label>
            <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="تقديم اللون" className="h-11 w-10 border border-ivory/15 disabled:opacity-30">
              ↑
            </button>
            <button type="button" onClick={() => move(i, i + 1)} disabled={i === colors.length - 1} aria-label="تأخير اللون" className="h-11 w-10 border border-ivory/15 disabled:opacity-30">
              ↓
            </button>
            <button
              type="button"
              onClick={() => onChange(colors.filter((_, j) => j !== i))}
              aria-label={`حذف اللون ${c.name_ar}`}
              className="h-11 w-10 border border-danger/40 text-danger"
            >
              ✕
            </button>
          </div>

          <details className="mt-2">
            <summary className="cursor-pointer text-xs text-gold-300">الاسم بالفرنسية والإنجليزية (اختياري)</summary>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <input value={c.name_fr} onChange={(e) => update(i, { name_fr: e.target.value })} dir="ltr" maxLength={40} placeholder="Doré" className={input} />
              <input value={c.name_en} onChange={(e) => update(i, { name_en: e.target.value })} dir="ltr" maxLength={40} placeholder="Gold" className={input} />
            </div>
          </details>

          <div className="mt-3">
            <PhotoManager
              photos={c.images}
              onChange={(images) => update(i, { images })}
              max={maxPhotos}
              inputId={`photos-${c.id}`}
              addLabel="+ صور هذا اللون"
            />
          </div>

          <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={c.in_stock} onChange={(e) => update(i, { in_stock: e.target.checked })} className="size-5 accent-[#d4a64a]" />
            هذا اللون متوفر
          </label>
        </div>
      ))}

      {error && <p className="text-sm font-semibold text-danger">{error}</p>}

      {colors.length < MAX_COLORS && (
        <button
          type="button"
          onClick={() => onChange([...colors, { id: newId(), name_ar: "", name_fr: "", name_en: "", images: [], in_stock: true }])}
          className="min-h-11 border border-dashed border-gold-400/50 text-sm font-semibold text-gold-200 hover:bg-gold-300/5"
        >
          + إضافة لون
        </button>
      )}
    </div>
  );
}
