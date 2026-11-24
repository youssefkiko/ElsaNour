import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSkeleton } from "@/components/admin/AdminSkeleton";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { requireAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { saveDeliverySettings } from "./actions";

export const metadata: Metadata = { title: "التوصيل" };

export default function AdminSettingsPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <SettingsView />
    </Suspense>
  );
}

async function SettingsView() {
  const user = await requireAdmin();
  const db = supabaseAdmin();
  const { data } = db
    ? await db
        .from("settings")
        .select("delivery_fee_casablanca, delivery_fee_other, free_delivery_threshold, store_phone")
        .eq("id", 1)
        .maybeSingle()
    : { data: null };

  const str = (v: number | null | undefined) => (v === null || v === undefined ? "" : String(Number(v)));

  return (
    <>
      <AdminHeader email={user.email} active="settings" />
      <main className="mx-auto w-full max-w-2xl px-4 pt-6 pb-16">
        <h1 className="font-heading text-2xl font-bold">التوصيل والتواصل</h1>
        <p className="mt-1 text-sm leading-6 text-muted">
          يُطبَّق مباشرة على السلة وصفحة الطلب والطلبات الجديدة (الطلبات القديمة تبقى كما هي).
        </p>
        <SettingsForm
          action={saveDeliverySettings}
          initial={{
            casa: str(data?.delivery_fee_casablanca ?? 20),
            other: str(data?.delivery_fee_other ?? 35),
            free: str(data ? data.free_delivery_threshold : 300),
            phone: data?.store_phone ? String(data.store_phone).replace(/^\+212/, "0") : "",
          }}
        />
      </main>
    </>
  );
}
