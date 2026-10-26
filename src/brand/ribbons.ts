import { ROUTE_POINTS } from "./logoData";

// Ribbon paths for the opening sequence, in the mark's 0–100 viewBox (circle at 50,50 r 50).
// Each ribbon = an off-screen lead-in + the shape it settles into. The loader slides a fixed-length
// ribbon along the whole path so it flies in from the screen edge and comes to rest on the shape.

type P = [number, number];

/** Smooth path through points (Catmull-Rom converted to cubic Béziers). */
function smooth(pts: P[]) {
  let d = "";
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const c1: P = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: P = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(2)} ${c1[1].toFixed(2)} ${c2[0].toFixed(2)} ${c2[1].toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
}

const fmt = (p: P) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;

/** The 6, traced tail-first so the ribbon can enter from the bottom-left through the tail.
 *  `start` is where the ribbon enters (just off-screen), in the mark's viewBox units. */
export function routeRibbon(start: P = [-280, 540]) {
  const pts = [...ROUTE_POINTS].reverse() as P[];
  const tail = pts[0];
  const next = pts[3];
  const len = Math.hypot(next[0] - tail[0], next[1] - tail[1]);
  const dir: P = [(next[0] - tail[0]) / len, (next[1] - tail[1]) / len];
  const c1: P = [start[0] + (tail[0] - start[0]) * 0.45, start[1] + (tail[1] - start[1]) * 0.15];
  const c2: P = [tail[0] - dir[0] * 95, tail[1] - dir[1] * 95];
  const lead = `M${fmt(start)}C${fmt(c1)} ${fmt(c2)} ${fmt(tail)}`;
  const main = `M${fmt(tail)}${smooth(pts)}`;
  return { full: lead + smooth(pts), lead, main };
}

/** The circle, built as a ribbon coiling inward from the rim (3½ turns, slightly overlapping).
 *  `start` is where the ribbon enters (just off-screen, bottom-right). */
export function coilRibbon(start: P = [380, 580]) {
  const width = 12.5;
  const r0 = 50 - width / 2;
  const turns = (r0 + width * 0.25) / width;
  const pts: P[] = [];
  const steps = Math.round(turns * 120);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = Math.PI / 2 + t * turns * Math.PI * 2; // start at the bottom, run clockwise
    const r = Math.max(r0 - t * turns * width, 0);
    pts.push([50 + r * Math.cos(a), 50 + r * Math.sin(a)]);
  }
  const rim = pts[0];
  const c1: P = [start[0] - (start[0] - rim[0]) * 0.2, start[1] - (start[1] - rim[1]) * 0.6];
  const c2: P = [rim[0] + 110, rim[1]];
  const lead = `M${fmt(start)}C${fmt(c1)} ${fmt(c2)} ${fmt(rim)}`;
  const main = `M${fmt(rim)}` + pts.slice(1).map((p) => `L${fmt(p)}`).join("");
  return { full: lead + main.replace(/^M[^L]+/, ""), lead, main, width: width * 1.14 };
}

export const ROUTE_RIBBON = routeRibbon();
export const COIL_RIBBON = coilRibbon();
