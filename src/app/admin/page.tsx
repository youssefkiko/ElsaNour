import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSkeleton } from "@/components/admin/AdminSkeleton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/admin";
import { listOrders, PAGE_SIZE, parseFilters, type OrderFilters, type Range } from "@/lib/adminOrders";
import { formatDateTime } from "@/lib/dates";
import { ORDER_STATUSES, statusLabel } from "@/lib/orderStatus";
import { formatPrice } from "@/lib/site";

export const metadata: Metadata = { title: "الطلبات" };

// Orders list. Everything below depends on the login and the URL, so it streams in.
export default function AdminOrdersPage({ searchParams }: PageProps<"/admin">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <OrdersView searchParams={searchParams} />
    </Suspense>
  );
}

const RANGES: { value: Range; label: string }[] = [
  { value: "today", label: "اليوم" },
  { value: "7d", label: "7 أيام" },
  { value: "30d", label: "30 يومًا" },
  { value: "all", label: "الكل" },
];

/** Builds an /admin URL with the current filters, changing some of them. */
function href(f: OrderFilters, change: Partial<OrderFilters>, base = "/admin") {
  const next = { ...f, page: 1, ...change };
  const p = new URLSearchParams();
  if (next.status !== "all") p.set("status", next.status);
  if (next.range !== "all") p.set("range", next.range);
  if (next.range === "custom") {
    if (next.from) p.set("from", next.from);
    if (next.to) p.set("to", next.to);
  }
  if (next.q) p.set("q", next.q);
  if (next.page > 1) p.set("page", String(next.page));
  const s = p.toString();
  return s ? `${base}?${s}` : base;
}

const chip = (active: boolean) =>
  `flex min-h-10 shrink-0 items-center gap-1.5 border px-3 text-sm whitespace-nowrap transition-colors ${
    active
      ? "border-gold-300 bg-gold-300/15 font-semibold text-gold-200"
      : "border-ivory/12 text-muted hover:border-gold-400/40 hover:text-ivory"
  }`;

async function OrdersView({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  const user = await requireAdmin();
  const f = parseFilters(await searchParams);
  const { orders, count } = await listOrders(f);
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <>
      <AdminHeader email={user.email} />
      <main className="mx-auto w-full max-w-4xl px-4 pt-6 pb-16">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-bold">الطلبات</h1>
            <p className="mt-1 text-sm text-muted tabular-nums">{count} طلب</p>
          </div>
          <a
            href={href(f, {}, "/admin/export")}
            className="flex min-h-10 items-center border border-ivory/15 px-3 text-sm text-gold-300 transition-colors hover:border-gold-400/50"
          >
            تحميل CSV
          </a>
        </div>

        {/* Status */}
        <nav aria-label="الحالة" className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          <Link href={href(f, { status: "all" })} className={chip(f.status === "all")}>
            الكل
          </Link>
          {ORDER_STATUSES.map((s) => (
            <Link key={s} href={href(f, { status: s })} className={chip(f.status === s)}>
              {statusLabel[s]}
            </Link>
          ))}
        </nav>

        {/* Period */}
        <nav aria-label="الفترة" className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          {RANGES.map((r) => (
            <Link key={r.value} href={href(f, { range: r.value })} className={chip(f.range === r.value)}>
              {r.label}
            </Link>
          ))}
        </nav>

        {/* Custom dates + search (plain GET forms: they work without JavaScript) */}
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <form action="/admin" className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto] items-center gap-2 border border-ivory/12 bg-noir-900 p-2">
            {f.status !== "all" && <input type="hidden" name="status" value={f.status} />}
            <input type="hidden" name="range" value="custom" />
            <label className="sr-only" htmlFor="from">من</label>
            <input id="from" name="from" type="date" defaultValue={f.from} className="h-10 w-full min-w-0 border border-ivory/12 bg-noir-800 px-1.5 text-sm text-ivory [color-scheme:dark]" />
            <span className="text-xs text-muted">إلى</span>
            <label className="sr-only" htmlFor="to">إلى</label>
            <input id="to" name="to" type="date" defaultValue={f.to} className="h-10 w-full min-w-0 border border-ivory/12 bg-noir-800 px-1.5 text-sm text-ivory [color-scheme:dark]" />
            <button type="submit" className="h-10 shrink-0 border border-gold-400/40 px-3 text-sm text-gold-200">
              عرض
            </button>
          </form>
          <form action="/admin" role="search" className="flex items-center gap-2 border border-ivory/12 bg-noir-900 p-2">
            {f.status !== "all" && <input type="hidden" name="status" value={f.status} />}
            {f.range !== "all" && <input type="hidden" name="range" value={f.range} />}
            <label className="sr-only" htmlFor="q">بحث</label>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={f.q}
              placeholder="رقم الطلب، الهاتف، الاسم أو المدينة"
              className="h-10 min-w-0 flex-1 border border-ivory/12 bg-noir-800 px-3 text-sm text-ivory placeholder:text-muted/70"
            />
            <button type="submit" className="h-10 shrink-0 border border-gold-400/40 px-3 text-sm text-gold-200">
              بحث
            </button>
          </form>
        </div>

        {/* List */}
        {orders.length === 0 ? (
          <p className="mt-10 border border-ivory/10 bg-noir-900 px-4 py-12 text-center text-muted">لا توجد طلبات بهذه الشروط.</p>
        ) : (
          <ul className="mt-5 flex flex-col gap-2">
            {orders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/admin/orders/${o.reference}`}
                  className={`block border bg-noir-900 p-4 transition-colors hover:border-gold-400/50 ${
                    o.status === "new" ? "border-gold-300/40 border-s-4 border-s-gold-300" : "border-ivory/10"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span dir="ltr" className="font-display text-lg font-bold text-gold-300 tabular-nums">
                      #{o.reference}
                    </span>
                    <StatusBadge status={o.status} />
                  </div>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{o.customer_name}</p>
                      <p className="mt-0.5 truncate text-sm text-muted">
                        {o.city} · <span dir="ltr">{o.phone}</span>
                      </p>
                    </div>
                    <div className="shrink-0 text-end">
                      <p className="font-bold tabular-nums">{formatPrice(o.total, "ar")}</p>
                      <p className="text-xs text-muted">{o.item_count} قطعة</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted">{formatDateTime(o.created_at)}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* Pages */}
        {pages > 1 && (
          <nav aria-label="الصفحات" className="mt-6 flex items-center justify-between gap-3 text-sm">
            {f.page > 1 ? (
              <Link href={href(f, { page: f.page - 1 })} className="min-h-10 border border-ivory/15 px-4 leading-10">
                → السابق
              </Link>
            ) : (
              <span />
            )}
            <span className="text-muted tabular-nums">
              {f.page} / {pages}
            </span>
            {f.page < pages ? (
              <Link href={href(f, { page: f.page + 1 })} className="min-h-10 border border-ivory/15 px-4 leading-10">
                التالي ←
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </main>
    </>
  );
}
