import { useSyncExternalStore } from "react";
import { MAX_QUANTITY } from "./order";

/**
 * The basket, kept in the visitor's browser (localStorage), so it survives a refresh
 * and is shared between tabs. Only product slugs, chosen colors and quantities are stored:
 * names, photos and prices always come from the product data (and the server recomputes
 * everything). The same product in two colors makes two lines.
 */
export type CartLine = { slug: string; qty: number; color?: string };

const sameLine = (l: CartLine, slug: string, color?: string) => l.slug === slug && (l.color ?? "") === (color ?? "");

export const MAX_LINES = 10;
const KEY = "els_cart";
const EMPTY: CartLine[] = [];

const listeners = new Set<() => void>();
let lastRaw: string | null | undefined;
let lastLines: CartLine[] = EMPTY;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): CartLine[] {
  if (!raw) return EMPTY;
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return EMPTY;
    return data
      .filter(
        (l): l is CartLine =>
          typeof l?.slug === "string" &&
          Number.isInteger(l?.qty) &&
          l.qty >= 1 &&
          l.qty <= MAX_QUANTITY &&
          (l.color === undefined || typeof l.color === "string"),
      )
      .slice(0, MAX_LINES);
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): CartLine[] {
  const raw = readRaw();
  if (raw !== lastRaw) {
    lastRaw = raw;
    lastLines = parse(raw);
  }
  return lastLines;
}

const getServerSnapshot = () => EMPTY;

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function write(lines: CartLine[]) {
  try {
    if (lines.length === 0) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    // Private mode or storage blocked: the basket just does not persist.
  }
  listeners.forEach((l) => l());
}

/** The basket lines, live. Empty on the server and during the first render. */
export function useCart(): CartLine[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** False on the server and during hydration, true once the basket has been read. */
export function useCartReady(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
const noopSubscribe = () => () => {};

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty, 0);

export type AddResult = "added" | "max" | "full";

export function addToCart(slug: string, color?: string): AddResult {
  const lines = getSnapshot();
  const found = lines.find((l) => sameLine(l, slug, color));
  if (found) {
    if (found.qty >= MAX_QUANTITY) return "max";
    write(lines.map((l) => (sameLine(l, slug, color) ? { ...l, qty: l.qty + 1 } : l)));
    return "added";
  }
  if (lines.length >= MAX_LINES) return "full";
  write([...lines, color ? { slug, qty: 1, color } : { slug, qty: 1 }]);
  return "added";
}

export function setCartQty(slug: string, color: string | undefined, qty: number) {
  const q = Math.max(1, Math.min(MAX_QUANTITY, Math.round(qty)));
  write(getSnapshot().map((l) => (sameLine(l, slug, color) ? { ...l, qty: q } : l)));
}

export function removeFromCart(slug: string, color?: string) {
  write(getSnapshot().filter((l) => !sameLine(l, slug, color)));
}

export function clearCart() {
  write(EMPTY);
}

/** Keeps only the lines whose product can still be ordered. */
export function pruneCart(isOrderable: (slug: string, color?: string) => boolean) {
  const lines = getSnapshot();
  const kept = lines.filter((l) => isOrderable(l.slug, l.color));
  if (kept.length !== lines.length) write(kept);
}

// ---------------------------------------------------------------------------
// "Fly to the basket" animation: the add button asks, the basket plays it.
// ---------------------------------------------------------------------------
export const FLY_EVENT = "els:fly";
export type FlyDetail = { source: HTMLElement | null };

export function requestFly(source: HTMLElement | null) {
  window.dispatchEvent(new CustomEvent<FlyDetail>(FLY_EVENT, { detail: { source } }));
}
