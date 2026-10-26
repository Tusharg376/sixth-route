// Brand pattern tile system (Figma "Brand Pattern"): quarter circles, half circles and
// diagonals in orange / maroon / night / cream on a square grid.
type Kind = "quarter" | "half" | "diag" | "leaf" | "full" | "none";
type Tile = [Kind, string, string, number]; // shape, background, foreground, rotation (deg)

const O = "var(--sr-orange)";
const M = "var(--sr-maroon)";
const N = "var(--sr-night)";
const C = "var(--sr-cream)";

const shape = (k: Kind, s: number) => {
  switch (k) {
    case "quarter":
      return `M0 0H${s}A${s} ${s} 0 0 1 0 ${s}Z`;
    case "half":
      return `M0 ${s}A${s / 2} ${s / 2} 0 0 1 ${s} ${s}Z`;
    case "diag":
      return `M0 0H${s}L0 ${s}Z`;
    case "leaf":
      return `M0 ${s}A${s} ${s} 0 0 1 ${s} 0A${s} ${s} 0 0 1 0 ${s}Z`;
    case "full":
      return `M0 0H${s}V${s}H0Z`;
    default:
      return "";
  }
};

const PATTERN_A: Tile[][] = [
  [["half", M, O, 0], ["diag", M, N, 90], ["leaf", C, O, 0], ["quarter", O, N, 90]],
  [["quarter", N, M, 0], ["half", C, M, 270], ["diag", N, O, 180], ["half", M, O, 180]],
  [["leaf", O, M, 90], ["quarter", C, O, 180], ["half", N, O, 90], ["quarter", M, C, 270]],
];

export function BrandPattern({ tiles = PATTERN_A, size = 100, x = 0, y = 0 }: { tiles?: Tile[][]; size?: number; x?: number; y?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {tiles.map((row, r) =>
        row.map(([k, bg, fg, rot], c) => (
          <g key={`${r}-${c}`} transform={`translate(${c * size} ${r * size}) rotate(${rot} ${size / 2} ${size / 2})`}>
            <rect width={size} height={size} fill={bg} />
            {k !== "none" && <path d={shape(k, size)} fill={fg} />}
          </g>
        )),
      )}
    </g>
  );
}
