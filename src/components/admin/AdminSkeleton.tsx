/** Quiet placeholder while the admin page checks the login and loads the orders. */
export function AdminSkeleton() {
  return (
    <div aria-busy="true" aria-label="جارٍ التحميل" className="mx-auto w-full max-w-4xl px-4 pt-6">
      <div className="h-16 border-b border-gold-400/15" />
      <div className="mt-6 h-8 w-40 animate-pulse bg-noir-800" />
      <div className="mt-6 flex flex-col gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse border border-ivory/5 bg-noir-900" />
        ))}
      </div>
    </div>
  );
}
