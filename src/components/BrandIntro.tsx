import { useEffect, useRef } from "react";
import { HERO, INTRO, NAME_STORY } from "../content";
import { Mark } from "../brand/Logo";
import { LANDSCAPE_PHONE, PHONE, useMedia } from "../lib/media";
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

type Map = {
  view: string;
  origin: { x: number; y: number };
  crowd: { x: number; y: number };
  routes: { d: string; label: { x: number; y: number } }[];
  sixth: string;
  dest: { x: number; y: number };
};
const LANDSCAPE: Map = { view: "0 0 1000 620", origin: ORIGIN, crowd: CROWD, routes: ROUTES, sixth: SIXTH, dest: DEST };

// Phones: the same story drawn top to bottom. The brief starts at the top, the five routes fall
// to a crowd at the bottom, and the sixth breaks right, loops, and lands on the mark. Labels sit
// on their own route (staggered so they never meet), and carry just the one word that differs.
const PORTRAIT: Map = {
  view: "0 0 400 660",
  origin: { x: 110, y: 58 },
  crowd: { x: 124, y: 606 },
  routes: [
    { d: "M110 58 C 114 240, 138 430, 124 604", label: { x: 126, y: 400 } },
    { d: "M110 58 C 44 220, 46 446, 120 602", label: { x: 69, y: 217 } },
    { d: "M110 58 C 184 230, 176 456, 128 603", label: { x: 162, y: 282 } },
    { d: "M110 58 C 4 270, 14 506, 117 607", label: { x: 37, y: 344 } },
    { d: "M110 58 C 226 220, 206 486, 131 606", label: { x: 191, y: 378 } },
  ],
  sixth:
    "M110 58 C 150 58, 210 86, 250 134 C 300 192, 362 220, 342 290 C 322 356, 242 338, 262 278 C 282 218, 372 256, 362 344 C 354 410, 332 440, 318 468",
  dest: { x: 316, y: 478 },
};
const shortName = (label: string) => label.replace(/^The\s+/i, "").replace(/\s+route$/i, "");

function NameStory() {
  const root = useRef<HTMLDivElement>(null);
  const phone = useMedia(PHONE);
  // A phone on its side is too short to pin: the map is simply shown, fully drawn.
  const flat = useMedia(LANDSCAPE_PHONE);
  const map = phone ? PORTRAIT : LANDSCAPE;
  const { origin, crowd, dest } = map;

  useEffect(() => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    if (prefersReducedMotion() || flat) return;
    const { dest } = phone ? PORTRAIT : LANDSCAPE;
    const ctx = gsap.context(() => {
      // Grey routes draw by real length (no zero-length caps left behind at their ends).
      const greys = Array.from(el.querySelectorAll<SVGPathElement>(".ns-grey"));
      greys.forEach((g) => {
        const l = g.getTotalLength();
        gsap.set(g, { strokeDasharray: `${l} ${l + 2}`, strokeDashoffset: l + 1 });
      });
      gsap.set(q(".ns-label, .ns-crowd, .ns-dest"), { opacity: 0 });
      gsap.set(q(".ns-dest"), { scale: 0.4, transformOrigin: `${dest.x}px ${dest.y}px` });
      // The copy is already there as the section arrives; the map starts drawing while the
      // section is still scrolling in, then keeps going once it pins. Phones don't pin: the map
      // draws downward as it scrolls up the screen, so the drawing stays in view.
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: phone
          ? { trigger: q(".ns__map")[0], start: "top 72%", end: "bottom 88%", scrub: 0.6 }
          : { trigger: el, start: "top 55%", end: "bottom bottom", scrub: 0.6 },
      });
      tl.to(greys, { strokeDashoffset: 0, stagger: 0.04, duration: 0.2 }, 0)
        .to(q(".ns-label"), { opacity: 1, stagger: 0.04, duration: 0.06 }, 0.08)
        .to(q(".ns-crowd"), { opacity: 1, duration: 0.08 }, 0.3)
        .to(q(".ns-greyset"), { opacity: 0.45, duration: 0.1 }, 0.44)
        .to({}, { duration: 0.4 }, 0.44) // the sixth route itself is drawn in follow()
        .to(q(".ns-dest"), { opacity: 1, scale: 1, duration: 0.1, ease: "back.out(2)" }, 0.84)
        .to({}, { duration: 0.06 }, 0.94);
      const path = el.querySelector<SVGPathElement>(".ns-sixth")!;
      const head = el.querySelector<SVGCircleElement>(".ns-head")!;
      // One progress value drives both the line and its travelling dot, in real path length,
      // so the line always ends exactly under the dot.
      const len = path.getTotalLength();
      path.style.strokeDasharray = `${len} ${len + 2}`;
      const st = tl.scrollTrigger!;
      const follow = () => {
        const p = gsap.utils.clamp(0, 1, (tl.time() - 0.44) / 0.4);
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
  }, [phone, flat]);

  return (
    <div className="ns" ref={root}>
      <div className="ns__sticky wrap">
        <div className="ns-copy" data-reveal>
          <p className="eyebrow">{NAME_STORY.eyebrow}</p>
          <h3 className="ns__title">
            {NAME_STORY.headline[0]} {NAME_STORY.headline[1]} <span className="accent">{NAME_STORY.accent}</span>
          </h3>
          <p className="ns__body">{NAME_STORY.body}</p>
        </div>
        <svg
          key={phone ? "portrait" : "landscape"}
          className={`ns__map ${phone ? "ns__map--portrait" : ""}`}
          viewBox={map.view}
          role="img"
          aria-label="Five obvious routes end at the same crowded point; the sixth route loops away to somewhere new."
        >
          <g className="ns-greyset">
            {map.routes.map((r, i) => (
              <path key={i} className="ns-grey" d={r.d} />
            ))}
            {map.routes.map((r, i) =>
              phone ? (
                <text key={i} className="ns-label" x={r.label.x} y={r.label.y} textAnchor="middle" dominantBaseline="middle">
                  {shortName(NAME_STORY.routes[i])}
                </text>
              ) : (
                <text key={i} className="ns-label" x={r.label.x} y={r.label.y - 8}>
                  {NAME_STORY.routes[i]}
                </text>
              ),
            )}
            <g className="ns-crowd">
              {[-6, -2, 2, 6, 10].map((o, i) => (
                <circle key={i} cx={crowd.x + (i % 2 ? 4 : -2)} cy={crowd.y + o - 2} r={4} />
              ))}
              <text x={crowd.x + 20} y={crowd.y + 6}>
                Somewhere crowded
              </text>
            </g>
          </g>
          <circle className="ns-origin" cx={origin.x} cy={origin.y} r={7} />
          {phone ? (
            <text className="ns-origin-label" x={origin.x} y={origin.y - 22} textAnchor="middle">
              Your brief
            </text>
          ) : (
            <text className="ns-origin-label" x={origin.x - 6} y={origin.y + 34}>
              Your brief
            </text>
          )}
          <path className="ns-sixth" d={map.sixth} />
          <circle className="ns-head" r={7} cx={origin.x} cy={origin.y} />
          <g className="ns-dest">
            <circle cx={dest.x} cy={dest.y} r={phone ? 50 : 58} className="ns-dest-halo" />
            <svg x={dest.x - 34} y={dest.y - 34} width={68} height={68} viewBox="0 0 100 100" overflow="visible">
              <Mark size={100} />
            </svg>
            <text x={dest.x} y={dest.y + 70} textAnchor="middle">
              {NAME_STORY.sixth}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

export function BrandIntro() {
  const phone = useMedia(PHONE);
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
            {phone ? (
              // Phones keep the opener short: the rest of the story (and the hero's line, which
              // the phone hero leaves out) is one tap away.
              <details className="intro__more" data-reveal style={{ ["--reveal-delay" as string]: "80ms" }}>
                <summary>More about how we work</summary>
                <p className="intro__body">{HERO.body}</p>
                <p className="intro__body">{INTRO.body}</p>
              </details>
            ) : (
              <p className="intro__body" data-reveal style={{ ["--reveal-delay" as string]: "80ms" }}>
                {INTRO.body}
              </p>
            )}
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
