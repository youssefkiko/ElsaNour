"use client";

import { Children, useEffect, useId, useRef, useState, type ReactNode } from "react";

/**
 * Tabs above a product row (All, Sets, Necklaces...), like the luxury catalogs the owner
 * likes. The panels are rendered on the server; this only shows the chosen one.
 */
export function SliderTabs({ tabs, children }: { tabs: { key: string; label: string }[]; children: ReactNode }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const panels = Children.toArray(children);

  return (
    <div>
      <div
        role="tablist"
        className="-mx-4 flex justify-start gap-6 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:justify-center sm:gap-10 sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((tab, i) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${id}-panel-${i}`}
            onClick={() => setActive(i)}
            className={`relative shrink-0 pb-2 text-sm font-semibold whitespace-nowrap transition-colors ltr:text-xs ltr:tracking-[0.14em] ltr:uppercase ${
              i === active
                ? "text-ivory after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gold-400"
                : "text-muted hover:text-ivory"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {panels.map((panel, i) => (
        <div
          key={tabs[i]?.key ?? i}
          role="tabpanel"
          id={`${id}-panel-${i}`}
          aria-labelledby={`${id}-tab-${i}`}
          hidden={i !== active}
          className="mt-8"
        >
          {panel}
        </div>
      ))}
    </div>
  );
}

/**
 * A row of products that slides sideways (finger or trackpad), with a thin line under it
 * that shows where you are in the row. The line hides when everything fits.
 */
export function ScrollRow({ children }: { children: ReactNode }) {
  const row = useRef<HTMLUListElement>(null);
  const [bar, setBar] = useState({ size: 100, pos: 0 });

  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      const size = el.scrollWidth > 0 ? (el.clientWidth / el.scrollWidth) * 100 : 100;
      // Right-to-left pages scroll with negative values: only the distance matters.
      const pos = max > 0 ? Math.min(1, Math.abs(el.scrollLeft) / max) : 0;
      setBar({ size, pos });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  return (
    <>
      <ul
        ref={row}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:gap-6 sm:px-6 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>
      {bar.size < 99.5 && (
        <div aria-hidden="true" className="relative mx-auto mt-8 h-px w-40 bg-ivory/15 sm:w-56">
          <span
            className="absolute inset-y-0 bg-gold-400 transition-[inset-inline-start] duration-150"
            style={{ width: `${bar.size}%`, insetInlineStart: `${bar.pos * (100 - bar.size)}%` }}
          />
        </div>
      )}
    </>
  );
}
