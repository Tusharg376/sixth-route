import { useId } from "react";
import type { ProjectArtKind } from "../content";
import { ROUTE_OUTLINE } from "../brand/logoData";
import { BrandPattern } from "./BrandPattern";

// Art-directed key visuals for each project card, built only from brand colours and shapes.
// Swap for real project imagery when available (see design.md).
export function ProjectArt({ kind }: { kind: ProjectArtKind }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className="art" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {ART[kind](id)}
    </svg>
  );
}

const MarkG = ({ x, y, r, id }: { x: number; y: number; r: number; id: string }) => (
  <g transform={`translate(${x - r} ${y - r}) scale(${(r * 2) / 100})`}>
    <clipPath id={`mk${id}`}>
      <circle cx="50" cy="50" r="50" />
    </clipPath>
    <circle cx="50" cy="50" r="50" fill="var(--sr-orange)" />
    <path d={ROUTE_OUTLINE} fill="var(--sr-maroon)" fillRule="evenodd" clipPath={`url(#mk${id})`} />
  </g>
);

const ART: Record<ProjectArtKind, (id: string) => React.ReactNode> = {
  identity: (id) => (
    <>
      <rect width="400" height="600" fill="var(--sr-night)" />
      <radialGradient id={`g${id}`} cx="0.5" cy="0.36" r="0.5">
        <stop offset="0" stopColor="#FF8221" stopOpacity="0.45" />
        <stop offset="1" stopColor="#FF8221" stopOpacity="0" />
      </radialGradient>
      <rect width="400" height="600" fill={`url(#g${id})`} />
      <MarkG x={200} y={190} r={86} id={id} />
      <text x="200" y="330" textAnchor="middle" fontFamily="Montserrat" fontSize="26" fill="#FEFFFF" letterSpacing="1">
        <tspan fontWeight="800">SIXTH</tspan>
        <tspan fontWeight="300">ROUTE</tspan>
      </text>
      <text x="200" y="356" textAnchor="middle" fontFamily="Montserrat" fontSize="9" fill="rgba(254,255,255,.55)" letterSpacing="4">
        BEYOND THE OBVIOUS.
      </text>
      <BrandPattern size={100} y={400} />
    </>
  ),
  render: (id) => (
    <>
      <linearGradient id={`bg${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#140101" />
        <stop offset="1" stopColor="#420D0F" />
      </linearGradient>
      <rect width="400" height="600" fill={`url(#bg${id})`} />
      {[
        { cx: 205, cy: 330, r: 118 },
        { cx: 95, cy: 430, r: 46 },
        { cx: 318, cy: 448, r: 30 },
      ].map((s, i) => (
        <g key={i}>
          <radialGradient id={`s${id}${i}`} cx="0.36" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#FFD3AE" />
            <stop offset="0.18" stopColor="#FF8221" />
            <stop offset="0.75" stopColor="#7A2A10" />
            <stop offset="1" stopColor="#2A0605" />
          </radialGradient>
          <ellipse cx={s.cx} cy={s.cy + s.r * 0.98} rx={s.r * 0.95} ry={s.r * 0.16} fill="#000" opacity="0.45" />
          <circle cx={s.cx} cy={s.cy} r={s.r} fill={`url(#s${id}${i})`} />
        </g>
      ))}
      <path d="M0 480 Q200 452 400 480 V600 H0Z" fill="#140101" opacity="0.55" />
    </>
  ),
  campaign: (id) => (
    <>
      <rect width="400" height="600" fill="var(--sr-orange)" />
      <g fontFamily="Montserrat" fontWeight="800" fill="var(--sr-maroon)" letterSpacing="-4">
        <text x="26" y="150" fontSize="92">
          BEYOND
        </text>
        <text x="26" y="236" fontSize="92">
          THE
        </text>
        <text x="26" y="322" fontSize="92" fill="#FEFFFF">
          OBVI—
        </text>
        <text x="26" y="408" fontSize="92" fill="#FEFFFF">
          OUS.
        </text>
      </g>
      <path d="M-10 520 C 90 470, 160 560, 250 500 S 380 420, 420 450" fill="none" stroke="var(--sr-maroon)" strokeWidth="5" strokeLinecap="round" />
      <MarkG x={348} y={548} r={26} id={id} />
    </>
  ),
  web: () => (
    <>
      <rect width="400" height="600" fill="#F5EDE0" />
      <g transform="translate(34 96)">
        <rect width="332" height="408" rx="14" fill="#FEFFFF" />
        <circle cx="20" cy="18" r="4" fill="#FF8221" />
        <circle cx="34" cy="18" r="4" fill="rgba(66,13,15,.25)" />
        <circle cx="48" cy="18" r="4" fill="rgba(66,13,15,.25)" />
        <rect x="12" y="36" width="308" height="200" rx="10" fill="#140101" />
        <circle cx="244" cy="136" r="62" fill="#FF8221" />
        <circle cx="244" cy="136" r="84" fill="none" stroke="rgba(255,130,33,.35)" />
        <rect x="32" y="92" width="120" height="14" rx="4" fill="#FEFFFF" />
        <rect x="32" y="114" width="96" height="14" rx="4" fill="#FEFFFF" />
        <rect x="32" y="136" width="70" height="14" rx="4" fill="#FF8221" />
        <rect x="32" y="168" width="78" height="24" rx="12" fill="#FFFCF4" />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${12 + i * 104} 252)`}>
            <rect width="96" height="132" rx="10" fill={i === 1 ? "#FF8221" : "#FFFCF4"} stroke="rgba(66,13,15,.12)" />
            <rect x="12" y="92" width="52" height="8" rx="3" fill={i === 1 ? "#420D0F" : "rgba(66,13,15,.4)"} />
            <rect x="12" y="106" width="36" height="8" rx="3" fill={i === 1 ? "#420D0F" : "rgba(66,13,15,.25)"} />
          </g>
        ))}
      </g>
    </>
  ),
  social: (id) => (
    <>
      <rect width="400" height="600" fill="var(--sr-maroon)" />
      {[
        { x: 44, y: 150, rot: -9, fill: "#FF8221" },
        { x: 230, y: 160, rot: 8, fill: "#FFFCF4" },
        { x: 132, y: 124, rot: 0, fill: "#140101" },
      ].map((p, i) => (
        <g key={i} transform={`rotate(${p.rot} ${p.x + 66} ${p.y + 130}) translate(${p.x} ${p.y})`}>
          <rect width="132" height="260" rx="18" fill={p.fill} />
          <rect x="10" y="10" width="112" height="3" rx="1.5" fill={i === 1 ? "rgba(66,13,15,.25)" : "rgba(254,255,255,.35)"} />
          {i === 0 && (
            <>
              <rect x="16" y="170" width="90" height="12" rx="3" fill="#420D0F" />
              <rect x="16" y="188" width="64" height="12" rx="3" fill="#420D0F" />
            </>
          )}
          {i === 1 && <circle cx="66" cy="110" r="44" fill="#FF8221" />}
          {i === 2 && <MarkG x={66} y={112} r={40} id={id} />}
          {i === 2 && (
            <text x="66" y="196" textAnchor="middle" fontFamily="Montserrat" fontWeight="700" fontSize="14" fill="#FEFFFF">
              New route.
            </text>
          )}
        </g>
      ))}
    </>
  ),
  search: () => (
    <>
      <rect width="400" height="600" fill="#FEFFFF" />
      <rect x="30" y="80" width="340" height="52" rx="26" fill="#FFFCF4" stroke="rgba(66,13,15,.14)" />
      <circle cx="60" cy="106" r="9" fill="none" stroke="#420D0F" strokeWidth="2.5" />
      <path d="M67 113l7 7" stroke="#420D0F" strokeWidth="2.5" strokeLinecap="round" />
      <text x="86" y="111" fontFamily="Urbanist" fontSize="15" fill="rgba(20,1,1,.7)">
        creative agency for 3D + web
      </text>
      <g transform="translate(30 160)">
        <rect width="340" height="78" rx="12" fill="#FF8221" />
        <text x="18" y="32" fontFamily="Montserrat" fontWeight="700" fontSize="16" fill="#140101">
          Signal — Answers, not ads
        </text>
        <rect x="18" y="46" width="230" height="8" rx="3" fill="rgba(66,13,15,.45)" />
        <rect x="18" y="60" width="170" height="8" rx="3" fill="rgba(66,13,15,.3)" />
        {[1, 2].map((i) => (
          <g key={i} transform={`translate(0 ${i * 72 + 12})`}>
            <rect x="18" y="8" width={200 - i * 30} height="10" rx="3" fill="rgba(66,13,15,.35)" />
            <rect x="18" y="26" width={260 - i * 20} height="7" rx="3" fill="rgba(66,13,15,.15)" />
            <rect x="18" y="40" width={180} height="7" rx="3" fill="rgba(66,13,15,.15)" />
          </g>
        ))}
      </g>
      {[40, 66, 58, 92, 120, 150].map((h, i) => (
        <rect key={i} x={46 + i * 54} y={560 - h} width="30" height={h} rx="6" fill={i === 5 ? "#FF8221" : "rgba(255,130,33,.3)"} />
      ))}
      <path d="M61 520 L115 494 L169 502 L223 468 L277 440 L331 410" fill="none" stroke="#420D0F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};
