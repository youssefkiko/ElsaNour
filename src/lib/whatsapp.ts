import type { AdminOrder } from "./adminOrders";
import { formatPrice } from "./site";

/** "+212612345678" → "212612345678" (the format wa.me wants). */
export const waNumber = (phone: string) => phone.replace(/\D/g, "");

/**
 * Link that opens a WhatsApp chat with the customer, with a ready confirmation message
 * (the owner can still edit it before sending).
 */
export function whatsappConfirmLink(o: AdminOrder): string {
  const items = o.order_items.map((i) => `- ${i.product_name} × ${i.quantity}`).join("\n");
  const delivery = o.delivery_fee === 0 ? "التوصيل مجاني" : `التوصيل ${formatPrice(o.delivery_fee, "ar")}`;
  const text = [
    `السلام عليكم ${o.customer_name}،`,
    `معك متجر Elsanour بخصوص طلبك رقم #${o.reference}:`,
    items,
    `${delivery}. المجموع: ${formatPrice(o.total, "ar")}، الدفع عند الاستلام.`,
    `العنوان: ${o.city}، ${o.address}`,
    "هل نؤكد لك الطلب؟",
  ].join("\n");
  return `https://wa.me/${waNumber(o.phone)}?text=${encodeURIComponent(text)}`;
}
