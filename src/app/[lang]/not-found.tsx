import Link from "next/link";
import { RingMark } from "@/components/Wordmark";
import { getDictionary } from "@/i18n/dictionaries";

// Friendly 404 page, shown inside the site layout (header and footer).
export default async function NotFound() {
  const { locale, dict } = await getDictionary();

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <RingMark gradientId="ring-404" className="h-auto w-24 opacity-90" />
      <p lang="en" className="mt-6 font-display text-5xl tracking-[0.2em] text-gold-300">
        404
      </p>
      <h1 className="mt-4 font-heading text-2xl font-bold text-ivory sm:text-3xl">{dict.notFound.title}</h1>
      <p className="mt-3 text-base leading-8 text-muted">{dict.notFound.text}</p>
      <Link
        href={`/${locale}`}
        className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-cta px-8 font-bold text-on-cta transition-colors hover:bg-cta-hover"
      >
        {dict.notFound.back}
      </Link>
    </div>
  );
}
