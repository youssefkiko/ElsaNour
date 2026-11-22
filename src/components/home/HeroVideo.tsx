"use client";

import { useEffect, useRef } from "react";

type Props = { src: string; poster?: string };

/**
 * Scroll-scrubbed video: scrolling down plays the video forward, scrolling up plays it back.
 * It reads the hero progress --p (set by HeroScroll) and eases the video time towards it.
 * The video must be encoded with frequent keyframes for smooth seeking (see DECISIONS.md).
 */
export function HeroVideo({ src, poster }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    const section = video?.closest("section");
    if (!video || !section) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let current = 0;
    let raf = 0;
    let visible = true;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible || !video.duration || video.seeking) return;
      const p = parseFloat(section.style.getPropertyValue("--p")) || 0;
      // The video plays during the first 85% of the hero, then holds its last frame.
      const target = Math.min(1, p / 0.85) * (video.duration - 0.05);
      current += (target - current) * (reducedMotion ? 1 : 0.18);
      if (Math.abs(video.currentTime - current) > 1 / 30) video.currentTime = current;
    };
    raf = requestAnimationFrame(tick);

    const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    observer.observe(section);

    // Some phones (iOS) only allow seeking after the video has been "played" once.
    const unlock = () => {
      video.play().then(() => video.pause()).catch(() => {});
    };
    window.addEventListener("touchstart", unlock, { once: true, passive: true });

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      playsInline
      preload="auto"
      disablePictureInPicture
      aria-hidden="true"
      tabIndex={-1}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}
