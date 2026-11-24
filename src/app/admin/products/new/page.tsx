import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSkeleton } from "@/components/admin/AdminSkeleton";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/admin";
import { MAX_PHOTOS } from "@/lib/adminProducts";
import { saveProduct } from "../actions";

export const metadata: Metadata = { title: "منتج جديد" };

export default function NewProductPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <NewProductView />
    </Suspense>
  );
}

async function NewProductView() {
  const user = await requireAdmin();
  return (
    <>
      <AdminHeader email={user.email} active="products" />
      <main className="mx-auto w-full max-w-2xl px-4 pt-4 pb-16">
        <Link href="/admin/products" className="inline-flex min-h-11 items-center gap-2 text-sm text-gold-300">
          <span aria-hidden="true">→</span> كل المنتجات
        </Link>
        <h1 className="mt-1 mb-5 font-heading text-2xl font-bold">منتج جديد</h1>
        <ProductForm
          action={saveProduct.bind(null, null)}
          isNew
          maxPhotos={MAX_PHOTOS}
          initial={{
            name_ar: "",
            name_fr: "",
            name_en: "",
            category: "necklaces",
            price: "",
            compare_at: "",
            description_ar: "",
            description_fr: "",
            description_en: "",
            includes: ["giftBox"],
            images: [],
            colors: [],
            in_stock: true,
            is_active: true,
          }}
        />
      </main>
    </>
  );
}
