# Decisions and assumptions

Every assumption made while building is recorded here, newest at the bottom of each phase.

## Phase 0: Foundation

1. **Three languages from the start (owner decision, 2026-11-22).** The owner chose Arabic, French and English. Arabic is the default and is RTL; French and English are LTR. This replaces the PRD line "French may be added later".
2. **Language in the URL.** Each page lives under `/ar`, `/fr` or `/en`. Visiting `/` redirects to `/ar`. No automatic detection from the browser language yet, so ad links always land in Arabic unless they point to `/fr` or `/en`.
3. **No i18n library.** Translations are plain JSON files loaded on the server, following the official Next.js guide. This keeps the site light; a library like `next-intl` can be added later if needed.
4. **Arabic register.** Website text uses simple Modern Standard Arabic. The owner can ask to switch any text to Darija.
5. **Fonts (temporary).** Cairo for all text (supports Arabic and Latin) and Cormorant Garamond for the "Elsanour" wordmark. The owner will confirm fonts after seeing the full design.
6. **Brand colors (temporary).** Emerald green `#06372a` / `#0b5d45` and gold `#c9a24b`, to be adjusted to the official logo once provided.
7. **No dark mode.** The brand look stays the same on every device.
8. **Project folder.** The app lives in `elsanour-store/` inside the owner's folder (the PRD PDF stays outside the app). The folder is inside OneDrive; if syncing `node_modules` becomes slow, the project can be moved outside OneDrive.
9. **Domain.** Phase 0 uses the free Vercel URL. A custom domain will be bought later (Phase 8).
10. **Git author.** Commits use a local placeholder author (`Elsanour`) until the owner's GitHub account exists.
11. **Instagram link.** `https://www.instagram.com/elsanour.ma/` (from the PRD).
12. **New logo, black and gold (owner decision, 2026-11-22).** The owner provided a new logo (black and gold) and asked to follow it. This replaces the PRD's emerald green: the site now uses black (`noir-*`, main `#070707`) and metallic gold (`gold-*`, main `#d4a64a`). Items 5 and 6 above are replaced by this entry and the next one.
13. **Logo mark.** The logo was provided as a JPG mockup on a fabric background, not a clean file. The illustration (woman and hands) was extracted to `public/brand/elsanour-mark.png` with a transparent background. It only looks right on dark backgrounds. A clean vector (SVG) or transparent PNG from the designer is still needed for light backgrounds, printing and sharp small sizes.
14. **Wordmark font.** The owner did not like the font of the name in the logo and let us choose. "Elsanour" is now written in code with **Bodoni Moda** (high-contrast fashion serif), uppercase with wide letter spacing and a metallic gold gradient. Body text stays Cairo for now.
