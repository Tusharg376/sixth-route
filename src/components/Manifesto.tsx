import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { MANIFESTO, MANIFESTO_SCENE as M } from "../content";
import { Mark } from "../brand/Logo";
import { gsap, prefersReducedMotion } from "../lib/motion";
import "./manifesto.css";

type Box = { x: number; y: number; w: number; h: number };

/** Route for one pair: underline the first word, U-turn round its end, then underline the second
 *  word right-to-left. One continuous route joins both words; neither is crossed out. */
function link(from: Box, to: Box, maxX: number) {
  const ya = from.y + from.h * 0.97;
  const x0 = from.x - 6;
  const xe = from.x + from.w + 18;
  const yu = to.y + to.h * 0.98;
  const xr = to.x + to.w + 18;
  const xl = to.x - 6;
  const turn = Math.min(Math.max(xe, xr) + Math.max(60, (yu - ya) * 0.55), maxX);
  return `M${x0} ${ya}L${xe} ${ya}C${turn} ${ya} ${turn} ${yu} ${xr} ${yu}L${xl} ${yu}`;
}

export function Manifesto() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<{ pairs: string[]; future: string; end: { x: number; y: number } } | null>(null);
  const reduced = prefersReducedMotion();

  // Measure word boxes and build each pair's route (on load, font swap and resize).
  useLayoutEffect(() => {
    if (reduced) return;
    const st = stage.current!;
    const measure = () => {
      const base = st.getBoundingClientRect();
      // Layout offsets (not on-screen boxes), so animation transforms never skew the routes.
      const box = (el: Element | null): Box => {
        let n = el as HTMLElement | null;
        let x = 0;
        let y = 0;
        while (n && n !== st) {
          x += n.offsetLeft;
          y += n.offsetTop;
          n = n.offsetParent as HTMLElement | null;
        }
        const he = el as HTMLElement;
        return { x, y, w: he.offsetWidth, h: he.offsetHeight };
      };
      const pairs = Array.from(st.querySelectorAll(".mf-pair")).map((p) => link(box(p.querySelector(".mf-from")), box(p.querySelector(".mf-to")), base.width - 8));
      const fut = box(st.querySelector(".mf-create"));
      const ys = fut.y + fut.h * 0.98;
      const endX = Math.min(base.width - 60, fut.x + fut.w + 220);
      setPaths({ pairs, future: `M${fut.x} ${ys}L${endX - 46} ${ys}`, end: { x: endX, y: ys } });
    };
    measure();
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(st);
    return () => ro.disconnect();
  }, [reduced]);

  // One scrubbed timeline: each pair is one beat, then the finale.
  useEffect(() => {
    if (reduced || !paths) return;
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const ctx = gsap.context(() => {
      const lines = q(".mf-line") as unknown as SVGPathElement[];
      lines.forEach((l) => {
        const len = l.getTotalLength();
        gsap.set(l, { strokeDasharray: `${len} ${len + 2}`, strokeDashoffset: len + 1 });
      });
      gsap.set(q(".mf-pair"), { autoAlpha: 0 });
      gsap.set(q(".mf-from, .mf-to"), { yPercent: 70, opacity: 0 });
      gsap.set(q(".mf-finale > *"), { autoAlpha: 0, y: 40 });
      gsap.set(q(".mf-endmark"), { scale: 0, transformOrigin: "50% 50%" });

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 0.7 },
      });
      tl.from(q(".mf-q span"), { yPercent: 100, opacity: 0, stagger: 0.08, duration: 0.35 }, 0);
      M.pairs.forEach((_, i) => {
        const t = 0.4 + i;
        const pair = q(".mf-pair")[i];
        const pq = gsap.utils.selector(pair);
        const line = lines[i];
        tl.set(pair, { autoAlpha: 1 }, t)
          .set(q(".mf-count b"), { textContent: String(i + 1).padStart(2, "0") }, t)
          .to(pq(".mf-from"), { yPercent: 0, opacity: 1, duration: 0.18 }, t)
          .to(line, { strokeDashoffset: 0, duration: 0.42, ease: "power1.inOut" }, t + 0.16)
          .to(pq(".mf-to"), { yPercent: 0, opacity: 1, duration: 0.2 }, t + 0.42)
          .to(pair, { autoAlpha: 0, yPercent: -18, duration: 0.18, ease: "power2.in" }, t + 0.8)
          .to(line, { opacity: 0, duration: 0.14 }, t + 0.8);
      });
      const f = 0.4 + M.pairs.length;
      tl.to(q(".mf-top"), { autoAlpha: 0, y: -30, duration: 0.25 }, f)
        .to(q(".mf-finale > *"), { autoAlpha: 1, y: 0, stagger: 0.12, duration: 0.3 }, f + 0.1)
        .to(lines[lines.length - 1], { strokeDashoffset: 0, duration: 0.4, ease: "power1.inOut" }, f + 0.3)
        .to(q(".mf-endmark"), { scale: 1, duration: 0.2, ease: "back.out(2)" }, f + 0.66)
        .to({}, { duration: 0.6 });
    }, el);
    return () => ctx.revert();
  }, [paths, reduced]);

  if (reduced) {
    return (
      <section className="mf2 mf2--static on-dark" data-nav="dark" aria-label="Manifesto">
        <div className="wrap">
          {MANIFESTO.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mf2 on-dark" data-nav="dark" ref={root} style={{ ["--beats" as string]: M.pairs.length + 2 }}>
      <p className="sr-only">{MANIFESTO.join(" ")}</p>
      <div className="mf2__sticky" aria-hidden="true">
        <div className="mf2__stage wrap" ref={stage}>
          <div className="mf-top">
            <p className="eyebrow mf-eyebrow">Manifesto</p>
            <p className="mf-q">
              <span>{M.question[0]}</span> <span className="accent">{M.question[1]}</span>
            </p>
            <p className="mf-count">
              <b>01</b> / {String(M.pairs.length).padStart(2, "0")}
            </p>
          </div>

          <div className="mf-pairs">
            {M.pairs.map(([from, to]) => (
              <div className="mf-pair" key={from}>
                <span className="mf-verb">{M.verb}</span>
                <span className="mf-from">{from}</span>
                <span className="mf-to accent">{to}</span>
              </div>
            ))}
          </div>

          <div className="mf-finale">
            <p className="mf-future">{M.future[0]}</p>
            <p className="mf-create accent">{M.future[1]}</p>
            <p className="mf-closers">
              {M.closers.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </p>
            <p className="mf-welcome">{M.welcome}</p>
          </div>

          <svg className="mf-routes" aria-hidden="true">
            {paths?.pairs.map((d, i) => <path key={i} className="mf-line" d={d} />)}
            {paths && <path className="mf-line mf-line--future" d={paths.future} />}
            {paths && (
              <g className="mf-endmark" style={{ transformOrigin: `${paths.end.x}px ${paths.end.y}px` }}>
                <svg x={paths.end.x - 30} y={paths.end.y - 30} width={60} height={60} viewBox="0 0 100 100" overflow="visible">
                  <Mark size={100} glow />
                </svg>
              </g>
            )}
          </svg>
        </div>
      </div>
    </section>
  );
}
