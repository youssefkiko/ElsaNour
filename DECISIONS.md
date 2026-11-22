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
15. **Ring O (final).** The owner chose the first ring drawing (two overlapping crescents: heavy left and right sides, hairlines at top and bottom, line-art diamond with a sparkle).
   As in the logo, the O of the wordmark is a gold ring with a diamond on top, drawn as an inline SVG in `src/components/Wordmark.tsx` so it stays sharp at every size.

## Phase 1: Layout and homepage

1. **Header and footer in the layout.** They appear on every page. The header is sticky; on mobile it shows the wordmark and a menu button, on desktop the links and the language switcher.
2. **Menu links point to sections of the home page** (`#packs`, `#why`, `#contact`). In Phase 2 the "Packs" link will point to the new packs page.
3. **Language switcher goes to the home page** of the other language. Keeping the same page when switching will be added in Phase 2, when there are more pages.
4. **Customer is addressed in the feminine** in Arabic (اكتشفي، تابعينا), since the customers are women.
5. **Placeholder packs.** Four example packs with names, contents and prices (249, 279 instead of 329, 349, 229 MAD) are placeholders. The cards show "ordering opens soon" and are not clickable yet. Real data comes in Phase 2.
6. **Prices** are shown as "249 درهم" (Arabic), "249 DH" (French), "249 MAD" (English).
7. **No phone number in the footer yet.** The store phone will come from the settings (Phase 5). For now the footer shows Instagram only.
8. **Smooth scrolling** uses Next.js 16's `data-scroll-behavior="smooth"` and `scroll-padding-top` so sections are not hidden under the sticky header.
9. **Images in AVIF/WebP** (`next.config.ts`) to keep the hero image small on mobile.
10. **Copyright year** is written as 2026 in the footer (a fixed value, to keep the page fully static).
11. **3D ring hero (owner decision, 2026-11-22).** Inspired by the scroll effect of a luxury jewelry landing page the owner showed us. We tried turning the logo woman into 3D (TRELLIS.2): the owner did not like the shape. Plan B, chosen by the owner: a gold ring with a diamond, built in code with **three.js** (no model file, no license to credit). It turns with the scroll; on phones it rises and the headline appears below, on wide screens it slides to the side and the headline appears on the other side. Our own code, not copied from the reference site.
12. **three.js loads late.** It loads on the first touch, scroll or mouse move (or after 10 seconds). Until then a static SVG ring is shown. This keeps Lighthouse mobile at about 87–97 locally (it dropped to 70 when three.js loaded during the test). It pauses when the hero is off screen, and the ring does not spin for people who ask their phone for reduced motion.
13. **Pack cards fly in from the sides in 3D** with pure CSS scroll-driven animations (no library). Browsers without support (e.g. older Firefox) just show the cards normally.
14. **The logo woman illustration is no longer in the hero.** The file stays in `public/brand/` for later use.
15. **REA (morluto/rea) not installed.** It is a reverse-engineering tool, not needed for the design. It can be added later if the owner wants.
16. **3D ring replaced by the logo woman (owner decision, 2026-11-22).** The owner did not like the 3D ring. The hero now shows the logo woman illustration with the same scroll behavior: it turns in 3D perspective (CSS `rotateY`), rises and shrinks on phones or slides to the side on wide screens, then the headline appears. Pure CSS driven by the scroll progress, so **three.js was removed** (items 11 and 12 above no longer apply).
17. **3 packs per row (owner request).** From 640px wide: 3 columns (side cards fly in from their side, the middle one from the depth). Phones under 640px keep 2 columns so the cards stay readable. Two more example packs were added (6 in total: 249, 279/329, 349, 229, 299, 259/309 MAD, all placeholders) so the rows are full.
18. **Categories instead of packs on the home page (owner decision, 2026-11-22).** The store now sells 5 categories: necklaces, earrings, rings, bracelets and gift packs. This extends the PRD (which only had packs). The home page shows 5 photo tiles with a white label (like a fashion store); clicking a tile opens `/[lang]/category/[slug]`. In Phase 1 that page only shows the category name and "coming soon"; the product list comes in Phase 2. The data model in Phase 2 will need a `category` field on products.
19. **Tile layout.** Desktop: 5 in a row. Tablet: 3 then 2. Phone: 2 per row, the packs tile takes the full last row. Each tile flies in from its side in 3D when scrolling. Tiles show a gold line icon until the owner sends one photo per category.
20. **Menu and hero button** now point to the collections ("المجموعات" / "تسوقي الآن"). Items 2 and 5 of Phase 1 are replaced by this.
