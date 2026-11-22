"use client";

import { useEffect, useState, type ReactNode } from "react";
import { CloseIcon, MenuIcon } from "./icons";

type Props = {
  links: { href: string; label: string }[];
  openLabel: string;
  closeLabel: string;
  navLabel: string;
  /** Extra content at the bottom of the panel (the language switcher). */
  footer: ReactNode;
};

// Mobile-only menu: a button that opens a panel under the header.
export function MobileMenu({ links, openLabel, closeLabel, navLabel, footer }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? closeLabel : openLabel}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-11 items-center justify-center rounded-full text-gold-300 transition-colors hover:bg-white/10"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      <div
        id="mobile-menu"
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-gold-400/20 bg-noir-950 px-4 pt-2 pb-6 shadow-2xl"
      >
        <nav aria-label={navLabel}>
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center border-b border-white/5 text-lg text-ivory transition-colors hover:text-gold-300"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-4">{footer}</div>
      </div>
    </div>
  );
}
