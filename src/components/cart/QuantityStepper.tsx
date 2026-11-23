"use client";

import { MAX_QUANTITY } from "@/lib/order";

type Props = {
  value: number;
  onChange: (qty: number) => void;
  label: string;
  decreaseLabel: string;
  increaseLabel: string;
};

const btn =
  "flex size-10 items-center justify-center rounded-none text-gold-300 transition-colors hover:bg-gold-400/10 hover:text-gold-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/60 disabled:pointer-events-none disabled:opacity-30";

/** Quantity box: − 2 +, one hairline square frame, 40px touch targets. */
export function QuantityStepper({ value, onChange, label, decreaseLabel, increaseLabel }: Props) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center rounded-none border border-gold-400/25 bg-noir-950/40"
    >
      <button type="button" aria-label={decreaseLabel} disabled={value <= 1} onClick={() => onChange(value - 1)} className={btn}>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M6 12h12" />
        </svg>
      </button>
      <output aria-live="polite" className="flex h-10 min-w-9 items-center justify-center border-x border-gold-400/20 text-center text-sm font-semibold tabular-nums text-ivory">
        {value}
      </output>
      <button
        type="button"
        aria-label={increaseLabel}
        disabled={value >= MAX_QUANTITY}
        onClick={() => onChange(value + 1)}
        className={btn}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M6 12h12M12 6v12" />
        </svg>
      </button>
    </div>
  );
}
