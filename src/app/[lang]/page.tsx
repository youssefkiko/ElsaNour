import Image from "next/image";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Wordmark } from "@/components/Wordmark";
import { getDictionary } from "@/i18n/dictionaries";
import brandMark from "../../../public/brand/elsanour-mark.png";

const INSTAGRAM_URL = "https://www.instagram.com/elsanour.ma/";

// Phase 0 placeholder home page: logo, brand colors, fonts and RTL check.
export default async function HomePage() {
  const { locale, dict } = await getDictionary();

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-noir-950">
      {/* Soft gold glow behind the logo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/4 mx-auto size-[28rem] rounded-full bg-gold-500/10 blur-3xl"
      />

      <header className="relative flex justify-end px-4 pt-4 sm:px-8">
        <LanguageSwitcher current={locale} label={dict.common.language} />
      </header>

      <main className="relative flex flex-1 flex-col items-center justify-center px-4 pt-6 pb-16 text-center">
        <Image
          src={brandMark}
          alt=""
          preload
          sizes="(min-width: 640px) 200px, 150px"
          className="h-auto w-[150px] sm:w-[200px]"
        />

        <Wordmark className="mt-6 font-display text-[2.6rem] leading-none font-medium tracking-[0.18em] sm:text-6xl" />

        <div aria-hidden="true" className="mt-6 flex items-center gap-3">
          <span className="h-px w-12 bg-gold-400/60" />
          <span className="size-1.5 rotate-45 bg-gold-400" />
          <span className="h-px w-12 bg-gold-400/60" />
        </div>

        <h1 className="mt-6 max-w-md text-2xl leading-relaxed font-semibold text-ivory sm:text-3xl">
          {dict.home.tagline}
        </h1>

        <p className="mt-3 text-lg text-gold-300">{dict.home.comingSoon}</p>

        <p className="mt-10 max-w-sm text-sm leading-7 text-muted">
          {dict.home.trust}
        </p>

        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border border-gold-400 px-6 font-semibold text-gold-300 transition-colors hover:bg-gold-400 hover:text-noir-950"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
          </svg>
          {dict.home.instagram}
          <span lang="en" dir="ltr" className="hidden text-sm opacity-80 sm:inline">
            @elsanour.ma
          </span>
        </a>
      </main>
    </div>
  );
}
