import { useId, type CSSProperties } from "react";
import { ROUTE_OUTLINE } from "./logoData";

type MarkProps = { size?: number | string; glow?: boolean; className?: string; title?: string };

/** The Sixth Route mark: orange circle with the maroon route clipped inside it. */
export function Mark({ size = 36, glow = false, className, title }: MarkProps) {
  const clip = useId();
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      style={glow ? { filter: "drop-shadow(0 0 14px rgba(255,130,33,.55))", overflow: "visible" } : undefined}
    >
      <defs>
        <clipPath id={clip}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="50" fill="var(--sr-orange)" />
      <path d={ROUTE_OUTLINE} fill="var(--sr-maroon)" fillRule="evenodd" clipPath={`url(#${clip})`} />
    </svg>
  );
}

type WordmarkProps = { tone?: "light" | "dark" | "poster"; className?: string; style?: CSSProperties };

/** SIXTH (heavy) + ROUTE (light). tone = colour of the background it sits on. */
export function Wordmark({ tone = "dark", className = "", style }: WordmarkProps) {
  return (
    <span className={`wordmark wordmark--${tone} ${className}`} style={style}>
      <span className="wordmark__a">SIXTH</span>
      <span className="wordmark__b">ROUTE</span>
    </span>
  );
}

type LockupProps = { tone?: "light" | "dark"; className?: string };

export function Lockup({ tone = "dark", className = "" }: LockupProps) {
  return (
    <span className={`lockup ${className}`}>
      <Mark size="1.9em" className="lockup__mark" />
      <Wordmark tone={tone} />
    </span>
  );
}
