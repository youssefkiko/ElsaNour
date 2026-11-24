"use client";

import Link from "next/link";
import { startTransition, useActionState, useState, type ReactNode } from "react";
import type { ProductFormState } from "@/app/admin/products/actions";
import { ITEM_KEYS } from "@/data/products";
import ar from "@/i18n/dictionaries/ar.json";
import { categories } from "@/lib/categories";
import { AlertIcon } from "../icons";
import { ColorsEditor, type ColorDraft } from "./ColorsEditor";
import { PhotoManager } from "./PhotoManager";

export type ProductFormValues = {
  name_ar: string;
  name_fr: string;
  name_en: string;
  category: string;
  price: string;
  compare_at: string;
  description_ar: string;
  description_fr: string;
  description_en: string;
  includes: string[];
  images: string[];
  colors: ColorDraft[];
  in_stock: boolean;
  is_active: boolean;
};

type Props = {
  action: (prev: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  initial: ProductFormValues;
  isNew: boolean;
  maxPhotos: number;
  /** Address of the product on the site (edit only). */
  publicUrl?: string;
};

const input =
  "block w-full border border-ivory/15 bg-noir-800 px-3 text-base text-ivory outline-none transition-colors placeholder:text-muted/60 focus:border-gold-300";

/** Add / edit a product. Made for the phone: one column, big fields and switches. */
export function ProductForm({ action, initial, isNew, maxPhotos, publicUrl }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const [images, setImages] = useState(initial.images);
  const [colors, setColors] = useState(initial.colors);
  const err = (k: string) => state.fields?.[k];

  return (
    <form
      noValidate
      onSubmit={(e) => {
        // Submitted by hand (not <form action>) so the typed values stay if there is an error.
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
      className="flex flex-col gap-5"
    >
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input type="hidden" name="colors" value={JSON.stringify(colors)} />

      <Box title="الصور">
        <PhotoManager photos={images} onChange={setImages} max={maxPhotos} />
        <Err text={err("images")} />
      </Box>

      <Box title="الألوان (اختياري)">
        <ColorsEditor colors={colors} onChange={setColors} maxPhotos={maxPhotos} error={err("colors")} />
      </Box>

      <Box title="الاسم والمجموعة">
        <Field label="الاسم بالعربية" required error={err("name_ar")}>
          <input name="name_ar" defaultValue={initial.name_ar} maxLength={80} className={`${input} h-12`} />
        </Field>
        <Field label="المجموعة" error={err("category")}>
          <select name="category" defaultValue={initial.category} className={`${input} h-12`}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {ar.collections.items[c]}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="الاسم بالفرنسية (اختياري)" error={err("name_fr")}>
            <input name="name_fr" dir="ltr" defaultValue={initial.name_fr} maxLength={80} className={`${input} h-12`} />
          </Field>
          <Field label="الاسم بالإنجليزية (اختياري)" error={err("name_en")}>
            <input name="name_en" dir="ltr" defaultValue={initial.name_en} maxLength={80} className={`${input} h-12`} />
          </Field>
        </div>
        <p className="text-xs leading-5 text-muted">
          إذا تركت الفرنسية أو الإنجليزية فارغة، يظهر الاسم العربي في تلك اللغة.
          {isNew && " الاسم الفرنسي (أو الإنجليزي) يُستعمل أيضًا في رابط المنتج."}
        </p>
      </Box>

      <Box title="الثمن (درهم)">
        <div className="grid grid-cols-2 gap-4">
          <Field label="الثمن" required error={err("price")}>
            <input name="price" inputMode="decimal" dir="ltr" defaultValue={initial.price} className={`${input} h-12`} />
          </Field>
          <Field label="الثمن القديم (اختياري)" error={err("compare_at")}>
            <input name="compare_at" inputMode="decimal" dir="ltr" defaultValue={initial.compare_at} className={`${input} h-12`} />
          </Field>
        </div>
        <p className="text-xs leading-5 text-muted">الثمن القديم يظهر مشطوبًا مع نسبة التخفيض.</p>
      </Box>

      <Box title="ماذا يوجد في العلبة">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ITEM_KEYS.map((k) => (
            <label key={k} className="flex min-h-11 cursor-pointer items-center gap-2 border border-ivory/12 px-3 text-sm has-checked:border-gold-300 has-checked:bg-gold-300/10">
              <input type="checkbox" name="includes" value={k} defaultChecked={initial.includes.includes(k)} className="size-4 accent-[#d4a64a]" />
              {ar.product.items[k]}
            </label>
          ))}
        </div>
      </Box>

      <Box title="الوصف (اختياري)">
        <Field label="بالعربية" error={err("description_ar")}>
          <textarea name="description_ar" rows={4} maxLength={1000} defaultValue={initial.description_ar} className={`${input} py-2.5 leading-7`} />
        </Field>
        <details className="group">
          <summary className="cursor-pointer text-sm text-gold-300">بالفرنسية والإنجليزية</summary>
          <div className="mt-3 flex flex-col gap-4">
            <Field label="بالفرنسية" error={err("description_fr")}>
              <textarea name="description_fr" dir="ltr" rows={3} maxLength={1000} defaultValue={initial.description_fr} className={`${input} py-2.5 leading-7`} />
            </Field>
            <Field label="بالإنجليزية" error={err("description_en")}>
              <textarea name="description_en" dir="ltr" rows={3} maxLength={1000} defaultValue={initial.description_en} className={`${input} py-2.5 leading-7`} />
            </Field>
          </div>
        </details>
        <p className="text-xs leading-5 text-muted">إذا تركته فارغًا، يظهر النص القصير الخاص بالمجموعة.</p>
      </Box>

      <Box title="الحالة">
        <Switch name="in_stock" defaultChecked={initial.in_stock} label="متوفر" hint="إذا أزلت العلامة: يظهر المنتج «غير متوفر» ولا يمكن طلبه." />
        <Switch name="is_active" defaultChecked={initial.is_active} label="ظاهر في الموقع" hint="إذا أزلت العلامة: يختفي المنتج من الموقع (يبقى هنا)." />
      </Box>

      {state.error && (
        <p role="alert" className="flex items-start gap-2 border border-danger/40 bg-danger/10 px-3 py-2.5 text-sm text-danger">
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="gem flex-1 disabled:opacity-80">
          <span className="gem-face text-base">{pending ? "جارٍ الحفظ…" : isNew ? "إضافة المنتج" : "حفظ التغييرات"}</span>
        </button>
        <Link href="/admin/products" className="min-h-12 border border-ivory/15 px-5 text-sm leading-12 text-muted">
          إلغاء
        </Link>
      </div>
      {publicUrl && (
        <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="text-center text-sm text-gold-300 underline underline-offset-4">
          رؤية المنتج في الموقع
        </a>
      )}
    </form>
  );
}

function Box({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 border border-ivory/10 bg-noir-900 p-4">
      <legend className="px-1 text-xs font-semibold tracking-wide text-gold-400">{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">
        {label} {required && <span className="text-gold-300">*</span>}
      </span>
      {children}
      <Err text={error} />
    </label>
  );
}

function Err({ text }: { text?: string }) {
  return text ? <span className="mt-1.5 block text-sm font-semibold text-danger">{text}</span> : null;
}

function Switch({ name, label, hint, defaultChecked }: { name: string; label: string; hint: string; defaultChecked: boolean }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-1 size-5 shrink-0 accent-[#d4a64a]" />
      <span>
        <span className="block font-semibold">{label}</span>
        <span className="block text-xs leading-5 text-muted">{hint}</span>
      </span>
    </label>
  );
}
