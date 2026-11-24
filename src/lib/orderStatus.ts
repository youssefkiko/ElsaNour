/** Order statuses (same values as the Postgres enum order_status), in workflow order. */
export const ORDER_STATUSES = ["new", "confirmed", "shipped", "delivered", "returned", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const isOrderStatus = (v: unknown): v is OrderStatus =>
  typeof v === "string" && (ORDER_STATUSES as readonly string[]).includes(v);

/** Arabic labels for the admin (the shop works in Arabic). */
export const statusLabel: Record<OrderStatus, string> = {
  new: "جديد",
  confirmed: "مؤكد",
  shipped: "في الطريق",
  delivered: "تم التسليم",
  returned: "مرجوع",
  cancelled: "ملغى",
};

/** Badge colors: square chips, readable on the dark admin background. */
export const statusStyle: Record<OrderStatus, string> = {
  new: "border-gold-300/60 bg-gold-300/15 text-gold-200",
  confirmed: "border-emerald-400/50 bg-emerald-400/10 text-emerald-300",
  shipped: "border-sky-400/50 bg-sky-400/10 text-sky-300",
  delivered: "border-green-400/50 bg-green-400/10 text-green-300",
  returned: "border-orange-400/50 bg-orange-400/10 text-orange-300",
  cancelled: "border-ivory/20 bg-ivory/5 text-muted",
};
