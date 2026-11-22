import Link from "next/link";
import { localeNames, locales, type Locale } from "@/i18n/config";

type Props = {
  current: Locale;
  label: string;
  className?: string;
};

export function LanguageSwitcher({ current, label, className = "" }: Props) {
  return (
    <nav aria-label={label} className={`flex items-center gap-1 ${className}`}>
      {locales.map((locale) => {
        const isCurrent = locale === current;
        return (
          <Link
            key={locale}
            href={`/${locale}`}
            hrefLang={locale}
            lang={locale}
            aria-current={isCurrent ? "page" : undefined}
            className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 text-sm transition-colors ${
              isCurrent
                ? "bg-cta font-semibold text-on-cta"
                : "text-ivory/85 hover:bg-white/10"
            }`}
          >
            {localeNames[locale]}
          </Link>
        );
      })}
    </nav>
  );
}
