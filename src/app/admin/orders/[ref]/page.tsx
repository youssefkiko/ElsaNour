import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { saveInternalNote, setOrderStatus } from "@/app/admin/actions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSkeleton } from "@/components/admin/AdminSkeleton";
import { InternalNoteForm } from "@/components/admin/InternalNoteForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { StatusPicker } from "@/components/admin/StatusPicker";
import { PhoneIcon } from "@/components/icons";
import { requireAdmin } from "@/lib/admin";
import { getOrder } from "@/lib/adminOrders";
import { formatDateTime } from "@/lib/dates";
import { formatPrice } from "@/lib/site";
import { whatsappConfirmLink } from "@/lib/whatsapp";

export async function generateMetadata({ params }: PageProps<"/admin/orders/[ref]">): Promise<Metadata> {
  const { ref } = await params;
  return { title: `الطلب #${ref}` };
}

// One order: customer, call / WhatsApp, products, status, private note.
export default function AdminOrderPage({ params }: PageProps<"/admin/orders/[ref]">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <OrderView params={params} />
    </Suspense>
  );
}

const price = (n: number) => formatPrice(n, "ar");

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-ivory/10 bg-noir-900 p-4">
      <h2 className="mb-3 text-xs font-semibold tracking-wide text-gold-400">{title}</h2>
      {children}
    </section>
  );
}

async function OrderView({ params }: { params: PageProps<"/admin/orders/[ref]">["params"] }) {
  const user = await requireAdmin();
  const { ref } = await params;
  const reference = Number(ref);
  if (!/^\d{1,10}$/.test(ref)) notFound();
  const o = await getOrder(reference);
  if (!o) notFound();

  return (
    <>
      <AdminHeader email={user.email} />
      <main className="mx-auto w-full max-w-4xl px-4 pt-4 pb-16">
        <Link href="/admin" className="inline-flex min-h-11 items-center gap-2 text-sm text-gold-300">
          <span aria-hidden="true">→</span> كل الطلبات
        </Link>

        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <h1 className="flex items-center gap-3">
            <span dir="ltr" className="font-display text-3xl font-bold text-gold-300 tabular-nums">
              #{o.reference}
            </span>
            <StatusBadge status={o.status} />
          </h1>
          <p className="text-sm text-muted">{formatDateTime(o.created_at)}</p>
        </div>

        {/* Call / WhatsApp: the two big actions to confirm the order */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <a
            href={`tel:${o.phone}`}
            className="flex min-h-13 items-center justify-center gap-2 border border-gold-400/50 bg-gold-300/10 font-semibold text-gold-200"
          >
            <PhoneIcon className="size-5" />
            اتصال
          </a>
          <a
            href={whatsappConfirmLink(o)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-13 items-center justify-center gap-2 border border-emerald-400/50 bg-emerald-400/10 font-semibold text-emerald-300"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="currentColor">
              <path d="M12 2.2a9.8 9.8 0 0 0-8.4 14.8L2.2 21.8l4.9-1.3A9.8 9.8 0 1 0 12 2.2zm0 17.9a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8.1 8.1 0 1 1 12 20.1zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.6.3 2.7 2.7 0 0 0-.8 2c0 1.2.9 2.3 1 2.5.1.2 1.7 2.6 4.1 3.6 1.5.7 2.1.7 2.9.6.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.4-.3z" />
            </svg>
            واتساب
          </a>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Card title="الزبونة">
            <dl className="space-y-2 text-[15px]">
              <div>
                <dt className="sr-only">الاسم</dt>
                <dd className="text-lg font-semibold">{o.customer_name}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted">الهاتف:</dt>
                <dd dir="ltr" className="tabular-nums">{o.phone}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted">المدينة:</dt>
                <dd>{o.city}</dd>
              </div>
              <div>
                <dt className="text-muted">العنوان:</dt>
                <dd className="mt-0.5 leading-7">{o.address}</dd>
              </div>
              {o.note && (
                <div className="border-s-2 border-gold-400/60 bg-gold-300/5 px-3 py-2">
                  <dt className="text-xs text-gold-300">ملاحظة الزبونة</dt>
                  <dd className="mt-0.5 leading-7">{o.note}</dd>
                </div>
              )}
            </dl>
          </Card>

          <Card title="المنتجات">
            <ul className="divide-y divide-ivory/10">
              {o.order_items.map((i) => (
                <li key={`${i.product_slug}:${i.color ?? ""}`} className="flex items-center justify-between gap-3 py-2">
                  <span>
                    {i.product_name} <span className="text-muted tabular-nums">× {i.quantity}</span>
                    {i.color && <span className="mt-0.5 block text-sm text-gold-200">اللون: {i.color}</span>}
                  </span>
                  <span className="tabular-nums">{price(i.line_total)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-2 space-y-1 border-t border-ivory/10 pt-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">المنتجات</dt>
                <dd className="tabular-nums">{price(o.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">التوصيل</dt>
                <dd className="tabular-nums">{o.delivery_fee === 0 ? "مجاني" : price(o.delivery_fee)}</dd>
              </div>
              <div className="flex justify-between border-t border-ivory/10 pt-2 text-base font-bold">
                <dt>المجموع عند الاستلام</dt>
                <dd className="text-gold-200 tabular-nums">{price(o.total)}</dd>
              </div>
            </dl>
          </Card>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Card title="تغيير الحالة">
            <StatusPicker current={o.status} action={setOrderStatus.bind(null, o.reference)} />
          </Card>
          <Card title="ملاحظة داخلية (لا تراها الزبونة)">
            <InternalNoteForm initial={o.internal_note ?? ""} action={saveInternalNote.bind(null, o.reference)} />
          </Card>
        </div>

        <p className="mt-4 text-xs leading-6 text-muted">
          المصدر: {o.utm_source ? `${o.utm_source}${o.utm_campaign ? ` / ${o.utm_campaign}` : ""}` : "مباشر"} · لغة
          الموقع: {o.locale ?? "-"} · آخر تعديل: {formatDateTime(o.updated_at)}
        </p>
      </main>
    </>
  );
}
