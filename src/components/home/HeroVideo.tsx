"use client";

import { useEffect, useRef } from "react";

type Props = { src: string; poster?: string; wideSrc?: string; widePoster?: string };

/** Same rule as the `wide:` variant in globals.css (computers and landscape tablets). */
const WIDE_MEDIA = "(min-width: 768px) and (min-aspect-ratio: 11/10)";

/**
 * Scroll-scrubbed video: scrolling down plays the video forward, scrolling up plays it back.
 * It reads the hero progress --p (set by HeroScroll) and eases the video time towards it.
 * The video must be encoded with frequent keyframes for smooth seeking (see DECISIONS.md).
 *
 * With a mouse (computers), the diamond also follows the pointer: it drifts and tilts in 3D
 * towards the mouse, and comes back to the center when the mouse leaves.
 */
export function HeroVideo({ src, poster, wideSrc, widePoster }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  // With two versions, the still image shown before the video loads matches the screen.
  useEffect(() => {
    const video = ref.current;
    if (!video || !wideSrc) return;
    const still = window.matchMedia(WIDE_MEDIA).matches ? widePoster : poster;
    if (still) video.poster = still;
  }, [poster, wideSrc, widePoster]);

  useEffect(() => {
    const video = ref.current;
    const tilt = tiltRef.current;
    const section = video?.closest("section");
    if (!video || !tilt || !section) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let current = 0;
    let raf = 0;
    let visible = true;
    // Mouse follow: target (tx, ty) and smoothed (mx, my) positions, from -1 to 1.
    let tx = 0;
    let ty = 0;
    let mx = 0;
    let my = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;

      if (video.duration && !video.seeking) {
        const p = parseFloat(section.style.getPropertyValue("--p")) || 0;
        // The video plays during the first 85% of the hero, then holds its last frame.
        const target = Math.min(1, p / 0.85) * (video.duration - 0.05);
        current += (target - current) * (reducedMotion ? 1 : 0.18);
        if (Math.abs(video.currentTime - current) > 1 / 30) video.currentTime = current;
      }

      if (hasMouse && !reducedMotion) {
        mx += (tx - mx) * 0.08;
        my += (ty - my) * 0.08;
        tilt.style.transform = `translate3d(${(mx * 4).toFixed(3)}vw, ${(my * 3).toFixed(3)}vh, 0) rotateY(${(mx * 18).toFixed(2)}deg) rotateX(${(-my * 14).toFixed(2)}deg)`;
      }
    };
    raf = requestAnimationFrame(tick);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const rect = section.getBoundingClientRect();
      if (e.clientY < rect.top || e.clientY > rect.bottom) {
        tx = ty = 0;
        return;
      }
      tx = Math.max(-1, Math.min(1, (e.clientX / window.innerWidth) * 2 - 1));
      ty = Math.max(-1, Math.min(1, (e.clientY / window.innerHeight) * 2 - 1));
    };
    const onLeave = () => {
      tx = ty = 0;
    };
    if (hasMouse && !reducedMotion) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }

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
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className="absolute inset-0" style={{ perspective: "1200px" }}>
      <div ref={tiltRef} className="absolute inset-0 will-change-transform">
        {/* Wide screens get the landscape version when there is one (the browser picks
            the first <source> whose media matches); phones keep the vertical video. */}
        <video
          ref={ref}
          poster={wideSrc ? undefined : poster}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 h-full w-full object-contain"
        >
          {wideSrc && <source src={wideSrc} type="video/mp4" media={WIDE_MEDIA} />}
          <source src={src} type="video/mp4" />
        </video>
      </div>
    </div>
  );
}
