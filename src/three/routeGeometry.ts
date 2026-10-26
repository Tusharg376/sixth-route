import * as THREE from "three";
import { ROUTE_HALF_WIDTH, ROUTE_POINTS } from "../brand/logoData";

/**
 * Builds the route as a raised ribbon lying on a sphere of radius R.
 * The 2D logo centreline is projected straight back onto the front hemisphere, so seen
 * head-on the ribbon reads exactly as the flat mark. Where the 2D stroke is clipped by the
 * circle, the ribbon continues around the back of the sphere along a great circle and tapers out.
 */
export function buildRouteGeometry(R = 1, { thickness = 0.028, segments = 10, tail = 1.15 } = {}) {
  type S = { p: THREE.Vector3; w: number };
  const front: S[] = [];
  ROUTE_POINTS.forEach(([x, y], i) => {
    const u = (x - 50) / 50;
    const v = (50 - y) / 50;
    const r = Math.hypot(u, v);
    if (r > 0.985) return;
    front.push({ p: new THREE.Vector3(u, v, Math.sqrt(1 - r * r)), w: ROUTE_HALF_WIDTH[i] / 50 });
  });

  // Great-circle continuation past the silhouette, tapering to nothing.
  const extend = (end: S, prev: S) => {
    const P = end.p.clone().normalize();
    const T = end.p.clone().sub(prev.p);
    T.sub(P.clone().multiplyScalar(T.dot(P))).normalize();
    const out: S[] = [];
    const n = 36;
    for (let k = 1; k <= n; k++) {
      const s = (k / n) * tail;
      const p = P.clone().multiplyScalar(Math.cos(s)).add(T.clone().multiplyScalar(Math.sin(s)));
      const fade = 1 - THREE.MathUtils.smoothstep(s, tail * 0.25, tail);
      out.push({ p, w: end.w * (0.15 + 0.85 * fade) * (k === n ? 0 : 1) });
    }
    return out;
  };
  const head = extend(front[0], front[2]).reverse();
  const tailPts = extend(front[front.length - 1], front[front.length - 3]);
  const pts = [...head, ...front, ...tailPts];

  const n = pts.length;
  const pos: number[] = [];
  const nor: number[] = [];
  const along: number[] = [];
  const idx: number[] = [];
  const N = new THREE.Vector3();
  const T = new THREE.Vector3();
  const B = new THREE.Vector3();
  const crossStart = head.length + Math.floor(front.length * 0.72);

  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(i - 1, 0)].p;
    const b = pts[Math.min(i + 1, n - 1)].p;
    N.copy(pts[i].p).normalize();
    T.copy(b).sub(a).normalize();
    B.crossVectors(N, T).normalize();
    // Widen where the band is foreshortened so the head-on silhouette matches the flat logo.
    const f = Math.max(Math.hypot(B.x, B.y), 0.38);
    const w = pts[i].w / f;
    // The returning bar rides slightly higher so it crosses over the spine cleanly.
    const ride = thickness * 0.9 * THREE.MathUtils.smoothstep(i, crossStart, crossStart + 6);
    const h = thickness;
    const lift = thickness * 0.15 + ride;
    for (let j = 0; j < segments; j++) {
      const phi = (j / segments) * Math.PI * 2;
      const c = Math.cos(phi);
      const s = Math.sin(phi);
      const px = N.x * (1 + lift) + B.x * w * c + N.x * h * s;
      const py = N.y * (1 + lift) + B.y * w * c + N.y * h * s;
      const pz = N.z * (1 + lift) + B.z * w * c + N.z * h * s;
      pos.push(px * R, py * R, pz * R);
      const nx = (B.x * c) / Math.max(w, 1e-4) + (N.x * s) / h;
      const ny = (B.y * c) / Math.max(w, 1e-4) + (N.y * s) / h;
      const nz = (B.z * c) / Math.max(w, 1e-4) + (N.z * s) / h;
      const l = Math.hypot(nx, ny, nz) || 1;
      nor.push(nx / l, ny / l, nz / l);
      along.push(i / (n - 1));
    }
  }
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < segments; j++) {
      const a = i * segments + j;
      const b = i * segments + ((j + 1) % segments);
      const c = (i + 1) * segments + j;
      const d = (i + 1) * segments + ((j + 1) % segments);
      idx.push(a, b, c, b, d, c);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("along", new THREE.Float32BufferAttribute(along, 1));
  g.setIndex(idx);
  return g;
}
