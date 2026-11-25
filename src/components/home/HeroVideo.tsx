"use client";

import { useEffect, useRef } from "react";

type Props = { src: string; poster?: string; wideSrc?: string; widePoster?: string };

/** Same rule as the `wide:` variant in globals.css (computers and landscape tablets). */
const WIDE_MEDIA = "(min-width: 768px) and (min-aspect-ratio: 11/10)";

/**
 * Full-screen background video that plays by itself, muted, in a loop (owner choice:
 * it moves on its own, not with the scroll, and fills the whole screen).
 * Phones get the vertical video; wide screens the landscape one when there is one
 * (the browser picks the first <source> whose media matches).
 */
export function HeroVideo({ src, poster, wideSrc, widePoster }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    // The still image shown before the video starts matches the screen.
    if (wideSrc) {
      const still = window.matchMedia(WIDE_MEDIA).matches ? widePoster : poster;
      if (still) video.poster = still;
    }
    // Phones only autoplay a muted video; React does not write the muted attribute in the HTML.
    video.muted = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    video.play().catch(() => {
      // Autoplay blocked (e.g. battery saver): start on the first touch.
      const start = () => video.play().catch(() => {});
      window.addEventListener("touchstart", start, { once: true, passive: true });
    });
  }, [poster, wideSrc, widePoster]);

  return (
    <video
      ref={ref}
      poster={wideSrc ? undefined : poster}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      aria-hidden="true"
      tabIndex={-1}
      className="absolute inset-0 h-full w-full object-cover"
    >
      {wideSrc && <source src={wideSrc} type="video/mp4" media={WIDE_MEDIA} />}
      <source src={src} type="video/mp4" />
    </video>
  );
}
