import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSkeleton } from "@/components/admin/AdminSkeleton";
import { ProductPlaceholder } from "@/components/catalog/ProductPlaceholder";
import ar from "@/i18n/dictionaries/ar.json";
import { requireAdmin } from "@/lib/admin";
import { listAllProducts } from "@/lib/adminProducts";
import { categories } from "@/lib/categories";
import { formatPrice } from "@/lib/site";
import { mainImage } from "@/data/products";
import { moveProduct, toggleProduct } from "./actions";

export const metadata: Metadata = { title: "المنتجات" };

// Products by collection: add, edit, show / hide, in stock / out of stock, order.
export default function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <ProductsView searchParams={searchParams} />
    </Suspense>
  );
}

const small =
  "flex min-h-10 min-w-10 items-center justify-center border px-2 text-sm transition-colors disabled:opacity-30";

async function ProductsView({ searchParams }: { searchParams: PageProps<"/admin/products">["searchParams"] }) {
  const user = await requireAdmin();
  const saved = (await searchParams).saved === "1";
  const products = await listAllProducts();

  return (
    <>
      <AdminHeader email={user.email} active="products" />
      <main className="mx-auto w-full max-w-4xl px-4 pt-6 pb-16">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-bold">المنتجات</h1>
            <p className="mt-1 text-sm text-muted tabular-nums">{products.length} منتج</p>
          </div>
          <Link href="/admin/products/new" className="gem gem-sm">
            <span className="gem-face">+ منتج جديد</span>
          </Link>
        </div>

        {saved && (
          <p role="status" className="mt-4 border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
            تم الحفظ ✓ التغييرات ظاهرة الآن في الموقع.
          </p>
        )}

        {categories.map((cat) => {
          const list = products.filter((p) => p.category === cat);
          return (
            <section key={cat} className="mt-8">
              <h2 className="mb-3 flex items-center gap-3 text-sm font-semibold text-gold-300">
                {ar.collections.items[cat]}
                <span className="text-muted tabular-nums">({list.length})</span>
                <span aria-hidden="true" className="h-px flex-1 bg-gold-400/20" />
              </h2>
              {list.length === 0 ? (
                <p className="border border-ivory/10 px-4 py-6 text-center text-sm text-muted">لا توجد منتجات في هذه المجموعة.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {list.map((p, i) => (
                    <li
                      key={p.id}
                      className={`flex flex-wrap items-center gap-3 border bg-noir-900 p-3 ${
                        p.isActive ? "border-ivory/10" : "border-dashed border-ivory/20 opacity-70"
                      }`}
                    >
                      <Link href={`/admin/products/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                        <span className="relative size-16 shrink-0 overflow-hidden border border-gold-400/20 bg-noir-800">
                          {mainImage(p) ? (
                            <Image src={mainImage(p) as string} alt="" fill sizes="64px" className="object-cover" />
                          ) : (
                            <ProductPlaceholder category={p.category} label="" className="absolute inset-0 [&_svg]:size-6" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">{p.name.ar}</span>
                          <span className="block text-sm text-gold-300 tabular-nums">{formatPrice(p.price, "ar")}</span>
                          <span className="mt-1 flex flex-wrap gap-1 text-xs">
                            {!p.inStock && <span className="border border-orange-400/50 px-1.5 text-orange-300">غير متوفر</span>}
                            {!p.isActive && <span className="border border-ivory/25 px-1.5 text-muted">مخفي</span>}
                            {!mainImage(p) && <span className="border border-ivory/15 px-1.5 text-muted">بدون صورة</span>}
                            {p.colors.length > 0 && (
                              <span className="border border-gold-400/40 px-1.5 text-gold-200">
                                {p.colors.length} ألوان
                                {p.colors.some((c) => !c.inStock) && ` (${p.colors.filter((c) => !c.inStock).length} نفد)`}
                              </span>
                            )}
                          </span>
                        </span>
                      </Link>

                      <div className="flex items-center gap-1">
                        <form action={toggleProduct.bind(null, p.id, "in_stock", !p.inStock)}>
                          <button
                            type="submit"
                            className={`${small} ${p.inStock ? "border-emerald-400/40 text-emerald-300" : "border-orange-400/50 text-orange-300"}`}
                          >
                            {p.inStock ? "متوفر" : "نفد"}
                          </button>
                        </form>
                        <form action={toggleProduct.bind(null, p.id, "is_active", !p.isActive)}>
                          <button type="submit" className={`${small} ${p.isActive ? "border-ivory/15 text-ivory/80" : "border-ivory/25 text-muted"}`}>
                            {p.isActive ? "ظاهر" : "مخفي"}
                          </button>
                        </form>
                        <form action={moveProduct.bind(null, p.id, "up")}>
                          <button type="submit" disabled={i === 0} aria-label="إلى الأعلى" className={`${small} border-ivory/15`}>
                            ↑
                          </button>
                        </form>
                        <form action={moveProduct.bind(null, p.id, "down")}>
                          <button type="submit" disabled={i === list.length - 1} aria-label="إلى الأسفل" className={`${small} border-ivory/15`}>
                            ↓
                          </button>
                        </form>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </main>
    </>
  );
}
