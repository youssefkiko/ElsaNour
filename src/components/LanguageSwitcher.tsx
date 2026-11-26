"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localeNames, locales, type Locale } from "@/i18n/config";

type Props = {
  current: Locale;
  label: string;
  className?: string;
};

/** Switches language and stays on the same page (e.g. /ar/product/x → /fr/product/x). */
export function LanguageSwitcher({ current, label, className = "" }: Props) {
  const pathname = usePathname() ?? `/${current}`;
  const rest = pathname.replace(/^\/(ar|fr|en)(?=\/|$)/, "");

  return (
    <nav aria-label={label} className={`flex items-center gap-1 ${className}`}>
      {locales.map((locale) => {
        const isCurrent = locale === current;
        return (
          <Link
            key={locale}
            href={`/${locale}${rest}`}
            hrefLang={locale}
            lang={locale}
            aria-current={isCurrent ? "page" : undefined}
            className={
              isCurrent
                ? "gem gem-chip min-h-11 items-center"
                : "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 text-sm font-semibold text-ivory transition-colors hover:bg-gold-400/10"
            }
          >
            {isCurrent ? (
              <span className="gem-face text-sm">{localeNames[locale]}</span>
            ) : (
              localeNames[locale]
            )}
          </Link>
        );
      })}
    </nav>
  );
}
