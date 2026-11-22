type Props = {
  className?: string;
};

/**
 * "ELSANOUR" wordmark in Bodoni Moda, where the O is drawn as a gold ring
 * with a diamond on top, as in the logo. Sizes follow the font size.
 */
export function Wordmark({ className = "" }: Props) {
  return (
    <p lang="en" dir="ltr" className={className}>
      <span className="sr-only">Elsanour</span>
      <span aria-hidden="true" className="text-gold-metal whitespace-nowrap">
        ELSAN
        <RingO />
        UR
      </span>
    </p>
  );
}

function RingO() {
  return (
    <svg
      viewBox="0 6 100 122"
      className="inline-block h-[1.13em] w-[0.89em] align-baseline"
      style={{ marginLeft: "-0.07em", marginRight: "0.1em", marginBottom: "-0.025em" }}
      fill="none"
    >
      <defs>
        <linearGradient id="elsanour-ring-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-gold-200)" />
          <stop offset="40%" stopColor="var(--color-gold-300)" />
          <stop offset="65%" stopColor="var(--color-gold-400)" />
          <stop offset="100%" stopColor="var(--color-gold-600)" />
        </linearGradient>
      </defs>
      <g stroke="url(#elsanour-ring-gold)" strokeLinejoin="round">
        {/* Ring band: thick at the bottom, thin near the stone, like a real ring */}
        <ellipse cx="50" cy="84" rx="36" ry="38" strokeWidth="5" />
        <path
          d="M18 98 A36 38 0 0 0 82 98"
          strokeWidth="9"
          strokeLinecap="round"
        />
        {/* Diamond: crown, girdle and pavilion */}
        <path
          d="M37 18 H63 L73 29 L50 46 L27 29 Z"
          strokeWidth="3.2"
          fill="url(#elsanour-ring-gold)"
          fillOpacity="0.18"
        />
        <path d="M27 29 H73 M43 18 L40 29 L50 46 L60 29 L57 18" strokeWidth="1.8" />
      </g>
    </svg>
  );
}
