import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/site";
import { InstagramIcon } from "./icons";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { navLinks } from "./SiteHeader";
import { Wordmark } from "./Wordmark";

type Props = { locale: Locale; dict: Dictionary };

export function SiteFooter({ locale, dict }: Props) {
  const year = 2026;

  return (
    <footer id="contact" className="border-t border-gold-400/15 bg-noir-900">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <Wordmark gradientId="ring-footer" className="text-2xl tracking-[0.16em]" />
          <p className="mt-4 max-w-xs text-sm leading-7 text-muted">{dict.footer.about}</p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gold-300">{dict.footer.links}</h2>
          <ul className="mt-3 flex flex-col">
            {navLinks(locale, dict).map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="inline-flex min-h-11 items-center text-ivory/85 transition-colors hover:text-gold-300"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gold-300">{dict.footer.follow}</h2>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-11 items-center gap-2 text-ivory/85 transition-colors hover:text-gold-300"
          >
            <InstagramIcon />
            <span lang="en" dir="ltr">
              {INSTAGRAM_HANDLE}
            </span>
          </a>
          <LanguageSwitcher
            current={locale}
            label={dict.common.language}
            className="mt-4"
          />
        </div>
      </div>

      <div className="border-t border-white/5 px-4 py-5 text-center text-sm text-muted">
        <span lang="en" dir="ltr">
          © {year} Elsanour
        </span>{" "}
        · {dict.footer.rights}
      </div>
    </footer>
  );
}
