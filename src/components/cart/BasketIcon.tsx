import { useId } from "react";

/**
 * Woven golden basket (pure SVG, brand gold in both themes): a handle, a rounded rim and
 * a body with a classic basket-weave pattern.
 */
export function BasketIcon({ className = "size-9" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const gold = `${id}-gold`;
  const deep = `${id}-deep`;
  const weave = `${id}-weave`;
  const body = `${id}-body`;

  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={gold} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6e3b0" />
          <stop offset="0.5" stopColor="#d4a64a" />
          <stop offset="1" stopColor="#a8761e" />
        </linearGradient>
        <linearGradient id={deep} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ecc97a" />
          <stop offset="0.55" stopColor="#c08f35" />
          <stop offset="1" stopColor="#8f6420" />
        </linearGradient>
        {/* Basket weave: blocks of horizontal and vertical strands, alternating. */}
        <pattern id={weave} width="8" height="8" patternUnits="userSpaceOnUse">
          <g stroke="#6e4c12" strokeWidth="0.7" strokeLinecap="round" opacity="0.75">
            <path d="M0.6 1h2.8M0.6 2.5h2.8M4.6 0.6v2.8M6.1 0.6v2.8M7.4 0.6v2.8M0.6 4.6v2.8M2 4.6v2.8M3.4 4.6v2.8M4.6 5h2.8M4.6 6.5h2.8" />
          </g>
        </pattern>
        <clipPath id={body}>
          <path d="M10.5 33.5h43l-3.6 20.2a4.5 4.5 0 0 1-4.4 3.8H18.5a4.5 4.5 0 0 1-4.4-3.8z" />
        </clipPath>
      </defs>

      {/* Handle */}
      <path d="M16 31C16 12 48 12 48 31" fill="none" stroke={`url(#${gold})`} strokeWidth="4" strokeLinecap="round" />
      <path d="M16 31C16 12 48 12 48 31" fill="none" stroke="#fff6d8" strokeWidth="0.8" strokeLinecap="round" opacity="0.55" />

      {/* Body + weave */}
      <path d="M10.5 33.5h43l-3.6 20.2a4.5 4.5 0 0 1-4.4 3.8H18.5a4.5 4.5 0 0 1-4.4-3.8z" fill={`url(#${deep})`} />
      <g clipPath={`url(#${body})`}>
        <rect x="8" y="33" width="48" height="26" fill={`url(#${weave})`} />
        {/* soft light from the top left */}
        <path d="M10 33h22l-6 26H10z" fill="#fff6d8" opacity="0.12" />
      </g>
      <path d="M14.4 51.5h35.2" stroke="#6e4c12" strokeWidth="1" opacity="0.5" />

      {/* Rim */}
      <rect x="7.5" y="28" width="49" height="7.5" rx="3.75" fill={`url(#${gold})`} />
      <path d="M11 30.3h42" stroke="#fff6d8" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <path d="M11 33.3h42" stroke="#8f6420" strokeWidth="0.8" strokeLinecap="round" strokeDasharray="2.2 1.6" opacity="0.7" />
    </svg>
  );
}
