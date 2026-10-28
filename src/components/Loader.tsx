import { useEffect, useId, useRef } from "react";
import { gsap, prefersReducedMotion } from "../lib/motion";
import { matches, PHONE, TOUCH, useMedia } from "../lib/media";
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
// The opening plays once per browser tab; `?intro` replays it, `?nointro` skips it.
const SEEN = "sr-intro-seen";
const seen = () => {
  try {
    return sessionStorage.getItem(SEEN) === "1";
  } catch {
    return false;
  }
};
const markSeen = () => {
  try {
    sessionStorage.setItem(SEEN, "1");
  } catch {
    /* storage blocked: the intro simply plays again next time */
  }
};

export function Loader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const touch = useMedia(TOUCH);
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
      markSeen();
      done.current();
    };
    // Skip the opening when motion is reduced, when arriving at a section from another page, or
    // when this tab has already seen it.
    const params = new URLSearchParams(location.search);
    const skip =
      prefersReducedMotion() || location.hash.length > 1 || params.has("nointro") || (seen() && !params.has("intro"));
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
      // On a phone the mark gets a larger share of the (narrow) screen.
      const phone = matches(PHONE);
      const sA = (Math.min(vw, vh) * (phone ? 0.4 : 0.3)) / m.width;
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

      // Each ribbon is anchored to a screen edge and unrolls from it: the 6 from the left edge,
      // the circle from the bottom edge. Edges are converted to the mark's viewBox units
      // (screen centre = mark centre = 50,50 at the start scale).
      const unit = (m.width * sA) / 100;
      const off = 24;
      const leftEdge: [number, number] = [50 - (vw / 2 + off) / unit, 50 + (vh * 0.16) / unit];
      const bottomEdge: [number, number] = [50 + (vw * 0.18) / unit, 50 + (vh / 2 + off) / unit];
      const shapes = { route: routeRibbon(leftEdge), coil: coilRibbon(bottomEdge) };
      const setD = (sel: string, d: string) => el.querySelectorAll(sel).forEach((p) => p.setAttribute("d", d));
      setD(".ld-rib-route", shapes.route.full);
      setD(".ld-m-route-lead", shapes.route.lead);
      setD(".ld-rib-coil", shapes.coil.full);
      setD(".ld-m-coil-lead", shapes.coil.lead);

      // The visible stretch of a ribbon is [tail, head] along lead-in + shape. The head runs out to
      // the end of the shape while the tail stays pinned at the screen edge; only once the shape
      // is drawn does the tail let go and slide in, leaving the ribbon resting exactly on the shape.
      const ribbon = (sel: string, measure: string) => {
        const L = el.querySelector<SVGPathElement>(`${measure}-lead`)!.getTotalLength();
        const M = el.querySelector<SVGPathElement>(`${measure}-main`)!.getTotalLength();
        const paths = Array.from(el.querySelectorAll<SVGPathElement>(sel));
        const span = { tail: 0, head: 0 };
        const apply = () => {
          const t = Math.min(span.tail, span.head);
          gsap.set(paths, { strokeDasharray: `0 ${t} ${Math.max(span.head - t, 0.001)} ${L + M + 10}` });
        };
        gsap.set(paths, { strokeDashoffset: 0, opacity: 1 });
        apply();
        return { span, apply, L, total: L + M };
      };
      const route = ribbon(".ld-rib-route", ".ld-m-route");
      const coil = ribbon(".ld-rib-coil", ".ld-m-coil");

      const tl = gsap.timeline({ onComplete: finish });
      tl.to(route.span, { head: route.total, duration: 1.4, ease: "power2.inOut", onUpdate: route.apply }, 0.1)
        .to(route.span, { tail: route.L, duration: 0.9, ease: "power2.inOut", onUpdate: route.apply }, 0.95)
        .to(coil.span, { head: coil.total, duration: 1.45, ease: "power2.inOut", onUpdate: coil.apply }, 1.0)
        .to(coil.span, { tail: coil.L, duration: 0.8, ease: "power2.inOut", onUpdate: coil.apply }, 1.8)
        .to(q(".ld-rib-route.is-base"), { stroke: "#420D0F", duration: 0.7, ease: "power1.inOut" }, 1.75)
        .to(q(".ld-rib-shine"), { opacity: 0, duration: 0.5 }, 1.9)
        // Settle: a circular clip tucks the ribbon ends (and the coil's start cap) into the
        // circle, then the exact mark crossfades in as the ribbons fade out — no bumps, no swap.
        .set(q(".ld-ribclip"), { attr: { r: 72 } }, 2.55) // only now: until here the ribbons run to the screen edge
        .to(q(".ld-ribclip"), { attr: { r: 50 }, duration: 0.3, ease: "power2.out" }, 2.55)
        .to(q(".ld-final"), { opacity: 1, duration: 0.34, ease: "power1.inOut" }, 2.66)
        .to(q(".ld-ribbons"), { opacity: 0, duration: 0.34, ease: "power1.inOut" }, 2.7)
        .fromTo(q(".ld-glow"), { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power2.out" }, 2.85)
        // Centre the full lockup and raise the wordmark.
        .to(lk, { ...at(r.width / 2, r.height / 2, sB), duration: 0.9, ease: "expo.inOut" }, 3.1)
        .to(q(".ld-ch"), { yPercent: 0, duration: 0.7, stagger: 0.035, ease: "expo.out" }, 3.45)
        .fromTo(q(".ld-tagline"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 3.7)
        // Fly into the nav while the curtain dissolves (a fade has no hard edge to sweep across).
        .to(q(".ld-tagline"), { opacity: 0, duration: 0.35 }, 4.45)
        .to(lk, { x: 0, y: 0, scale: 1, duration: 1.1, ease: "expo.inOut" }, 4.5)
        .to(q(".ld-glow"), { opacity: 0, duration: 0.6 }, 4.75)
        .to(q(".ld-curtain"), { opacity: 0, duration: 0.95, ease: "power2.inOut" }, 4.7);

      // Phones run the same sequence a little quicker.
      if (phone) tl.timeScale(1.12);

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
        <p className="ld-skip">{touch ? "Tap to skip" : "Click to skip"}</p>
      </div>

      <div className="ld-lockup lockup" ref={lockup}>
        <svg className="ld-mark lockup__mark" viewBox="0 0 100 100" width="1.9em" height="1.9em">
          <defs>
            <clipPath id={clip}>
              <circle cx="50" cy="50" r="50" />
            </clipPath>
            <clipPath id={`${clip}-rib`}>
              <circle className="ld-ribclip" cx="50" cy="50" r="5000" />
            </clipPath>
            {/* Measuring paths: lengths of each lead-in and of the shape it settles on. */}
            <path className="ld-m-route-lead" d={ROUTE_RIBBON.lead} />
            <path className="ld-m-route-main" d={ROUTE_RIBBON.main} />
            <path className="ld-m-coil-lead" d={COIL_RIBBON.lead} />
            <path className="ld-m-coil-main" d={COIL_RIBBON.main} />
          </defs>
          <circle className="ld-glow" cx="50" cy="50" r="50" />

          <g className="ld-ribbons" fill="none" strokeLinecap="round" strokeLinejoin="round" clipPath={`url(#${clip}-rib)`}>
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
