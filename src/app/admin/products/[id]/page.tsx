import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSkeleton } from "@/components/admin/AdminSkeleton";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/admin";
import { getProductRow, MAX_PHOTOS } from "@/lib/adminProducts";
import { saveProduct } from "../actions";

export const metadata: Metadata = { title: "تعديل منتج" };

export default function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <EditProductView params={params} />
    </Suspense>
  );
}

async function EditProductView({ params }: { params: PageProps<"/admin/products/[id]">["params"] }) {
  const user = await requireAdmin();
  const { id } = await params;
  const p = await getProductRow(id);
  if (!p) notFound();

  return (
    <>
      <AdminHeader email={user.email} active="products" />
      <main className="mx-auto w-full max-w-2xl px-4 pt-4 pb-16">
        <Link href="/admin/products" className="inline-flex min-h-11 items-center gap-2 text-sm text-gold-300">
          <span aria-hidden="true">→</span> كل المنتجات
        </Link>
        <h1 className="mt-1 mb-5 font-heading text-2xl font-bold">{p.name_ar}</h1>
        <ProductForm
          action={saveProduct.bind(null, p.id)}
          isNew={false}
          maxPhotos={MAX_PHOTOS}
          publicUrl={`/ar/product/${p.slug}`}
          initial={{
            name_ar: p.name_ar,
            name_fr: p.name_fr ?? "",
            name_en: p.name_en ?? "",
            category: p.category,
            price: String(p.price),
            compare_at: p.compare_at === null ? "" : String(p.compare_at),
            description_ar: p.description_ar ?? "",
            description_fr: p.description_fr ?? "",
            description_en: p.description_en ?? "",
            includes: p.includes ?? [],
            images: p.images ?? [],
            colors: (p.colors ?? []).map((c) => ({
              id: c.id,
              name_ar: c.name_ar,
              name_fr: c.name_fr ?? "",
              name_en: c.name_en ?? "",
              images: c.images ?? [],
              in_stock: c.in_stock !== false,
            })),
            in_stock: p.in_stock,
            is_active: p.is_active,
          }}
        />
      </main>
    </>
  );
}
