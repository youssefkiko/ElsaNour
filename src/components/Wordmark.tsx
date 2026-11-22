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
        {/* Ring band: heavy on the sides, hairline at top and bottom (like a Bodoni O) */}
        <path d={`${ellipse(50, 90, 38, 36)} ${ellipse(50, 90, 30, 33)}`} />
        {/* Inner swooshes: thin crescents along the top and bottom inside the band,
            tapering to the left and joining the band on the right, as in the logo */}
        <path d={`${ellipse(51, 90, 28, 31)} ${ellipse(48, 92.5, 27, 31)}`} />
        <path d={`${ellipse(51, 90, 28, 31)} ${ellipse(48, 87.5, 27, 31)}`} />
      </g>

      {/* Line-art diamond resting on the ring */}
      <g
        fill="none"
        stroke="url(#elsanour-ring-gold)"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <path d="M44 35 H56 L62 41 L50 55 L38 41 Z" />
        <path d="M38 41 H62 M44 35 L47 41 L50 35 L53 41 L56 35 M47 41 L50 55 L53 41" />
      </g>

      {/* Sparkle on the stone */}
      <path
        d="M59 25 L59.8 30.2 L65 31 L59.8 31.8 L59 37 L58.2 31.8 L53 31 L58.2 30.2 Z"
        fill="var(--color-gold-200)"
      />
    </svg>
  );
}
