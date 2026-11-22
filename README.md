# Elsanour Online Store

Online store for **Elsanour**, a Moroccan fashion-jewelry brand (gift-boxed packs, cash on delivery).

- Framework: Next.js 16 (App Router) + TypeScript
- Styling: Tailwind CSS 4, mobile-first
- Languages: Arabic (default, RTL), French and English (LTR)
- Hosting: Vercel
- Database / auth / images (from Phase 3): Supabase

## Run it on your computer

You need [Node.js](https://nodejs.org) (version 20 or newer) and Git.

```bash
npm install
npm run dev
```

Then open http://localhost:3000 in your browser. You are sent to `/ar` (Arabic).
The French and English versions are at `/fr` and `/en`.

Other commands:

| Command         | What it does                                     |
| --------------- | ------------------------------------------------ |
| `npm run build` | Builds the production version (checks for errors) |
| `npm run start` | Runs the production build locally                |
| `npm run lint`  | Checks the code style                            |

## Project structure

```
src/
  app/[lang]/        Pages. [lang] is ar, fr or en.
  app/globals.css    Brand colors and fonts (design tokens)
  components/        Reusable UI pieces
  i18n/              Language settings and translations
    dictionaries/    ar.json, fr.json, en.json (all website text)
  proxy.ts           Redirects "/" to "/ar"
public/
  brand/             Logo files (provided by the owner)
  products/          Product photos (provided by the owner)
```

## Changing text on the website

All visible text is in `src/i18n/dictionaries/`. Edit the same key in `ar.json`, `fr.json` and `en.json`.

## Brand colors

Defined in `src/app/globals.css` under `@theme`:

- `noir-*`: deep black (`noir-950` is the page background)
- `gold-*`: metallic gold (`gold-400` is the main gold)
- `ivory`: light text / light sections

Fonts: Cairo for all text, Bodoni Moda for the "Elsanour" wordmark.
The logo illustration is `public/brand/elsanour-mark.png` (made for dark backgrounds).

## Environment variables

Secrets are never committed. Copy `.env.example` to `.env.local` and fill in the values.
Each variable is documented in `.env.example`.

## Phases

Each phase ends with a git commit and a tag (`phase-0`, `phase-1`, ...).
To see a past phase: `git checkout phase-0`. To come back: `git checkout main`.

Assumptions and decisions are recorded in [DECISIONS.md](DECISIONS.md).
