import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { countNewOrders } from "@/lib/adminOrders";

/** Top bar of the admin: brand, new-orders counter, logout, sections. (Call only after requireAdmin.) */
export async function AdminHeader({
  email,
  active = "orders",
}: {
  email?: string;
  active?: "orders" | "products" | "settings";
}) {
  const newCount = await countNewOrders();

  return (
    <header className="sticky top-0 z-30 border-b border-gold-400/15 bg-noir-950/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-3 px-4">
        <Link href="/admin" className="flex items-baseline gap-2">
          <span dir="ltr" className="font-display text-lg tracking-[0.16em] text-gold-300">
            ELSANOUR
          </span>
          <span className="hidden text-xs text-muted sm:inline">الإدارة</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/admin?status=new"
            className="flex min-h-10 items-center gap-2 border border-gold-300/40 bg-gold-300/10 px-3 text-sm font-semibold whitespace-nowrap text-gold-200"
          >
            <span>
              <span className="hidden sm:inline">طلبات </span>جديدة
            </span>
            <span className="min-w-6 bg-gold-300 px-1.5 text-center text-xs leading-6 font-bold text-[#06140f] tabular-nums">
              {newCount}
            </span>
          </Link>
          <form action={logout}>
            <button
              type="submit"
              title={email}
              className="min-h-10 border border-ivory/15 px-3 text-sm text-muted transition-colors hover:border-gold-400/40 hover:text-ivory"
            >
              خروج
            </button>
          </form>
        </div>
      </div>

      {/* Sections of the admin */}
      <nav aria-label="أقسام الإدارة" className="mx-auto flex max-w-4xl gap-1 px-4">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            aria-current={active === s.key ? "page" : undefined}
            className={`min-h-11 border-b-2 px-3 text-sm leading-11 transition-colors ${
              active === s.key
                ? "border-gold-300 font-semibold text-gold-200"
                : "border-transparent text-muted hover:text-ivory"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

const SECTIONS = [
  { key: "orders", href: "/admin", label: "الطلبات" },
  { key: "products", href: "/admin/products", label: "المنتجات" },
  { key: "settings", href: "/admin/settings", label: "الإعدادات" },
] as const;
