import Link from "next/link";

/** Admin: unknown order or product. */
export default function AdminNotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-4xl tracking-[0.2em] text-gold-300" dir="ltr">
        404
      </p>
      <h1 className="mt-4 font-heading text-2xl font-bold">غير موجود</h1>
      <p className="mt-2 text-sm text-muted">هذا الطلب أو المنتج غير موجود (ربما تم حذفه أو الرابط غير صحيح).</p>
      <div className="mt-6 flex gap-2">
        <Link href="/admin" className="min-h-11 border border-gold-400/50 px-5 text-sm leading-11 text-gold-200">
          الطلبات
        </Link>
        <Link href="/admin/products" className="min-h-11 border border-ivory/15 px-5 text-sm leading-11 text-ivory/80">
          المنتجات
        </Link>
      </div>
    </main>
  );
}
