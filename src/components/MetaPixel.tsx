"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import { PIXEL_ID, readConsent, track, writeConsent } from "@/lib/pixel";

let loaded = false;

/** Adds Meta's standard Pixel snippet to the page (once). */
function loadPixel() {
  if (loaded || !PIXEL_ID) return;
  loaded = true;
  /* eslint-disable */
  // Official Meta Pixel base code (creates window.fbq and loads fbevents.js).
  (function (f: any, b: Document, e: string, v: string) {
    if (f.fbq) return;
    const n: any = (f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    });
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    const t = b.createElement(e) as HTMLScriptElement;
    t.async = true;
    t.src = v;
    const s = b.getElementsByTagName(e)[0];
    s.parentNode!.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  /* eslint-enable */
  (window as unknown as { fbq: (...a: unknown[]) => void }).fbq("init", PIXEL_ID);
}

/**
 * Meta Pixel + the cookie notice that comes with it. Nothing at all happens while no
 * Pixel ID is configured. With an ID: the visitor is asked once; the Pixel loads only
 * after "Accept", and sends a PageView on every page.
 */
export function MetaPixel({ t }: { t: Dictionary["consent"] }) {
  const pathname = usePathname();
  const [consent, setConsent] = useState<"yes" | "no" | null | "unknown">("unknown");

  useEffect(() => {
    // Read after mount (localStorage is not available on the server).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsent(readConsent());
  }, []);

  useEffect(() => {
    if (consent !== "yes" || !PIXEL_ID) return;
    loadPixel();
    track("PageView");
  }, [consent, pathname]);

  if (!PIXEL_ID || consent !== null) return null;

  const answer = (v: "yes" | "no") => {
    writeConsent(v);
    setConsent(v);
  };

  return (
    <div
      role="dialog"
      aria-label={t.text}
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-gold-400/30 bg-noir-950/97 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-12px_32px_rgba(0,0,0,0.4)]"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-ivory/90">{t.text}</p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => answer("no")}
            className="min-h-11 flex-1 border border-ivory/20 px-4 text-sm text-ivory/80 hover:border-gold-400/50 sm:flex-none"
          >
            {t.decline}
          </button>
          <button
            type="button"
            onClick={() => answer("yes")}
            className="min-h-11 flex-1 border border-gold-300 bg-gold-300 px-5 text-sm font-semibold text-[#06140f] hover:bg-gold-200 sm:flex-none"
          >
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Fires one Pixel event when the page shows (e.g. ViewContent on a product page). */
export function PixelEvent({ event, params, eventId }: { event: string; params?: Record<string, unknown>; eventId?: string }) {
  const key = JSON.stringify([event, params, eventId]);
  useEffect(() => {
    // Wait a moment so the Pixel (if accepted) has been initialised by MetaPixel.
    const id = window.setTimeout(() => track(event, params, eventId), 400);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return null;
}
