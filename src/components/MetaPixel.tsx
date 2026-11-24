"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { PIXEL_ID, track } from "@/lib/pixel";

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
 * Meta Pixel. Nothing happens while no Pixel ID is configured. With an ID, it loads on
 * the first page and sends a PageView on every page (owner decision: no cookie notice).
 */
export function MetaPixel() {
  const pathname = usePathname();

  useEffect(() => {
    if (!PIXEL_ID) return;
    loadPixel();
    track("PageView");
  }, [pathname]);

  return null;
}

/** Fires one Pixel event when the page shows (e.g. ViewContent on a product page). */
export function PixelEvent({ event, params, eventId }: { event: string; params?: Record<string, unknown>; eventId?: string }) {
  const key = JSON.stringify([event, params, eventId]);
  useEffect(() => {
    // Wait a moment so the Pixel has been initialised by MetaPixel.
    const id = window.setTimeout(() => track(event, params, eventId), 400);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return null;
}
