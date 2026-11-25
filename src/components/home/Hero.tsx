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
 * With a hero video (owner choice, 2026-11-26): the video fills the whole first screen and
 * plays by itself in a loop; the headline and button sit on top, visible at once.
 * Phones: text at the bottom over a dark fade. Wide screens: text on the start side.
 */
function VideoHero({
  locale,
  dict,
  video,
}: Props & { video: NonNullable<ReturnType<typeof getHeroVideo>> }) {
  return (
    <section data-theme="dark" className="relative h-[calc(100svh-4rem)] min-h-[30rem] overflow-hidden bg-black text-ivory">
      <HeroVideo src={video.src} poster={video.poster} wideSrc={video.wideSrc} widePoster={video.widePoster} />
      {/* Dark fades so the text stays readable on any frame of the video */}
      <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent wide:hidden" />
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden wide:block ltr:bg-linear-to-r rtl:bg-linear-to-l from-black/80 via-black/35 to-transparent"
      />

      <div className="absolute inset-0 flex flex-col justify-end px-4 pb-10 text-center sm:pb-14 wide:items-start wide:justify-center wide:ps-12 wide:pb-0 wide:text-start lg:wide:ps-24">
        <div className="wide:max-w-md lg:wide:max-w-xl">
          <p className="text-sm text-gold-300/90 ltr:tracking-wide">{dict.hero.eyebrow}</p>
          <h1 className="mx-auto mt-3 max-w-2xl font-heading text-3xl leading-snug font-bold text-ivory sm:text-5xl sm:leading-tight wide:mx-0">
            {dict.hero.title}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-ivory/75 sm:text-lg wide:mx-0">{dict.hero.subtitle}</p>
          <div className="mt-6 flex flex-col items-center gap-3 wide:items-start">
            <a href={`/${locale}#collections`} className="gem w-full max-w-xs sm:w-auto">
              <span className="gem-face text-base">{dict.hero.cta}</span>
            </a>
            <p className="inline-flex items-center gap-2 text-sm text-gold-200/80">
              <CashIcon className="size-5" />
              {dict.hero.note}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Without a hero video: a tall scroll-driven section with a pinned stage, where the logo
 * woman turns in 3D perspective as you scroll.
 * Then the headline and button fade in.
 * Everything reads the CSS variable --p (0 to 1) set by HeroScroll (see globals.css).
 */
export function Hero({ locale, dict }: Props) {
  const video = getHeroVideo();
  if (video) return <VideoHero locale={locale} dict={dict} video={video} />;

  // Phones: shorter scroll (customers come from ads and want to shop fast). Wide screens: a bit longer.
  return (
    <section data-theme="dark" className="scroll-hero relative h-[190svh] wide:h-[240svh] bg-noir-950 text-ivory" style={{ "--p": 0 } as CSSProperties}>
      <HeroScroll />
      <div className="sticky top-16 h-[calc(100svh-4rem)] overflow-hidden">
        {/* Gold glow behind the figure, it grows a little with the scroll */}
        <div
          aria-hidden="true"
          className="hero-glow absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,color-mix(in_oklab,var(--c-gold-500)_18%,transparent),transparent_55%)]"
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
