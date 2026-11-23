"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Template for the dots' labels, e.g. "الصورة {n} من {total}". */
  photoLabel: string;
};

/**
 * Swipeable gallery: native horizontal scroll with snap (smooth on phones, works in RTL),
 * dots that show the current photo and jump to a photo when tapped.
 */
export function ProductGallery({ children, photoLabel }: Props) {
  const slides = Children.toArray(children);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { root: track, threshold: 0.6 },
    );
    track.querySelectorAll("[data-index]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const goTo = (i: number) => {
    const slide = trackRef.current?.querySelector<HTMLElement>(`[data-index="${i}"]`);
    slide?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };

  return (
    <div>
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide, i) => (
          <div key={i} data-index={i} className="relative aspect-[4/5] w-full shrink-0 snap-start overflow-hidden">
            {slide}
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <div className="mt-3 flex justify-center gap-1">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={photoLabel.replace("{n}", String(i + 1)).replace("{total}", String(slides.length))}
              aria-current={i === active ? "true" : undefined}
              className="flex size-11 items-center justify-center"
            >
              <span
                className={`block h-2 rounded-full transition-all ${i === active ? "w-6 bg-gold-400" : "w-2 bg-gold-400/30"}`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
