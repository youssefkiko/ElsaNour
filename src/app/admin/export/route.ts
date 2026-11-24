import { NextResponse, type NextRequest } from "next/server";
import { getAdmin } from "@/lib/admin";
import { listOrders, parseFilters } from "@/lib/adminOrders";
import { csvDateTime, todayInShop } from "@/lib/dates";
import { statusLabel } from "@/lib/orderStatus";

/**
 * CSV export of the orders matching the current filters (same ?status=&range=&q= as
 * the list). Opens in Excel / Google Sheets; the UTF-8 BOM keeps Arabic readable in Excel.
 */
export async function GET(request: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return new NextResponse("Unauthorized", { status: 401 });

  const filters = parseFilters(Object.fromEntries(request.nextUrl.searchParams));
  const { orders } = await listOrders(filters, { all: true });

  const header = [
    "رقم الطلب",
    "التاريخ",
    "الحالة",
    "الاسم",
    "الهاتف",
    "المدينة",
    "العنوان",
    "المنتجات",
    "عدد القطع",
    "المنتجات (درهم)",
    "التوصيل (درهم)",
    "المجموع (درهم)",
    "ملاحظة الزبونة",
    "ملاحظة داخلية",
    "المصدر",
    "الحملة",
  ];
  const rows = orders.map((o) => [
    o.reference,
    csvDateTime(o.created_at),
    statusLabel[o.status],
    o.customer_name,
    localPhone(o.phone),
    o.city,
    o.address,
    o.order_items.map((i) => `${i.product_name}${i.color ? ` (${i.color})` : ""} x${i.quantity}`).join(" | "),
    o.item_count,
    o.subtotal,
    o.delivery_fee,
    o.total,
    o.note ?? "",
    o.internal_note ?? "",
    o.utm_source ?? "",
    o.utm_campaign ?? "",
  ]);

  const csv = "﻿" + [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="elsanour-orders-${todayInShop()}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}

/** One CSV cell: quoted, and protected against spreadsheet formulas (=, +, -, @). */
function cell(value: string | number): string {
  let s = String(value);
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

/** "+212612345678" → "06 12 34 56 78" (stays text in Excel, keeps the leading 0). */
function localPhone(phone: string): string {
  const local = phone.replace(/^\+212/, "0");
  return local.replace(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/, "$1 $2 $3 $4 $5");
}
