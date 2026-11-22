"use client";

import { useEffect, useRef } from "react";

/**
 * Drives the scroll-based hero:
 * - writes the scroll progress (0 to 1) as the CSS variable --p on the hero section,
 *   which the text uses to fade in (no React re-render on scroll);
 * - loads three.js only after the page is idle, then shows the 3D ring.
 * Until the 3D is ready (or if WebGL fails), the SVG ring stays visible.
 */
export function RingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = canvas?.closest("section");
    if (!canvas || !section) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const headerHeight = 64;
    let progress = 0;

    const update = () => {
      const rect = section.getBoundingClientRect();
      const total = rect.height - (window.innerHeight - headerHeight);
      progress = total > 0 ? Math.min(1, Math.max(0, (headerHeight - rect.top) / total)) : 0;
      section.style.setProperty("--p", progress.toFixed(4));
      // The headline and button only become tappable once they are visible.
      section.toggleAttribute("data-copy", progress > 0.2);
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

    if (reducedMotion) {
      section.style.setProperty("--p", "0.5");
      section.toggleAttribute("data-copy", true);
    } else {
      update();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
    }

    let scene: { setRunning(v: boolean): void; dispose(): void } | null = null;
    let cancelled = false;
    let observer: IntersectionObserver | null = null;

    const load = async () => {
      try {
        const { createRingScene } = await import("@/lib/three/ringScene");
        if (cancelled) return;
        scene = createRingScene(canvas, {
          getProgress: () => (reducedMotion ? 0.15 : progress),
          reducedMotion,
          rtl: document.documentElement.dir === "rtl",
          onFirstFrame: () => {
            section.dataset.ready = "true";
          },
        });
        // Pause rendering when the hero is off screen to save battery.
        observer = new IntersectionObserver(([entry]) => scene?.setRunning(entry.isIntersecting));
        observer.observe(section);
      } catch {
        // WebGL not available: keep the SVG ring.
      }
    };

    // Load the 3D on the first touch / scroll / mouse move (or after 10 s without interaction),
    // so it never slows down the first display of the page on phones.
    const triggers = ["pointerdown", "pointermove", "touchstart", "scroll", "keydown", "wheel"] as const;
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      triggers.forEach((e) => window.removeEventListener(e, start));
      window.clearTimeout(timer);
      void load();
    };
    triggers.forEach((e) => window.addEventListener(e, start, { passive: true, once: true }));
    const timer = window.setTimeout(start, 10000);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      triggers.forEach((e) => window.removeEventListener(e, start));
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      observer?.disconnect();
      scene?.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="ring-canvas absolute inset-0 h-full w-full"
    />
  );
}
