"use client"; // Error boundaries must be Client Components

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Short texts here (the dictionaries load on the server, which may be what failed).
const TEXT = {
  ar: {
    title: "عذرًا، وقع خطأ مؤقت",
    text: "لم نتمكن من عرض هذه الصفحة الآن. حاولي مرة أخرى بعد لحظة.",
    retry: "حاولي مرة أخرى",
    home: "العودة إلى الرئيسية",
  },
  fr: {
    title: "Désolé, une erreur temporaire",
    text: "Cette page ne peut pas s’afficher pour le moment. Réessayez dans un instant.",
    retry: "Réessayer",
    home: "Retour à l’accueil",
  },
  en: {
    title: "Sorry, a temporary error",
    text: "This page cannot be shown right now. Please try again in a moment.",
    retry: "Try again",
    home: "Back to home",
  },
} as const;

/** Friendly page when something fails while showing a shop page (inside header and footer). */
export default function ShopError({ error, retry }: { error: unknown; retry: () => void }) {
  const lang = (usePathname()?.split("/")[1] ?? "ar") as keyof typeof TEXT;
  const t = TEXT[lang] ?? TEXT.ar;

  useEffect(() => {
    // Shows in the Vercel logs (Project > Logs) to find the cause.
    console.error("[shop] page error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <span aria-hidden="true" className="flex size-16 items-center justify-center border border-gold-400/50 text-3xl text-gold-300">
        !
      </span>
      <h1 className="mt-6 font-heading text-2xl font-bold text-ivory sm:text-3xl">{t.title}</h1>
      <p className="mt-3 text-base leading-8 text-muted">{t.text}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => retry()} className="gem">
          <span className="gem-face">{t.retry}</span>
        </button>
        <Link href={`/${TEXT[lang] ? lang : "ar"}`} className="gem gem-dark">
          <span className="gem-face">{t.home}</span>
        </Link>
      </div>
    </div>
  );
}
