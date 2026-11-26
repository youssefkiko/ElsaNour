import "server-only";
import { SITE_URL } from "./seo";

/**
 * Email to the owner for every new order (Phase 7 C), sent with Resend
 * (https://resend.com, free plan). Needs RESEND_API_KEY (secret, .env.local + Vercel).
 * The address is ORDER_NOTIFY_EMAIL, or else the first ADMIN_EMAIL.
 * Without a verified domain, Resend only delivers to the email of the Resend account,
 * so the owner signs up to Resend with that same email.
 * Never throws: an email problem must never break an order.
 */

export type OrderEmailData = {
  reference: number;
  name: string;
  phone: string; // +2126XXXXXXXX
  city: string;
  address: string;
  note: string;
  lines: { product_name: string; color: string | null; quantity: number; line_total: number }[];
  subtotal: number;
  /** Coupon used by the customer (10% off the products), or none. */
  couponCode?: string | null;
  discount?: number;
  deliveryFee: number;
  total: number;
  utmSource: string | null;
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const dh = (n: number) => `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n)} درهم`;

export async function sendNewOrderEmail(o: OrderEmailData): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim();
  const to = (process.env.ORDER_NOTIFY_EMAIL || process.env.ADMIN_EMAIL || "").split(",")[0]?.trim();
  if (!key || !to) return; // not configured yet: nothing to do

  const local = o.phone.replace(/^\+212/, "0");
  const items = o.lines
    .map(
      (l) =>
        `<tr><td style="padding:6px 0">${esc(l.product_name)}${l.color ? ` <span style="color:#8f6420">(${esc(l.color)})</span>` : ""} × ${l.quantity}</td><td style="padding:6px 0;text-align:left;white-space:nowrap">${dh(l.line_total)}</td></tr>`,
    )
    .join("");
  const row = (label: string, value: string) =>
    `<tr><td style="padding:4px 0;color:#6b7280;width:90px">${label}</td><td style="padding:4px 0">${value}</td></tr>`;

  const html = `<!doctype html><html lang="ar" dir="rtl"><body style="margin:0;background:#f1eee6;font-family:Tahoma,Arial,sans-serif;color:#10261f">
<div style="max-width:520px;margin:0 auto;padding:20px">
  <div style="background:#06140f;color:#ecc97a;padding:16px 20px;font-size:20px;letter-spacing:3px">ELSANOUR</div>
  <div style="background:#fff;padding:20px;border:1px solid #e2ded3">
    <h1 style="margin:0 0 4px;font-size:20px">طلب جديد #${o.reference}</h1>
    <p style="margin:0 0 16px;color:#6b7280">المجموع عند الاستلام: <b style="color:#0b5d45;font-size:18px">${dh(o.total)}</b></p>
    <table style="width:100%;border-collapse:collapse;font-size:15px">
      ${row("الاسم", esc(o.name))}
      ${row("الهاتف", `<a href="tel:${esc(o.phone)}" style="color:#0b5d45" dir="ltr">${esc(local)}</a>`)}
      ${row("المدينة", esc(o.city))}
      ${row("العنوان", esc(o.address))}
      ${o.note ? row("ملاحظة", esc(o.note)) : ""}
      ${o.utmSource ? row("المصدر", esc(o.utmSource)) : ""}
    </table>
    <hr style="border:0;border-top:1px solid #e2ded3;margin:16px 0">
    <table style="width:100%;border-collapse:collapse;font-size:15px">
      ${items}
      ${o.discount ? `<tr><td style="padding:6px 0;color:#8f6420">تخفيض بالكود ${esc(o.couponCode ?? "")}</td><td style="padding:6px 0;text-align:left;color:#8f6420">−${dh(o.discount)}</td></tr>` : ""}
      <tr><td style="padding:6px 0;color:#6b7280">التوصيل</td><td style="padding:6px 0;text-align:left">${o.deliveryFee === 0 ? "مجاني" : dh(o.deliveryFee)}</td></tr>
      <tr><td style="padding:8px 0;font-weight:bold;border-top:1px solid #e2ded3">المجموع</td><td style="padding:8px 0;font-weight:bold;text-align:left;border-top:1px solid #e2ded3">${dh(o.total)}</td></tr>
    </table>
    <p style="margin:20px 0 0">
      <a href="${SITE_URL}/admin/orders/${o.reference}" style="display:inline-block;background:#0b5d45;color:#fff;padding:12px 18px;text-decoration:none">فتح الطلب في الإدارة</a>
      <a href="https://wa.me/${o.phone.replace(/\D/g, "")}" style="display:inline-block;margin-right:8px;color:#0b5d45;padding:12px 6px">واتساب الزبونة</a>
    </p>
  </div>
</div></body></html>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.ORDER_EMAIL_FROM || "Elsanour <onboarding@resend.dev>",
        to: [to],
        subject: `طلب جديد #${o.reference} · ${dh(o.total)} · ${o.city}`,
        html,
      }),
    });
    if (!res.ok) console.error("[order-email] Resend refused:", res.status, (await res.text()).slice(0, 200));
  } catch (e) {
    console.error("[order-email] could not send:", e instanceof Error ? e.message : e);
  }
}
