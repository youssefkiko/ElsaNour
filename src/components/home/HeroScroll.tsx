"use client";

import { useEffect, useRef } from "react";

/**
 * Writes the scroll progress of the hero (0 at the top, 1 at the end) as the CSS
 * variable --p on the hero section. All the animation is done in CSS from --p,
 * so there is no React re-render while scrolling.
 */
export function HeroScroll() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = ref.current?.closest("section");
    if (!section) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      section.style.setProperty("--p", "0.5");
      section.toggleAttribute("data-copy", true);
      return;
    }

    const headerHeight = 64;
    const update = () => {
      const rect = section.getBoundingClientRect();
      const total = rect.height - (window.innerHeight - headerHeight);
      const p = total > 0 ? Math.min(1, Math.max(0, (headerHeight - rect.top) / total)) : 0;
      section.style.setProperty("--p", p.toFixed(4));
      // The headline and button only become tappable once they are visible.
      section.toggleAttribute("data-copy", p > 0.2);
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        update();
      });
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return <span ref={ref} hidden />;
}
