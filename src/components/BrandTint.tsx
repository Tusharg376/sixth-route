import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import "./brandtint.css";

/**
 * Hosts a ThreeUI effect and recolours it into the brand palette: the effect is reduced to
 * luminance, multiplied by Sixth Orange, and screened onto the dark section behind it, so its
 * own background disappears and only orange light remains. Mounted only while near the viewport.
 */
export function BrandTint({ children, strength = 1, className = "" }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { rootMargin: "200px" });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`tint ${className}`} style={{ ["--tint-strength" as string]: strength }} aria-hidden="true">
      <div className="tint__fx">{live && <Suspense fallback={null}>{children}</Suspense>}</div>
    </div>
  );
}
