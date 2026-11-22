"use client";

import { MoonIcon, SunIcon } from "./icons";

/**
 * Morning (light) / evening (dark) switch. The choice is saved in localStorage
 * and applied before the page paints by the small script in the layout (ThemeScript).
 * The icon shown is chosen in CSS from html[data-theme], so the server HTML never mismatches.
 */
export function ThemeToggle({ label }: { label: string }) {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private mode: the choice just won't be remembered.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="inline-flex size-11 items-center justify-center rounded-full text-gold-300 transition-colors hover:bg-gold-400/10"
    >
      <SunIcon className="theme-icon-sun size-5" />
      <MoonIcon className="theme-icon-moon size-5" />
    </button>
  );
}
