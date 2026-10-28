import { useMemo } from "react";
import { mulberry32 } from "../lib/random";

const W = 400;
const H = 900;

/**
 * Phone stand-in for the ThreeUI Constellation Field: the same points-and-links picture, drawn
 * once as SVG in brand orange, with a few stars breathing in CSS. No WebGL on a phone GPU.
 */
export function StarMap({ count = 46 }: { count?: number }) {
  const { stars, links } = useMemo(() => {
    const rand = mulberry32(11);
    const stars = Array.from({ length: count }, () => ({ x: rand() * W, y: rand() * H, r: 1.2 + rand() * 1.6, glow: rand() < 0.18 }));
    // Link each star to its two nearest neighbours (once per pair), like the WebGL field.
    const seen = new Set<string>();
    const links: [number, number][] = [];
    stars.forEach((a, i) => {
      stars
        .map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) }))
        .filter(({ j, d }) => j !== i && d < 150)
        .sort((p, q) => p.d - q.d)
        .slice(0, 2)
        .forEach(({ j }) => {
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (!seen.has(key)) {
            seen.add(key);
            links.push([i, j]);
          }
        });
    });
    return { stars, links };
  }, [count]);

  return (
    <svg className="starmap" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g className="starmap__links">
        {links.map(([i, j]) => (
          <line key={`${i}-${j}`} x1={stars[i].x} y1={stars[i].y} x2={stars[j].x} y2={stars[j].y} />
        ))}
      </g>
      {stars.map((s, i) => (
        <circle
          key={i}
          className={s.glow ? "starmap__star is-glow" : "starmap__star"}
          cx={s.x}
          cy={s.y}
          r={s.glow ? s.r + 0.8 : s.r}
          style={s.glow ? { ["--d" as string]: `${(i % 7) * 0.6}s` } : undefined}
        />
      ))}
    </svg>
  );
}
