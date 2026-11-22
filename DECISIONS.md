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
