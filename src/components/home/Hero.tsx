import Image from "next/image";
import type { CSSProperties } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getHeroVideo } from "@/lib/heroVideo";
import brandMark from "../../../public/brand/elsanour-mark.png";
import { CashIcon } from "../icons";
import { HeroScroll } from "./HeroScroll";
import { HeroVideo } from "./HeroVideo";

type Props = { locale: Locale; dict: Dictionary };

/**
 * Scroll-driven hero: a tall section with a pinned stage.
 * - With a hero video: the video plays with the scroll inside a frame that tilts in 3D.
 * - Without: the logo woman turns in 3D perspective as you scroll.
 * Then the headline and button fade in.
 * Everything reads the CSS variable --p (0 to 1) set by HeroScroll (see globals.css).
 */
export function Hero({ locale, dict }: Props) {
  const video = getHeroVideo();

  // Phones: shorter scroll (customers come from ads and want to shop fast). Wide screens: a bit longer.
  return (
    <section data-theme="dark" className="scroll-hero relative h-[190svh] wide:h-[240svh] bg-noir-950 text-ivory" style={{ "--p": 0 } as CSSProperties}>
      <HeroScroll />
      {/* With a video: pure black stage, the same black as the studio video, so there is no visible edge */}
      <div className={`sticky top-16 h-[calc(100svh-4rem)] overflow-hidden ${video ? "bg-black" : ""}`}>
        {!video && (
          /* Gold glow behind the figure, it grows a little with the scroll */
          <div
            aria-hidden="true"
            className="hero-glow absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,color-mix(in_oklab,var(--c-gold-500)_18%,transparent),transparent_55%)]"
          />
        )}

        {video ? (
          /* The video turns with the scroll (360° ring = 3D feel); it rises (phones) or slides aside (wide screens) */
          <div className="hero-stage absolute inset-0 flex items-center justify-center">
            <div className="hero-video-frame relative overflow-hidden">
              <HeroVideo src={video.src} poster={video.poster} />
              {/* Darken the bottom so the text stays readable */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-linear-to-t from-black/85 via-black/10 to-transparent wide:hidden"
              />
              <div aria-hidden="true" className="hero-video-shade absolute inset-0 hidden wide:block" />
            </div>
          </div>
        ) : (
          /* The logo woman: turns in perspective, rises (phones) or slides aside (wide screens) */
          <div className="hero-stage absolute inset-0 flex items-center justify-center pb-[6svh]">
            <div className="hero-figure">
              <div className="hero-float">
                <Image
                  src={brandMark}
                  alt=""
                  preload
                  sizes="(min-width: 768px) 360px, 70vw"
                  className="h-auto w-[68vw] max-w-[300px] wide:w-auto wide:max-w-none wide:h-[min(64svh,520px)]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Intro labels, visible before scrolling (like a cover) */}
        <div className="hero-intro pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-5 pb-6 text-sm ltr:tracking-wide sm:px-10 sm:pb-10">
          <p className="max-w-[12rem] text-gold-300/90">{dict.hero.eyebrow}</p>
          <p className="flex flex-col items-center gap-2 text-ivory/70">
            {dict.hero.scroll}
            <span aria-hidden="true" className="scroll-cue block h-8 w-px bg-gold-400/70" />
          </p>
        </div>

        {/* Headline and main button, fading in with the scroll */}
        <div className="hero-copy absolute inset-0 flex flex-col justify-end px-4 pb-8 text-center sm:pb-14 wide:items-start wide:justify-center wide:ps-12 wide:pb-0 wide:text-start lg:wide:ps-24">
          <div className="wide:max-w-md lg:wide:max-w-xl">
          <h1 className="mx-auto max-w-2xl font-heading text-3xl leading-snug font-bold text-ivory sm:text-5xl sm:leading-tight wide:mx-0">
            {dict.hero.title}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted sm:text-lg wide:mx-0">
            {dict.hero.subtitle}
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 wide:items-start">
            <a
              href={`/${locale}#collections`}
              className="gem w-full max-w-xs sm:w-auto"
            >
              <span className="gem-face text-base">{dict.hero.cta}</span>
            </a>
            <p className="inline-flex items-center gap-2 text-sm text-gold-200/80">
              <CashIcon className="size-5" />
              {dict.hero.note}
            </p>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
