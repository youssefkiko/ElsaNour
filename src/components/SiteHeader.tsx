import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";
import { ThemeToggle } from "./ThemeToggle";
import { Wordmark } from "./Wordmark";

type Props = { locale: Locale; dict: Dictionary };

export function navLinks(locale: Locale, dict: Dictionary) {
  return [
    { href: `/${locale}`, label: dict.common.home },
    { href: `/${locale}#collections`, label: dict.nav.collections },
    { href: `/${locale}#why`, label: dict.nav.why },
    { href: `/${locale}/contact`, label: dict.nav.contact },
  ];
}

export function SiteHeader({ locale, dict }: Props) {
  const links = navLinks(locale, dict);

  return (
    <header className="sticky top-0 z-40 border-b border-gold-400/15 bg-noir-950/95">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href={`/${locale}`}
          className="inline-flex min-h-11 items-center"
        >
          <Wordmark gradientId="ring-header" className="text-[1.35rem] tracking-[0.16em]" />
        </Link>

        <nav aria-label={dict.nav.label} className="hidden md:block">
          <ul className="flex items-center gap-1">
            {links.slice(1).map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="inline-flex min-h-11 items-center rounded-full px-4 text-sm text-ivory/85 transition-colors hover:text-gold-300"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <LanguageSwitcher
            current={locale}
            label={dict.common.language}
            className="hidden md:flex"
          />
          {/* Morning / evening switch, visible on every screen size */}
          <ThemeToggle label={dict.common.theme} />
          <MobileMenu
            links={links}
            navLabel={dict.nav.label}
            openLabel={dict.nav.openMenu}
            closeLabel={dict.nav.closeMenu}
            footer={<LanguageSwitcher current={locale} label={dict.common.language} />}
          />
        </div>
      </div>
    </header>
  );
}
