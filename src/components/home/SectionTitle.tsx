export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="reveal-up text-center">
      <h2 className="font-heading text-2xl font-bold text-ivory sm:text-3xl">{title}</h2>
      <div aria-hidden="true" className="mt-4 flex items-center justify-center gap-3">
        <span className="h-px w-10 bg-gold-400/60" />
        <span className="size-1.5 rotate-45 bg-gold-400" />
        <span className="h-px w-10 bg-gold-400/60" />
      </div>
      {subtitle && (
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted sm:text-base">{subtitle}</p>
      )}
    </div>
  );
}
