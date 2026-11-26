"use client"; // Error boundaries must be Client Components

import Link from "next/link";
import { useEffect } from "react";

/** Admin: something failed (often the internet connection or Supabase). */
export default function AdminError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error("[admin] page error:", error);
  }, [error]);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-xl tracking-[0.16em] text-gold-300" dir="ltr">
        ELSANOUR
      </p>
      <h1 className="mt-4 font-heading text-2xl font-bold">وقع خطأ مؤقت</h1>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
        تحقق من الاتصال بالإنترنت ثم أعد المحاولة. إذا تكرر الخطأ، افتح لوحة Supabase للتأكد أن المشروع يعمل.
      </p>
      <div className="mt-6 flex gap-2">
        <button type="button" onClick={() => retry()} className="min-h-11 border border-gold-300 bg-gold-300 px-5 text-sm font-semibold text-noir-950">
          أعد المحاولة
        </button>
        <Link href="/admin" className="min-h-11 border border-ivory/15 px-5 text-sm leading-11 text-ivory/80">
          الطلبات
        </Link>
      </div>
    </main>
  );
}
