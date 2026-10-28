import { useEffect, useId, useRef } from "react";
import { ROUTE_OUTLINE } from "../brand/logoData";
import "./mascot.css";

// "Route", the 404 mascot: the Sixth Route mark itself. The loop of the 6 becomes its face,
// the eyes follow the cursor (on touch screens: the last tap, and a look around when idle), and
// a dashed route curls into a question mark over its head.
const EYES = [
  { x: 51, y: 63 },
  { x: 69, y: 63 },
];

export function Mascot({ happy = false, className = "" }: { happy?: boolean; className?: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const pupils = useRef<(SVGCircleElement | null)[]>([]);
  const clip = useId();

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    let raf = 0;
    let px = window.innerWidth / 2;
    let py = window.innerHeight / 2;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const scale = r.width / 140; // viewBox width
      EYES.forEach((eye, i) => {
        const p = pupils.current[i];
        if (!p) return;
        const ex = r.left + (eye.x + 20) * scale;
        const ey = r.top + (eye.y + 62) * scale;
        const dx = px - ex;
        const dy = py - ey;
        const d = Math.hypot(dx, dy) || 1;
        const m = Math.min(2.6, d / 60);
        p.style.transform = `translate(${(dx / d) * m}px, ${(dy / d) * m}px)`;
      });
    };
    let last = performance.now();
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      last = performance.now();
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    // No cursor to follow: after a few quiet seconds the eyes glance somewhere new now and then.
    const look = window.matchMedia("(hover: none)").matches
      ? window.setInterval(() => {
          if (performance.now() - last < 2500) return;
          const r = el.getBoundingClientRect();
          const a = Math.random() * Math.PI * 2;
          px = r.left + r.width / 2 + Math.cos(a) * 240;
          py = r.top + r.height * 0.6 + Math.sin(a) * 160;
          update();
        }, 1700)
      : 0;
    update();
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      window.clearInterval(look);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <svg
      ref={svg}
      className={`mascot ${happy ? "is-happy" : ""} ${className}`}
      viewBox="-20 -62 140 186"
      role="img"
      aria-label="Route, the Sixth Route mascot, looking lost"
    >
      <defs>
        <clipPath id={clip}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
        <radialGradient id={`${clip}-shine`} cx="0.32" cy="0.28" r="0.75">
          <stop offset="0" stopColor="#fffcf4" stopOpacity="0.35" />
          <stop offset="0.5" stopColor="#fffcf4" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse className="mascot__shadow" cx="50" cy="117" rx="34" ry="4" />

      {/* The lost route: a dashed question mark that keeps redrawing itself. */}
      <g className="mascot__q">
        <path d="M38 -40 C 38 -56, 64 -58, 64 -42 C 64 -30, 50 -32, 50 -19" />
      </g>
      <circle className="mascot__qdot" cx="50" cy="-9" r="2.8" />

      <g className="mascot__body">
        <g className="mascot__feet">
          <ellipse cx="34" cy="106" rx="10" ry="5.5" />
          <ellipse cx="66" cy="106" rx="10" ry="5.5" />
        </g>
        <circle cx="50" cy="50" r="50" fill="var(--sr-orange)" />
        <path d={ROUTE_OUTLINE} fill="var(--sr-maroon)" fillRule="evenodd" clipPath={`url(#${clip})`} />
        <circle cx="50" cy="50" r="50" fill={`url(#${clip}-shine)`} />

        <g className="mascot__face">
          {EYES.map((e, i) => (
            <g key={i} className="mascot__eye" style={{ transformOrigin: `${e.x}px ${e.y}px` }}>
              <circle cx={e.x} cy={e.y} r="6.6" fill="var(--sr-cream)" />
              <circle ref={(el) => {
                  pupils.current[i] = el;
                }} cx={e.x} cy={e.y} r="3.1" fill="var(--sr-night)" />
            </g>
          ))}
          <ellipse className="mascot__mouth mascot__mouth--o" cx="60" cy="76" rx="2.6" ry="3" />
          <path className="mascot__mouth mascot__mouth--smile" d="M54 74 Q60 81 66 74" />
          <ellipse className="mascot__cheek" cx="44" cy="73" rx="3.4" ry="2" />
          <ellipse className="mascot__cheek" cx="76" cy="72" rx="3.4" ry="2" />
        </g>
      </g>
    </svg>
  );
}
