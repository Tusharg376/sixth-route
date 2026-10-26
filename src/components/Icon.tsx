import type { IconName } from "../content";

// Brand iconography (Figma "Iconography" tile): geometric marks in orange + currentColor.
const O = "var(--icon-accent, var(--sr-orange))";
const C = "currentColor";

const icons: Record<IconName, React.ReactNode> = {
  dots: (
    <g>
      {[0, 1, 2].flatMap((r) =>
        [0, 1, 2].map((c) => {
          const fills = [O, C, O, C, O, O, C, C, O];
          const i = r * 3 + c;
          return <circle key={i} cx={12 + c * 12} cy={12 + r * 12} r={3.6} fill={fills[i]} opacity={i === 1 || i === 8 ? 0.4 : 1} />;
        }),
      )}
    </g>
  ),
  spark: (
    <g strokeWidth={3} strokeLinecap="round">
      <path d="M6 24h36M24 6v36" stroke={C} />
      <path d="M11.3 11.3l25.4 25.4M36.7 11.3L11.3 36.7" stroke={O} />
    </g>
  ),
  arrow: (
    <g strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d="M10 38L36 12" stroke={C} />
      <path d="M18 11h19v19" stroke={O} />
    </g>
  ),
  layers: (
    <g strokeWidth={2.6} strokeLinejoin="round" fill="none">
      <path d="M24 6l17 9-17 9-17-9z" stroke={O} />
      <path d="M7 24l17 9 17-9" stroke={C} />
      <path d="M7 33l17 9 17-9" stroke={O} />
    </g>
  ),
  circles: (
    <g strokeWidth={2.6} fill="none">
      <circle cx="18" cy="19" r="11" stroke={C} />
      <circle cx="30" cy="19" r="11" stroke={C} />
      <circle cx="24" cy="30" r="11" stroke={O} />
    </g>
  ),
  squares: (
    <g>
      <rect x="8" y="8" width="16" height="16" rx="2" fill={O} opacity={0.55} />
      <rect x="24" y="8" width="16" height="16" rx="2" fill={C} />
      <rect x="8" y="24" width="16" height="16" rx="2" fill={C} />
      <rect x="24" y="24" width="16" height="16" rx="2" fill={O} />
    </g>
  ),
  plus: (
    <g strokeWidth={4} strokeLinecap="round">
      <path d="M8 24h32" stroke={C} />
      <path d="M24 8v32" stroke={O} />
    </g>
  ),
  radial: (
    <g strokeWidth={3} strokeLinecap="round">
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        const x1 = 24 + Math.cos(a) * 10;
        const y1 = 24 + Math.sin(a) * 10;
        const x2 = 24 + Math.cos(a) * 18;
        const y2 = 24 + Math.sin(a) * 18;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i % 3 === 0 ? C : O} />;
      })}
    </g>
  ),
};

export function Icon({ name, size = 48, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className} aria-hidden="true">
      {icons[name]}
    </svg>
  );
}

export function ArrowRight() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 8h12M9 3l5 5-5 5" />
    </svg>
  );
}

export function ArrowUpRight({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12L12 4M5 4h7v7" />
    </svg>
  );
}
