"use client";

import { useServerInsertedHTML } from "next/navigation";
import { useRef } from "react";
import { themeScript } from "@/lib/theme";

/**
 * Inserts the theme script into the server HTML once, so the saved morning/evening theme
 * is applied before the first paint. Done with useServerInsertedHTML (Next.js guide
 * "Preventing flash before hydration") to avoid React's "script tag" warning.
 * The attribute it sets on <html> persists across client navigations.
 */
export function ThemeScript() {
  const inserted = useRef(false);
  useServerInsertedHTML(() => {
    if (inserted.current) return null;
    inserted.current = true;
    return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
  });
  return null;
}
