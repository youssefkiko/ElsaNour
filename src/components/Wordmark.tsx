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

/** SVG path for a full ellipse, used to build the ring band with even-odd fill. */
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx} ${cy} a${rx} ${ry} 0 1 0 ${2 * rx} 0 a${rx} ${ry} 0 1 0 ${-2 * rx} 0 Z`;

function RingO() {
  return (
    <svg
      viewBox="10 22 80 106"
      className="inline-block h-[1.02em] w-[0.77em] align-baseline"
      style={{ marginRight: "0.18em", marginBottom: "-0.02em" }}
    >
      <defs>
        <linearGradient id="elsanour-ring-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-gold-200)" />
          <stop offset="45%" stopColor="var(--color-gold-300)" />
          <stop offset="70%" stopColor="var(--color-gold-400)" />
          <stop offset="100%" stopColor="var(--color-gold-600)" />
        </linearGradient>
      </defs>

      <g fill="url(#elsanour-ring-gold)" fillRule="evenodd">
        {/* Outer stroke: heavy on the left, hairline at top and bottom */}
        <path d={`${ellipse(50, 90, 38, 36)} ${ellipse(55, 90.5, 32, 34.5)}`} />
        {/* Inner stroke: heavy on the right; its hairlines run just inside the outer ones */}
        <path d={`${ellipse(51.5, 90, 36, 33)} ${ellipse(47, 90, 31.5, 31.5)}`} />
      </g>

      {/* Line-art diamond resting on the ring */}
      <g
        fill="none"
        stroke="url(#elsanour-ring-gold)"
        strokeWidth="1.7"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <path d="M43 33 H57 L64 40 L50 54 L36 40 Z" />
        <path d="M36 40 H64 M43 33 L46.5 40 L50 33 L53.5 40 L57 33 M46.5 40 L50 54 L53.5 40" />
      </g>

      {/* Sparkle on the stone */}
      <path
        d="M60 25 L61 31 L67 32 L61 33 L60 39 L59 33 L53 32 L59 31 Z"
        fill="var(--color-gold-200)"
      />
    </svg>
  );
}
