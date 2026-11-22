// Small inline line icons (no icon library, to keep pages light).
type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function InstagramIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
    </svg>
  );
}

export function MenuIcon({ className = "size-6" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon({ className = "size-6" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function CashIcon({ className = "size-7" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6 9.5v5M18 9.5v5" />
    </svg>
  );
}

export function TruckIcon({ className = "size-7" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7" />
      <circle cx="6.5" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </svg>
  );
}

export function NecklaceIcon({ className = "size-7" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5 3.5c0 6 3 9.5 7 9.5s7-3.5 7-9.5" />
      <path d="M12 13v2" />
      <path d="M12 15l-2 2.5 2 3 2-3z" />
    </svg>
  );
}

export function EarringIcon({ className = "size-7" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3a2 2 0 0 1 2 2c0 1.2-1 1.6-2 2.5" />
      <circle cx="12" cy="10" r="1.2" />
      <path d="M12 11.2v1.3" />
      <path d="M12 12.5c-2.5 2-3.5 3.8-3.5 5.3a3.5 3.5 0 0 0 7 0c0-1.5-1-3.3-3.5-5.3z" />
    </svg>
  );
}

export function RingIcon({ className = "size-7" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="15" r="6" />
      <path d="M9.5 6.5h5l1.5 1.8-4 3.2-4-3.2z" />
      <path d="M8 8.3h8" />
    </svg>
  );
}

export function BraceletIcon({ className = "size-7" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <ellipse cx="12" cy="12" rx="8.5" ry="5" />
      <ellipse cx="12" cy="12" rx="6" ry="3" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

export function GiftIcon({ className = "size-7" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3.5" y="8.5" width="17" height="4" rx="1" />
      <path d="M5 12.5v8h14v-8M12 8.5v12" />
      <path d="M12 8.5c-1.5-3.5-5.5-4-5.5-1.5 0 1.5 2.5 1.5 5.5 1.5zM12 8.5c1.5-3.5 5.5-4 5.5-1.5 0 1.5-2.5 1.5-5.5 1.5z" />
    </svg>
  );
}
