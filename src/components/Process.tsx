import { useEffect, useRef } from "react";
import { PROCESS, PROCESS_HEAD } from "../content";
import { PHONE, useMedia } from "../lib/media";
import { gsap, prefersReducedMotion } from "../lib/motion";
import "./process.css";

// The same six points appear on every card; each step does more with them, so the four cards
// read as one route being found, planned, drawn and launched.
const DOTS: [number, number][] = [
  [34, 168],
  [86, 70],
  [132, 146],
  [182, 92],
  [226, 172],
  [266, 58],
];
const ROUTE = "M34 168 C 50 110, 70 70, 86 70 S 118 150, 132 146 S 166 90, 182 92 S 214 176, 226 172 S 252 70, 266 58";

function StepArt({ step }: { step: number }) {
  return (
    <svg className="step-art" viewBox="0 0 300 220" aria-hidden="true">
      {step === 0 && <circle className="sa-draw" cx="132" cy="146" r="34" pathLength={1} strokeDasharray="0.04 0.03" />}
      {step === 1 && (
        <polyline className="sa-draw sa-dash" points={DOTS.map((d) => d.join(",")).join(" ")} pathLength={1} />
      )}
      {step >= 2 && <path className="sa-draw sa-route" d={ROUTE} pathLength={1} />}
      {step === 3 && (
        <>
          <path className="sa-draw sa-route" d="M266 58 L 296 22" pathLength={1} />
          <path className="sa-draw sa-route" d="M276 20 H 297 V 41" pathLength={1} />
        </>
      )}
      {DOTS.map(([x, y], i) => (
        <circle key={i} className={`sa-dot ${step >= 2 ? "is-on" : ""}`} cx={x} cy={y} r={step === 0 && i === 2 ? 7 : 5.5} style={{ ["--d" as string]: `${i * 70}ms` }} />
      ))}
    </svg>
  );
}

export function Process() {
  const phone = useMedia(PHONE);
  return phone ? <ProcessTimeline /> : <ProcessStaircase />;
}

/**
 * Phones: the staircase becomes one route running down the page. The orange line draws with the
 * scroll and each step's node lights as the line reaches it; the step art draws in with it.
 */
function ProcessTimeline() {
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = list.current!;
    const steps = Array.from(el.querySelectorAll<HTMLElement>(".ptl__step"));
    // The line runs node to node: it stops at the last node, not at the end of the list.
    const tail = () => steps[steps.length - 1].offsetHeight - 12;
    const setTail = () => el.style.setProperty("--tail", `${tail()}px`);
    setTail();
    const ro = new ResizeObserver(setTail);
    ro.observe(el);
    if (prefersReducedMotion()) {
      el.style.setProperty("--p", "1");
      steps.forEach((s) => s.classList.add("is-on"));
      return () => ro.disconnect();
    }
    const ctx = gsap.context(() => {
      // The line's head rides the 62% line of the screen; a node lights the moment it arrives.
      gsap.fromTo(
        el,
        { "--p": 0 },
        { "--p": 1, ease: "none", scrollTrigger: { trigger: el, start: "top+=12 62%", end: () => `bottom-=${tail()} 62%`, scrub: 0.3, invalidateOnRefresh: true } },
      );
      steps.forEach((s) =>
        gsap.timeline({
          scrollTrigger: { trigger: s, start: "top+=12 62%", onEnter: () => s.classList.add("is-on"), onLeaveBack: () => s.classList.remove("is-on") },
        }),
      );
    }, el);
    return () => {
      ctx.revert();
      ro.disconnect();
    };
  }, []);

  return (
    <section className="process process--timeline on-dark" data-nav="dark" aria-labelledby="process-title">
      <div className="wrap">
        <header className="section-head process__head">
          <div>
            <p className="eyebrow">{PROCESS_HEAD.eyebrow}</p>
            <h2 id="process-title">{PROCESS_HEAD.headline}</h2>
          </div>
          <p>{PROCESS_HEAD.body}</p>
        </header>
        <ol className="ptl" ref={list}>
          {PROCESS.map((p, i) => (
            <li key={p.title} className="ptl__step">
              <span className="ptl__node" aria-hidden="true" />
              <div className="ptl__head">
                <span className="ptl__num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{p.title}</h3>
              </div>
              <StepArt step={i} />
              <p>{p.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Desktop and tablet: the sticky staircase of cards. */
function ProcessStaircase() {
  const stage = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLElement>(null);

  // Cards lock just below the sticky header, whatever height the header wraps to.
  useEffect(() => {
    const s = stage.current!;
    const h = head.current!;
    const set = () => s.style.setProperty("--stick", `${h.offsetHeight + 116}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(h);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("is-in")),
      { threshold: 0.75 },
    );
    s.querySelectorAll(".pcard").forEach((c) => io.observe(c));
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <section className="process on-dark" data-nav="dark" aria-labelledby="process-title">
      <div className="process__stage wrap" ref={stage}>
        {/* The rail ends one card-height early, so the header lets go together with the cards. */}
        <div className="process__rail">
          <header className="section-head process__head" ref={head}>
            <div>
              <p className="eyebrow">{PROCESS_HEAD.eyebrow}</p>
              <h2 id="process-title">{PROCESS_HEAD.headline}</h2>
            </div>
            <p>{PROCESS_HEAD.body}</p>
          </header>
        </div>
        <ol className="process__track">
          {PROCESS.map((p, i) => (
            <li key={p.title} className="process__col" style={{ ["--i" as string]: i }}>
              <article className="pcard">
                <span className="pcard__num">{String(i + 1).padStart(2, "0")}</span>
                <StepArt step={i} />
                <div className="pcard__text">
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
