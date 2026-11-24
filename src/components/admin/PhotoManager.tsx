"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { createPhotoUpload } from "@/app/admin/products/actions";

type Props = {
  photos: string[];
  onChange: (photos: string[]) => void;
  max: number;
};

const MAX_SIDE = 1600;

/** Shrinks a phone photo in the browser (max 1600 px, WebP or JPEG) before uploading it. */
async function shrink(file: File): Promise<{ blob: Blob; kind: "webp" | "jpeg" }> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const toBlob = (type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  const webp = await toBlob("image/webp", 0.82);
  if (webp && webp.type === "image/webp") return { blob: webp, kind: "webp" };
  const jpeg = await toBlob("image/jpeg", 0.85); // Safari cannot make WebP
  if (!jpeg) throw new Error("encode");
  return { blob: jpeg, kind: "jpeg" };
}

/** Product photos: add (several at once), choose the main one, change the order, remove. */
export function PhotoManager({ photos, onChange, max }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    const room = max - photos.length;
    const list = Array.from(files).slice(0, room);
    if (files.length > room) setError(`${max} صور كحد أقصى لكل منتج.`);
    const added: string[] = [];
    for (let i = 0; i < list.length; i++) {
      setBusy(`جارٍ رفع الصورة ${i + 1} من ${list.length}…`);
      try {
        const { blob, kind } = await shrink(list[i]);
        const link = await createPhotoUpload(kind);
        if ("error" in link) throw new Error(link.error);
        const body = new FormData();
        body.append("cacheControl", "31536000");
        body.append("", blob);
        const res = await fetch(link.signedUrl, { method: "PUT", body, headers: { "x-upsert": "false" } });
        if (!res.ok) throw new Error(`upload ${res.status}`);
        added.push(link.publicUrl);
      } catch (e) {
        console.error(e);
        setError(
          e instanceof Error && e.message.includes("SQL")
            ? e.message
            : `تعذر رفع الصورة "${list[i].name}". جرب صورة أخرى (JPG أو PNG).`,
        );
      }
    }
    if (added.length) onChange([...photos, ...added]);
    setBusy(null);
    if (input.current) input.current.value = "";
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= photos.length) return;
    const next = [...photos];
    [next[from], next[to]] = [next[to], next[from]];
    onChange(next);
  };

  return (
    <div>
      {photos.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photos.map((url, i) => (
            <li key={url} className="border border-ivory/12 bg-noir-800">
              <div className="relative aspect-square">
                <Image src={url} alt={`صورة ${i + 1}`} fill sizes="160px" className="object-cover" />
                {i === 0 && (
                  <span className="absolute top-1 start-1 bg-gold-300 px-1.5 text-[11px] font-bold text-[#06140f]">
                    الرئيسية
                  </span>
                )}
              </div>
              <div className="flex">
                <button
                  type="button"
                  onClick={() => move(i, i - 1)}
                  disabled={i === 0}
                  aria-label="تقديم الصورة"
                  className="min-h-10 flex-1 text-gold-300 disabled:opacity-25"
                >
                  →
                </button>
                <button
                  type="button"
                  onClick={() => onChange(photos.filter((p) => p !== url))}
                  aria-label="حذف الصورة"
                  className="min-h-10 flex-1 border-x border-ivory/10 text-danger"
                >
                  ✕
                </button>
                <button
                  type="button"
                  onClick={() => move(i, i + 1)}
                  disabled={i === photos.length - 1}
                  aria-label="تأخير الصورة"
                  className="min-h-10 flex-1 text-gold-300 disabled:opacity-25"
                >
                  ←
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        id="photo-input"
        onChange={(e) => upload(e.target.files)}
        disabled={!!busy || photos.length >= max}
      />
      <label
        htmlFor="photo-input"
        className={`mt-2 flex min-h-12 cursor-pointer items-center justify-center gap-2 border border-dashed border-gold-400/50 text-sm font-semibold text-gold-200 ${
          busy || photos.length >= max ? "pointer-events-none opacity-50" : "hover:bg-gold-300/5"
        }`}
      >
        {busy ?? (photos.length >= max ? `${max} صور (الحد الأقصى)` : "+ إضافة صور من الهاتف")}
      </label>
      <p className="mt-1.5 text-xs text-muted">الصورة الأولى هي التي تظهر في المتجر. الصور تُصغَّر تلقائيًا قبل الرفع.</p>
      {error && <p role="alert" className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  );
}
