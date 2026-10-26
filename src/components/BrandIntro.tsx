import { useEffect, useRef } from "react";
import { INTRO, NAME_STORY } from "../content";
import { Mark } from "../brand/Logo";
import { gsap, ScrollTrigger, prefersReducedMotion } from "../lib/motion";
import { ArrowRight } from "./Icon";
import "./intro.css";

// Five obvious routes all bunch up at the same crowded point; the sixth loops away on its own.
const ORIGIN = { x: 70, y: 330 };
const CROWD = { x: 760, y: 358 };
const ROUTES = [
  { d: "M70 330 C 300 330, 520 360, 760 356", label: { x: 412, y: 334 } },
  { d: "M70 330 C 260 250, 520 300, 760 352", label: { x: 396, y: 280 } },
  { d: "M70 330 C 300 420, 520 400, 760 362", label: { x: 410, y: 384 } },
  { d: "M70 330 C 250 180, 560 250, 760 348", label: { x: 404, y: 234 } },
  { d: "M70 330 C 280 500, 560 430, 760 368", label: { x: 418, y: 426 } },
];
const SIXTH =
  "M70 330 C 150 330, 170 175, 300 140 C 410 110, 520 40, 600 92 C 660 132, 618 214, 552 196 C 482 178, 516 74, 640 64 C 740 56, 820 84, 892 104";
const DEST = { x: 900, y: 106 };

function NameStory() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.set(q(".ns-draw"), { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(q(".ns-label, .ns-crowd, .ns-dest, .ns-copy > *"), { opacity: 0 });
      gsap.set(q(".ns-copy > *"), { y: 24 });
      gsap.set(q(".ns-dest"), { scale: 0.4, transformOrigin: `${DEST.x}px ${DEST.y}px` });
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 0.8 },
      });
      tl.to(q(".ns-copy > *"), { opacity: 1, y: 0, stagger: 0.04, duration: 0.12, ease: "power2.out" }, 0)
        .to(q(".ns-grey"), { strokeDashoffset: 0, stagger: 0.05, duration: 0.24 }, 0.04)
        .to(q(".ns-label"), { opacity: 1, stagger: 0.05, duration: 0.08 }, 0.12)
        .to(q(".ns-crowd"), { opacity: 1, duration: 0.08 }, 0.36)
        .to(q(".ns-greyset"), { opacity: 0.45, duration: 0.1 }, 0.5)
        .to({}, { duration: 0.36 }, 0.5) // the sixth route itself is drawn in follow()
        .to(q(".ns-dest"), { opacity: 1, scale: 1, duration: 0.1, ease: "back.out(2)" }, 0.84);
      const path = el.querySelector<SVGPathElement>(".ns-sixth")!;
      const head = el.querySelector<SVGCircleElement>(".ns-head")!;
      // One progress value drives both the line and its travelling dot, in real path length,
      // so the line always ends exactly under the dot.
      const len = path.getTotalLength();
      path.style.strokeDasharray = `${len} ${len + 2}`;
      const st = tl.scrollTrigger!;
      const follow = () => {
        const p = gsap.utils.clamp(0, 1, (tl.time() - 0.5) / 0.36);
        path.style.strokeDashoffset = String(len * (1 - p) + (p === 0 ? 1 : 0));
        path.style.opacity = p > 0 ? "1" : "0";
        const pt = path.getPointAtLength(len * p);
        head.setAttribute("cx", String(pt.x));
        head.setAttribute("cy", String(pt.y));
        head.style.opacity = p > 0 && p < 1 ? "1" : "0";
      };
      follow();
      tl.eventCallback("onUpdate", follow);
      ScrollTrigger.addEventListener("refresh", follow);
      return () => {
        st.kill();
        ScrollTrigger.removeEventListener("refresh", follow);
      };
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div className="ns" ref={root}>
      <div className="ns__sticky wrap">
        <div className="ns-copy">
          <p className="eyebrow">{NAME_STORY.eyebrow}</p>
          <h3 className="ns__title">
            {NAME_STORY.headline[0]} {NAME_STORY.headline[1]} <span className="accent">{NAME_STORY.accent}</span>
          </h3>
          <p className="ns__body">{NAME_STORY.body}</p>
        </div>
        <svg className="ns__map" viewBox="0 0 1000 620" role="img" aria-label="Five obvious routes end at the same crowded point; the sixth route loops away to somewhere new.">
          <g className="ns-greyset">
            {ROUTES.map((r, i) => (
              <path key={i} className="ns-draw ns-grey" d={r.d} pathLength={1} />
            ))}
            {ROUTES.map((r, i) => (
              <text key={i} className="ns-label" x={r.label.x} y={r.label.y - 8}>
                {NAME_STORY.routes[i]}
              </text>
            ))}
            <g className="ns-crowd">
              {[-6, -2, 2, 6, 10].map((o, i) => (
                <circle key={i} cx={CROWD.x + (i % 2 ? 4 : -2)} cy={CROWD.y + o - 2} r={4} />
              ))}
              <text x={CROWD.x + 20} y={CROWD.y + 6}>
                Somewhere crowded
              </text>
            </g>
          </g>
          <circle className="ns-origin" cx={ORIGIN.x} cy={ORIGIN.y} r={7} />
          <text className="ns-origin-label" x={ORIGIN.x - 6} y={ORIGIN.y + 34}>
            Your brief
          </text>
          <path className="ns-sixth" d={SIXTH} />
          <circle className="ns-head" r={7} cx={ORIGIN.x} cy={ORIGIN.y} />
          <g className="ns-dest">
            <circle cx={DEST.x} cy={DEST.y} r={58} className="ns-dest-halo" />
            <svg x={DEST.x - 34} y={DEST.y - 34} width={68} height={68} viewBox="0 0 100 100" overflow="visible">
              <Mark size={100} />
            </svg>
            <text x={DEST.x} y={DEST.y + 70} textAnchor="middle">
              {NAME_STORY.sixth}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

export function BrandIntro() {
  return (
    <>
      <section id="about" className="intro on-light" data-nav="light">
        <div className="wrap intro__grid">
          <div>
            <p className="eyebrow" data-reveal>
              {INTRO.eyebrow}
            </p>
            <h2 className="intro__title" data-reveal style={{ ["--reveal-delay" as string]: "80ms" }}>
              {INTRO.headline}
            </h2>
          </div>
          <div className="intro__copy">
            <p className="intro__lead" data-reveal>
              {INTRO.lead}
            </p>
            <p className="intro__body" data-reveal style={{ ["--reveal-delay" as string]: "80ms" }}>
              {INTRO.body}
            </p>
            <div className="intro__sign" data-reveal style={{ ["--reveal-delay" as string]: "160ms" }}>
              <p className="intro__statement">{INTRO.statement}</p>
              <a href="#story" className="text-link">
                {INTRO.link} <ArrowRight />
              </a>
            </div>
          </div>
        </div>
      </section>
      <section id="story" className="story on-light" data-nav="light" aria-label="Where our name comes from">
        <NameStory />
      </section>
    </>
  );
}
