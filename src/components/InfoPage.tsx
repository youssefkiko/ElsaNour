import type { ReactNode } from "react";

/** Layout of the information pages (delivery, returns, about, contact). */
export function InfoPage({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="text-center">
        <h1 className="font-heading text-3xl font-bold text-ivory sm:text-4xl">{title}</h1>
        <div aria-hidden="true" className="mt-4 flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-gold-400/60" />
          <span className="size-1.5 rotate-45 bg-gold-400" />
          <span className="h-px w-10 bg-gold-400/60" />
        </div>
        {intro && <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-muted">{intro}</p>}
      </header>
      <div className="mt-10 flex flex-col gap-4">{children}</div>
    </div>
  );
}

/** One block of an information page. */
export function InfoSection({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <section className="border border-gold-400/15 bg-noir-800 p-5 sm:p-6">
      <h2 className="flex items-center gap-2.5 font-heading text-xl font-bold text-ivory">
        {icon && <span className="text-gold-300">{icon}</span>}
        {title}
      </h2>
      <div className="mt-3 text-base leading-8 text-ivory/85">{children}</div>
    </section>
  );
}
