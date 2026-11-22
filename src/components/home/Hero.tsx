import Image from "next/image";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import brandMark from "../../../public/brand/elsanour-mark.png";
import { CashIcon } from "../icons";

type Props = { locale: Locale; dict: Dictionary };

export function Hero({ locale, dict }: Props) {
  return (
    <section className="relative overflow-hidden">
      {/* Soft gold glow behind the logo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-10 left-1/2 size-[26rem] -translate-x-1/2 rounded-full bg-gold-500/10 blur-3xl md:left-auto md:end-10 md:translate-x-0"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 pt-10 pb-16 sm:px-6 md:grid-cols-2 md:gap-12 md:pt-16 md:pb-24">
        <div className="order-2 text-center md:order-1 md:text-start">
          <p className="text-sm font-semibold tracking-wide text-gold-400">{dict.hero.eyebrow}</p>
          <h1 className="mt-3 text-3xl leading-snug font-bold text-ivory sm:text-4xl md:text-5xl md:leading-tight">
            {dict.hero.title}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-8 text-muted md:mx-0 md:text-lg">
            {dict.hero.subtitle}
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 md:items-start">
            <a
              href={`/${locale}#packs`}
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

        <div className="order-1 flex justify-center md:order-2">
          <Image
            src={brandMark}
            alt=""
            preload
            sizes="(min-width: 768px) 300px, 170px"
            className="h-auto w-[170px] md:w-[300px]"
          />
        </div>
      </div>
    </section>
  );
}
