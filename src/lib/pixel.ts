/**
 * Meta (Facebook / Instagram) Pixel helpers, for the browser.
 * The Pixel only loads when NEXT_PUBLIC_META_PIXEL_ID is set (components/MetaPixel.tsx).
 * Before that, track() does nothing.
 */

export const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "";

type Fbq = (...args: unknown[]) => void;

/** Sends a standard Pixel event (PageView, ViewContent, AddToCart, InitiateCheckout, Purchase). */
export function track(event: string, params?: Record<string, unknown>, eventId?: string) {
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  if (!PIXEL_ID || typeof fbq !== "function") return;
  if (eventId) fbq("track", event, params ?? {}, { eventID: eventId });
  else fbq("track", event, params ?? {});
}
