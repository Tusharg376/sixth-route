import { useEffect, useId, useRef } from "react";
import { gsap, prefersReducedMotion } from "../lib/motion";
import { ROUTE_OUTLINE } from "../brand/logoData";
import { COIL_RIBBON, ROUTE_RIBBON, coilRibbon, routeRibbon } from "../brand/ribbons";
import "./loader.css";

/**
 * Opening sequence, built with ribbons:
 * an orange ribbon flies in from the bottom-left and threads the 6 (tail first) ->
 * a second ribbon sweeps in from the bottom-right and coils inward to build the circle while
 * the 6 darkens to maroon -> the exact mark takes over and glows -> the wordmark rises ->
 * the lockup flies into the nav slot while the curtain lifts.
 */
export function Loader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const lockup = useRef<HTMLDivElement>(null);
  const clip = useId();
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });

  useEffect(() => {
    const el = root.current!;
    const lk = lockup.current!;
    const target = document.querySelector<HTMLElement>("[data-nav-lockup]");
    const finish = () => {
      document.body.classList.remove("is-loading");
      done.current();
    };
    // Skip the opening when motion is reduced, or when arriving at a section from another page.
    const skip = prefersReducedMotion() || location.hash.length > 1 || new URLSearchParams(location.search).has("nointro");
    if (!target || skip) {
      finish();
      return;
    }
    document.body.classList.add("is-loading");
    window.scrollTo(0, 0);

    const q = gsap.utils.selector(el);
    const ctx = gsap.context(() => {
      // Sit the loader lockup exactly on top of the nav lockup, then transform it to centre stage.
      const r = target.getBoundingClientRect();
      gsap.set(lk, { left: r.left, top: r.top, width: r.width, height: r.height });
      const mark = lk.querySelector<SVGSVGElement>(".ld-mark")!;
      const m = mark.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const sA = (Math.min(vw, vh) * 0.3) / m.width;
      const at = (lx: number, ly: number, s: number) => ({
        x: vw / 2 - (r.left + lx * s),
        y: vh / 2 - (r.top + ly * s),
        scale: s,
      });
      const markCx = m.left - r.left + m.width / 2;
      const markCy = m.top - r.top + m.height / 2;
      const sB = Math.min(sA * 0.62, (vw * 0.78) / r.width);

      gsap.set(lk, { transformOrigin: "0 0", ...at(markCx, markCy, sA) });
      gsap.set(q(".ld-ch"), { yPercent: 115 });
      gsap.set(q(".ld-final"), { opacity: 0 });

      // Ribbons enter just outside the bottom corners of *this* screen: convert the corners to the
      // mark's viewBox units (screen centre = mark centre = 50,50 at the start scale).
      const unit = (m.width * sA) / 100;
      const off = 30;
      const corner = (sx: number): [number, number] => [50 + (sx * (vw / 2 + off)) / unit, 50 + (vh / 2 + off) / unit];
      const shapes = { route: routeRibbon(corner(-1)), coil: coilRibbon(corner(1)) };
      const setD = (sel: string, d: string) => el.querySelectorAll(sel).forEach((p) => p.setAttribute("d", d));
      setD(".ld-rib-route", shapes.route.full);
      setD(".ld-m-route-lead", shapes.route.lead);
      setD(".ld-rib-coil", shapes.coil.full);
      setD(".ld-m-coil-lead", shapes.coil.lead);

      // A ribbon of fixed length (the shape's own length) slides along lead-in + shape and
      // comes to rest exactly on the shape: dash offset runs from +shape (hidden) to -lead.
      const ribbon = (sel: string, measure: string) => {
        const lead = el.querySelector<SVGPathElement>(`${measure}-lead`)!;
        const main = el.querySelector<SVGPathElement>(`${measure}-main`)!;
        const L = lead.getTotalLength();
        const M = main.getTotalLength();
        const paths = Array.from(el.querySelectorAll<SVGPathElement>(sel));
        gsap.set(paths, { strokeDasharray: `${M} ${L + M + 10}`, strokeDashoffset: M, opacity: 1 });
        return { paths, to: -L };
      };
      const route = ribbon(".ld-rib-route", ".ld-m-route");
      const coil = ribbon(".ld-rib-coil", ".ld-m-coil");

      const tl = gsap.timeline({ onComplete: finish });
      tl.to(route.paths, { strokeDashoffset: route.to, duration: 1.5, ease: "power2.inOut" }, 0.1)
        .to(coil.paths, { strokeDashoffset: coil.to, duration: 1.5, ease: "power2.inOut" }, 1.0)
        .to(q(".ld-rib-route.is-base"), { stroke: "#420D0F", duration: 0.7, ease: "power1.inOut" }, 1.75)
        .to(q(".ld-rib-shine"), { opacity: 0, duration: 0.5 }, 1.9)
        // The exact mark takes over from the ribbons.
        .to(q(".ld-final"), { opacity: 1, duration: 0.35, ease: "power1.out" }, 2.5)
        .set(q(".ld-ribbons"), { opacity: 0 }, 2.9)
        .fromTo(q(".ld-glow"), { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power2.out" }, 2.75)
        // Centre the full lockup and raise the wordmark.
        .to(lk, { ...at(r.width / 2, r.height / 2, sB), duration: 0.9, ease: "expo.inOut" }, 3.0)
        .to(q(".ld-ch"), { yPercent: 0, duration: 0.7, stagger: 0.035, ease: "expo.out" }, 3.35)
        .fromTo(q(".ld-tagline"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 3.6)
        // Fly into the nav and lift the curtain.
        .to(q(".ld-tagline"), { opacity: 0, duration: 0.35 }, 4.35)
        .to(lk, { x: 0, y: 0, scale: 1, duration: 1.1, ease: "expo.inOut" }, 4.4)
        .to(q(".ld-glow"), { opacity: 0, duration: 0.6 }, 4.65)
        .to(q(".ld-curtain"), { yPercent: -100, duration: 1.05, ease: "expo.inOut" }, 4.55);

      const skipIntro = () => tl.progress(1);
      el.addEventListener("click", skipIntro);
      window.addEventListener("keydown", skipIntro, { once: true });
      return () => {
        el.removeEventListener("click", skipIntro);
        window.removeEventListener("keydown", skipIntro);
      };
    }, el);
    return () => {
      ctx.revert();
      document.body.classList.remove("is-loading");
    };
  }, []);

  return (
    <div className="loader" ref={root} aria-hidden="true">
      <div className="ld-curtain">
        <div className="ld-ember ld-ember--a" />
        <div className="ld-ember ld-ember--b" />
        <p className="ld-tagline">Beyond the obvious.</p>
        <p className="ld-skip">Click to skip</p>
      </div>

      <div className="ld-lockup lockup" ref={lockup}>
        <svg className="ld-mark lockup__mark" viewBox="0 0 100 100" width="1.9em" height="1.9em">
          <defs>
            <clipPath id={clip}>
              <circle cx="50" cy="50" r="50" />
            </clipPath>
            {/* Measuring paths: lengths of each lead-in and of the shape it settles on. */}
            <path className="ld-m-route-lead" d={ROUTE_RIBBON.lead} />
            <path className="ld-m-route-main" d={ROUTE_RIBBON.main} />
            <path className="ld-m-coil-lead" d={COIL_RIBBON.lead} />
            <path className="ld-m-coil-main" d={COIL_RIBBON.main} />
          </defs>
          <circle className="ld-glow" cx="50" cy="50" r="50" />

          <g className="ld-ribbons" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Circle ribbon sits behind the 6. */}
            <path className="ld-rib-coil is-base" d={COIL_RIBBON.full} stroke="var(--sr-orange)" strokeWidth={COIL_RIBBON.width} />
            <path className="ld-rib-coil ld-rib-shine" d={COIL_RIBBON.full} stroke="rgba(255,252,244,.28)" strokeWidth={1.6} />
            <path className="ld-rib-route is-base" d={ROUTE_RIBBON.full} stroke="#FF8221" strokeWidth={9.5} />
            <path className="ld-rib-route ld-rib-shine" d={ROUTE_RIBBON.full} stroke="rgba(255,252,244,.55)" strokeWidth={2.2} />
          </g>

          <g className="ld-final">
            <circle cx="50" cy="50" r="50" fill="var(--sr-orange)" />
            <path d={ROUTE_OUTLINE} fill="var(--sr-maroon)" fillRule="evenodd" clipPath={`url(#${clip})`} />
          </g>
        </svg>
        <span className="wordmark wordmark--dark">
          <span className="wordmark__a ld-clip">
            {"SIXTH".split("").map((c, i) => (
              <span key={i} className="ld-ch">
                {c}
              </span>
            ))}
          </span>
          <span className="wordmark__b ld-clip">
            {"ROUTE".split("").map((c, i) => (
              <span key={i} className="ld-ch">
                {c}
              </span>
            ))}
          </span>
        </span>
      </div>
    </div>
  );
}
