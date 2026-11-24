"use client";

import { startTransition, useActionState } from "react";
import type { SettingsState } from "@/app/admin/settings/actions";

type Props = {
  action: (prev: SettingsState, formData: FormData) => Promise<SettingsState>;
  initial: { casa: string; other: string; free: string };
};

const input =
  "block h-12 w-full border border-ivory/15 bg-noir-800 px-3 text-base text-ivory outline-none focus:border-gold-300";

export function SettingsForm({ action, initial }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
      className="mt-6 flex flex-col gap-4 border border-ivory/10 bg-noir-900 p-4"
    >
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">التوصيل إلى الدار البيضاء (درهم)</span>
        <input name="delivery_fee_casablanca" inputMode="decimal" dir="ltr" defaultValue={initial.casa} className={input} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">التوصيل إلى باقي المدن (درهم)</span>
        <input name="delivery_fee_other" inputMode="decimal" dir="ltr" defaultValue={initial.other} className={input} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">التوصيل مجاني ابتداءً من (درهم)</span>
        <input name="free_delivery_threshold" inputMode="decimal" dir="ltr" defaultValue={initial.free} placeholder="فارغ = لا يوجد توصيل مجاني" className={input} />
        <span className="mt-1.5 block text-xs text-muted">مجموع المنتجات في السلة. اتركه فارغًا لإلغاء التوصيل المجاني.</span>
      </label>

      <p aria-live="polite" className={`min-h-5 text-sm ${state.error ? "text-danger" : "text-emerald-300"}`}>
        {state.error ?? (state.ok && !pending ? "تم الحفظ ✓ الأثمنة الجديدة ظاهرة الآن في الموقع." : "")}
      </p>
      <button type="submit" disabled={pending} className="gem w-full disabled:opacity-80">
        <span className="gem-face text-base">{pending ? "جارٍ الحفظ…" : "حفظ"}</span>
      </button>
    </form>
  );
}
