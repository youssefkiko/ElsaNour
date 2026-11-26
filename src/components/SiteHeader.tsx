import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getCatalog, shopCollections } from "@/lib/catalog";
import { categoryHref } from "@/lib/categories";
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

/**
 * Header. Computers: two rows like a luxury catalog (owner request, after Tiffany's site):
 * logo, "Why Elsanour", contact, language and theme on top, then one link per collection
 * (only those with something to show, in the home order). Phones: the menu button lists
 * the collections too. Total height: 4rem on phones, 6.75rem from md (used by the hero).
 */
export async function SiteHeader({ locale, dict }: Props) {
  const collections = shopCollections(await getCatalog()).map(({ category }) => ({
    href: categoryHref(locale, category),
    label: dict.collections.items[category],
  }));
  const [home, , why, contact] = navLinks(locale, dict);

  return (
    <header className="sticky top-0 z-40 border-b border-gold-400/15 bg-noir-950/95">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href={`/${locale}`} className="inline-flex min-h-11 items-center">
          <Wordmark gradientId="ring-header" className="text-[1.35rem] tracking-[0.16em]" />
        </Link>

        <nav aria-label={dict.nav.label} className="hidden md:block">
          <ul className="flex items-center gap-1">
            {[why, contact].map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="inline-flex min-h-11 items-center px-4 text-sm font-semibold text-ivory transition-colors hover:text-gold-300"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <LanguageSwitcher current={locale} label={dict.common.language} className="hidden md:flex" />
          {/* Morning / evening switch, visible on every screen size */}
          <ThemeToggle label={dict.common.theme} />
          <MobileMenu
            links={[home, ...collections, why, contact]}
            navLabel={dict.nav.label}
            openLabel={dict.nav.openMenu}
            closeLabel={dict.nav.closeMenu}
            footer={<LanguageSwitcher current={locale} label={dict.common.language} />}
          />
        </div>
      </div>

      {/* Second row (computers): the collections, centered, thin gold line on hover */}
      {collections.length > 0 && (
        <nav aria-label={dict.nav.collections} className="hidden border-t border-gold-400/10 md:block">
          <ul className="mx-auto flex h-11 max-w-6xl items-center justify-center gap-6 px-6 lg:gap-10">
            {collections.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group relative inline-flex h-11 items-center text-sm font-semibold text-ivory transition-colors hover:text-gold-300 ltr:text-xs ltr:tracking-[0.14em] ltr:uppercase"
                >
                  {link.label}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-2 h-px origin-center scale-x-0 bg-gold-400 transition-transform duration-300 group-hover:scale-x-100"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
