import type { Dictionary } from "@/i18n/dictionaries";
import { REVIEWS, type Review } from "@/data/reviews";
import { fill } from "@/lib/site";
import { SectionTitle } from "./SectionTitle";

/**
 * "What our customers say": a strip of real customer reviews that moves slowly by itself
 * (owner request) and stops while the finger or mouse is on it. Reviews come from
 * src/data/reviews.ts (real ones only); the section is hidden until there are at least 3.
 */
export function Reviews({ dict, reviews = REVIEWS }: { dict: Dictionary; reviews?: Review[] }) {
  if (reviews.length < 3) return null;
  // The list is shown twice in a row, so the strip loops without a visible jump.
  const loop = [...reviews, ...reviews];

  return (
    <section aria-labelledby="reviews-title" className="overflow-x-clip border-t border-gold-400/10 py-16 md:py-24">
      <div id="reviews-title" className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle title={dict.reviews.title} subtitle={dict.reviews.subtitle} />
      </div>

      <div className="reviews-marquee mt-10" style={{ ["--duration" as string]: `${Math.max(30, reviews.length * 8)}s` }}>
        <ul className="reviews-track flex w-max items-start gap-4 sm:gap-6">
          {loop.map((r, i) => (
            <li
              key={i}
              aria-hidden={i >= reviews.length || undefined}
              className={`flex shrink-0 flex-col border border-gold-400/20 bg-noir-900/60 ${
                r.image ? "w-64 gap-3 self-start p-3 sm:w-72" : "w-72 gap-4 p-6 sm:w-80"
              }`}
            >
              {r.rating ? (
                <p aria-label={`${r.rating}/5`} className="text-sm tracking-[0.2em] text-gold-300">
                  {"★".repeat(Math.round(r.rating))}
                  <span className="text-gold-300/25">{"★".repeat(5 - Math.round(r.rating))}</span>
                </p>
              ) : null}
              {r.image ? (
                // Screenshot of the real conversation (owner choice); the words are its description.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.image} alt={r.text} decoding="async" className="block h-auto w-full rounded-sm ring-1 ring-black/10" />
              ) : (
                // The customer's own words, in the script she wrote them (often Darija in Latin letters).
                <blockquote dir="auto" className="flex-1 text-base leading-7 text-ivory">“{r.text}”</blockquote>
              )}
              <footer className="text-sm">
                <p className="font-semibold text-gold-200">
                  <bdi>{r.name}</bdi>
                  {r.city && <span className="font-normal text-muted"> · {r.city}</span>}
                </p>
                {r.source && <p className="mt-1 text-xs text-muted">{fill(dict.reviews.via, { source: r.source })}</p>}
                {r.product && <p className="mt-1 text-xs text-muted">{r.product}</p>}
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
