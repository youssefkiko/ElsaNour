import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getDictionary } from "@/i18n/dictionaries";

const INSTAGRAM_URL = "https://www.instagram.com/elsanour.ma/";

// Phase 0 placeholder home page: brand name, colors, font and RTL check.
export default async function HomePage() {
  const { locale, dict } = await getDictionary();

  return (
    <div className="flex flex-1 flex-col bg-brand-900 text-brand-50">
      <header className="flex justify-end px-4 pt-4 sm:px-8">
        <LanguageSwitcher current={locale} label={dict.common.language} />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <p
          lang="en"
          className="font-display text-6xl font-semibold tracking-wide text-gold-400 sm:text-7xl"
        >
          Elsanour
        </p>

        <div aria-hidden="true" className="mt-6 flex items-center gap-3">
          <span className="h-px w-12 bg-gold-400/60" />
          <span className="size-1.5 rotate-45 bg-gold-400" />
          <span className="h-px w-12 bg-gold-400/60" />
        </div>

        <h1 className="mt-6 max-w-md text-2xl leading-relaxed font-semibold sm:text-3xl">
          {dict.home.tagline}
        </h1>

        <p className="mt-4 text-lg text-gold-300">{dict.home.comingSoon}</p>

        <p className="mt-10 max-w-sm text-sm leading-7 text-brand-100">
          {dict.home.trust}
        </p>

        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border border-gold-400 px-6 font-semibold text-gold-300 transition-colors hover:bg-gold-400 hover:text-brand-950"
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
