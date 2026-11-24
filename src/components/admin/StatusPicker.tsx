"use client";

import { useActionState } from "react";
import type { SaveState } from "@/app/admin/actions";
import { ORDER_STATUSES, statusLabel, statusStyle, type OrderStatus } from "@/lib/orderStatus";

type Props = {
  current: OrderStatus;
  action: (prev: SaveState, formData: FormData) => Promise<SaveState>;
};

/** One tap = new status (big buttons, made for the phone). */
export function StatusPicker({ current, action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction}>
      <fieldset disabled={pending} className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <legend className="sr-only">تغيير الحالة</legend>
        {ORDER_STATUSES.map((s) => {
          const active = s === current;
          return (
            <button
              key={s}
              type="submit"
              name="status"
              value={s}
              aria-pressed={active}
              className={`min-h-12 border px-3 text-sm font-semibold transition-colors disabled:opacity-60 ${
                active ? statusStyle[s] + " ring-1 ring-current" : "border-ivory/12 text-ivory/80 hover:border-gold-400/40"
              }`}
            >
              {active && <span aria-hidden="true">✓ </span>}
              {statusLabel[s]}
            </button>
          );
        })}
      </fieldset>
      <p aria-live="polite" className={`mt-2 min-h-5 text-sm ${state.error ? "text-danger" : "text-gold-200"}`}>
        {pending ? "جارٍ الحفظ…" : state.error ? state.error : state.ok ? "تم الحفظ ✓" : ""}
      </p>
    </form>
  );
}
