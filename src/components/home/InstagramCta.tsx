import type { Dictionary } from "@/i18n/dictionaries";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/site";
import { InstagramIcon } from "../icons";

export function InstagramCta({ dict }: { dict: Dictionary }) {
  return (
    <section className="px-4 pb-16 sm:px-6 md:pb-24">
      <div className="mx-auto max-w-3xl rounded-3xl border border-gold-400/25 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklab,var(--color-gold-500)_18%,transparent),transparent_70%)] px-6 py-10 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-gold-400 text-noir-950">
          <InstagramIcon className="size-7" />
        </span>
        <h2 className="mt-5 text-2xl font-bold text-ivory">{dict.instagram.title}</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-muted">{dict.instagram.text}</p>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full border border-gold-400 px-6 font-semibold text-gold-300 transition-colors hover:bg-gold-400 hover:text-noir-950"
        >
          {dict.instagram.cta}
          <span lang="en" dir="ltr" className="text-sm opacity-80">
            {INSTAGRAM_HANDLE}
          </span>
        </a>
      </div>
    </section>
  );
}
