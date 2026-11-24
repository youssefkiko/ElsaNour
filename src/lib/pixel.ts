/**
 * Meta (Facebook / Instagram) Pixel helpers, for the browser.
 * The Pixel only loads when NEXT_PUBLIC_META_PIXEL_ID is set AND the visitor accepted
 * the cookie notice (components/MetaPixel.tsx). Before that, track() does nothing.
 */

export const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "";
export const CONSENT_KEY = "els_consent";

type Fbq = (...args: unknown[]) => void;

export function readConsent(): "yes" | "no" | null {
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === "yes" || v === "no" ? v : null;
  } catch {
    return null;
  }
}

export function writeConsent(v: "yes" | "no") {
  try {
    window.localStorage.setItem(CONSENT_KEY, v);
  } catch {
    // storage blocked: the question will simply come back next visit
  }
}

/** Sends a standard Pixel event (PageView, ViewContent, AddToCart, InitiateCheckout, Purchase). */
export function track(event: string, params?: Record<string, unknown>, eventId?: string) {
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  if (!PIXEL_ID || typeof fbq !== "function") return;
  if (eventId) fbq("track", event, params ?? {}, { eventID: eventId });
  else fbq("track", event, params ?? {});
}
