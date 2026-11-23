"use client";

import { useEffect } from "react";

/**
 * Tilts the 3D emerald gems (.gem) towards the mouse on computers.
 * One listener for the whole page (event delegation); sets --rx / --ry on the hovered gem.
 * Nothing happens on touch screens or with reduced motion.
 */
export function GemTilt() {
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    let current: HTMLElement | null = null;
    const reset = (el: HTMLElement | null) => {
      el?.style.removeProperty("--rx");
      el?.style.removeProperty("--ry");
    };

    const onMove = (e: PointerEvent) => {
      const gem = (e.target as Element | null)?.closest<HTMLElement>(".gem:not(.gem-sunken)") ?? null;
      if (gem !== current) {
        reset(current);
        current = gem;
      }
      if (!gem) return;
      const r = gem.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      gem.style.setProperty("--ry", `${(x * 18).toFixed(1)}deg`);
      gem.style.setProperty("--rx", `${(-y * 18).toFixed(1)}deg`);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      reset(current);
    };
  }, []);

  return null;
}
