"use client";

import { useActionState } from "react";
import type { SaveState } from "@/app/admin/actions";

type Props = {
  initial: string;
  action: (prev: SaveState, formData: FormData) => Promise<SaveState>;
};

/** Private note of the shop on this order (e.g. "called, no answer", "deliver after 6pm"). */
export function InternalNoteForm({ initial, action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction}>
      <label htmlFor="internal_note" className="sr-only">
        ملاحظة داخلية
      </label>
      <textarea
        id="internal_note"
        name="internal_note"
        defaultValue={initial}
        rows={3}
        maxLength={2000}
        placeholder="مثلًا: اتصلت ولم تجب، أعاود غدًا"
        className="block w-full resize-y border border-ivory/12 bg-noir-800 px-3 py-2.5 text-base leading-7 text-ivory placeholder:text-muted/60 outline-none focus:border-gold-300"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <p aria-live="polite" className={`text-sm ${state.error ? "text-danger" : "text-gold-200"}`}>
          {pending ? "جارٍ الحفظ…" : state.error ? state.error : state.ok ? "تم الحفظ ✓" : ""}
        </p>
        <button
          type="submit"
          disabled={pending}
          className="min-h-10 shrink-0 border border-gold-400/50 px-4 text-sm font-semibold text-gold-200 disabled:opacity-60"
        >
          حفظ الملاحظة
        </button>
      </div>
    </form>
  );
}
