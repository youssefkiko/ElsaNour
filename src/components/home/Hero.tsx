import Image from "next/image";
import type { CSSProperties } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import brandMark from "../../../public/brand/elsanour-mark.png";
import { CashIcon } from "../icons";
import { HeroScroll } from "./HeroScroll";

type Props = { locale: Locale; dict: Dictionary };

/**
 * Scroll-driven hero: a tall section with a pinned stage.
 * The logo woman turns in 3D perspective as you scroll and makes room,
 * then the headline and button fade in.
 * Everything reads the CSS variable --p (0 to 1) set by HeroScroll (see globals.css).
 */
export function Hero({ locale, dict }: Props) {
  return (
    <section className="scroll-hero relative h-[230svh]" style={{ "--p": 0 } as CSSProperties}>
      <HeroScroll />
      <div className="sticky top-16 h-[calc(100svh-4rem)] overflow-hidden">
        {/* Gold glow behind the figure, it grows a little with the scroll */}
        <div
          aria-hidden="true"
          className="hero-glow absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,color-mix(in_oklab,var(--color-gold-500)_18%,transparent),transparent_55%)]"
        />

        {/* The logo woman: turns in perspective, rises (phones) or slides aside (wide screens) */}
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

        {/* Intro labels, visible before scrolling (like a cover) */}
        <div className="hero-intro pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-5 pb-6 text-xs tracking-wide sm:px-10 sm:pb-10 sm:text-sm">
          <p className="max-w-[12rem] text-gold-300/90">{dict.hero.eyebrow}</p>
          <p className="flex flex-col items-center gap-2 text-ivory/70">
            {dict.hero.scroll}
            <span aria-hidden="true" className="scroll-cue block h-8 w-px bg-gold-400/70" />
          </p>
        </div>

        {/* Headline and main button, fading in with the scroll */}
        <div className="hero-copy absolute inset-0 flex flex-col justify-end px-4 pb-8 text-center sm:pb-14 wide:items-start wide:justify-center wide:ps-12 wide:pb-0 wide:text-start lg:wide:ps-24">
          <div className="wide:max-w-md lg:wide:max-w-xl">
          <h1 className="mx-auto max-w-2xl text-3xl leading-snug font-bold text-ivory sm:text-5xl sm:leading-tight wide:mx-0">
            {dict.hero.title}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted sm:text-lg wide:mx-0">
            {dict.hero.subtitle}
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 wide:items-start">
            <a
              href={`/${locale}#collections`}
              className="inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-full bg-gold-400 px-8 text-base font-bold text-noir-950 shadow-[0_8px_30px_-8px] shadow-gold-400/50 transition-colors hover:bg-gold-300 sm:w-auto"
            >
              {dict.hero.cta}
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
