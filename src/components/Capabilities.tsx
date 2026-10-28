import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { CAPABILITIES, CAPABILITIES_HEAD } from "../content";
import { Mark } from "../brand/Logo";
import { PHONE, useMedia } from "../lib/media";
import { prefersReducedMotion } from "../lib/motion";
import { Icon } from "./Icon";
import "./capabilities.css";

// "Eight disciplines. One bigger picture." drawn literally: the brand circle split into eight
// segments around the mark. The dial turns to bring the active discipline round to the pointer.
const N = CAPABILITIES.length;
const R_OUT = 56;
const R_IN = 31;
const GAP = 1.8; // degrees between segments
const ADVANCE_MS = 3600;

const rad = (d: number) => (d * Math.PI) / 180;
const pt = (r: number, d: number) => [r * Math.cos(rad(d)), r * Math.sin(rad(d))] as const;

function wedge(i: number) {
  const a0 = -90 + i * (360 / N) - 360 / N / 2 + GAP / 2;
  const a1 = a0 + 360 / N - GAP;
  const [x0, y0] = pt(R_OUT, a0);
  const [x1, y1] = pt(R_OUT, a1);
  const [x2, y2] = pt(R_IN, a1);
  const [x3, y3] = pt(R_IN, a0);
  return `M${x0} ${y0}A${R_OUT} ${R_OUT} 0 0 1 ${x1} ${y1}L${x2} ${y2}A${R_IN} ${R_IN} 0 0 0 ${x3} ${y3}Z`;
}

/** Split "a, b, c and d." into chips. */
const chips = (body: string) =>
  body
    .replace(/\.$/, "")
    .split(/,\s*|\s+and\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

export function Capabilities() {
  const [active, setActive] = useState(0);
  const [rot, setRot] = useState(0); // accumulated, so the dial always turns the short way
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const greeted = useRef(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  // Phones: the dial becomes a wheel half off the bottom edge, pointer at 12 o'clock, and a
  // sideways drag turns it under the thumb (it follows the finger, then snaps to a segment).
  const phone = useMedia(PHONE);
  const [spin, setSpin] = useState(0); // live drag, in degrees
  const swipe = useRef<{ id: number; x: number; px: number } | null>(null);

  const select = useCallback(
    (i: number) => {
      const next = ((i % N) + N) % N;
      let delta = (active - next) * (360 / N);
      delta = ((((delta + 180) % 360) + 360) % 360) - 180;
      setActive(next);
      setRot((r) => r + delta);
    },
    [active],
  );

  useEffect(() => {
    // Watch the dial itself (not the tall section), so it comes alive the moment it's on screen.
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting);
        // First arrival: one full turn, so it reads as a wheel straight away.
        if (e.isIntersecting && !greeted.current && !prefersReducedMotion()) {
          greeted.current = true;
          setRot((r) => r - 360);
        }
      },
      { threshold: 0.45 },
    );
    if (stage.current) io.observe(stage.current);
    return () => io.disconnect();
  }, []);

  // Auto-advance while visible; hovering or focusing the dial pauses it.
  const auto = inView && !paused && !prefersReducedMotion();
  useEffect(() => {
    if (!auto) return;
    const t = window.setTimeout(() => select(active + 1), ADVANCE_MS);
    return () => window.clearTimeout(t);
  }, [auto, active, select]);

  const onKey = (e: KeyboardEvent) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (active + step + N) % N;
    select(next);
    tabs.current[next]?.focus();
  };

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!phone || e.pointerType === "mouse") return;
    const svg = e.currentTarget.querySelector("svg")!;
    // Degrees per pixel at the middle of the segment band, so the wheel tracks the finger.
    const r = (svg.getBoundingClientRect().width * ((R_OUT + R_IN) / 2)) / 128;
    swipe.current = { id: e.pointerId, x: e.clientX, px: 180 / (Math.PI * r) };
    setPaused(true);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const s = swipe.current;
    if (s?.id === e.pointerId) setSpin((e.clientX - s.x) * s.px);
  };
  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    const s = swipe.current;
    if (s?.id !== e.pointerId) return;
    const dx = e.clientX - s.x;
    swipe.current = null;
    setPaused(false);
    setSpin(0);
    if (Math.abs(dx) < 8) return; // a tap: the segment's own click selects it
    // Turning clockwise brings the previous segment up to the pointer; a short flick is one step.
    const deg = dx * s.px;
    const steps = Math.round(deg / (360 / N)) || Math.sign(dx);
    select(active - steps);
  };

  // Base rotation puts segment 0 (drawn at 12 o'clock) at 3 o'clock, facing the panel; on a
  // phone the pointer sits at 12 o'clock instead.
  const turn = (phone ? 0 : 90) + rot + spin;
  const c = CAPABILITIES[active];

  return (
    <section
      id="services"
      ref={root}
      className={`caps on-light ${auto ? "is-auto" : ""} ${spin ? "is-spinning" : ""}`}
      data-nav="light"
    >
      <div className="wrap">
        <header className="section-head">
          <div>
            <p className="eyebrow" data-reveal>
              {CAPABILITIES_HEAD.eyebrow}
            </p>
            <h2 data-reveal style={{ ["--reveal-delay" as string]: "80ms" }}>
              {CAPABILITIES_HEAD.headline}
            </h2>
          </div>
          <p data-reveal style={{ ["--reveal-delay" as string]: "160ms" }}>
            {CAPABILITIES_HEAD.body}
          </p>
        </header>

        <div className="caps__stage" ref={stage}>
          <div
            className="dial"
            data-reveal
            data-thumb-clear
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          >
            <svg viewBox="-64 -64 128 128" aria-hidden="true">
              {/* Pointer + the route out to the panel. */}
              <g transform={phone ? "rotate(-90)" : undefined}>
                <path className="dial__route" d="M60 0H64" />
                <path className="dial__notch" d="M58.6 -3.4L62.6 0L58.6 3.4Z" />
              </g>
              <circle className="dial__track" r={59.5} />
              <circle key={active} className="dial__timer" r={59.5} style={{ ["--ms" as string]: `${ADVANCE_MS}ms` }} pathLength={1} />
              <g className="dial__ring" style={{ transform: `rotate(${turn}deg)` }}>
                {CAPABILITIES.map((cap, i) => {
                  const mid = -90 + i * (360 / N);
                  const [px, py] = pt(3.2, mid);
                  const [ix, iy] = pt((R_OUT + R_IN) / 2, mid);
                  return (
                    <g
                      key={cap.title}
                      className={`dial__seg ${i === active ? "is-active" : ""}`}
                      style={{ transform: i === active ? `translate(${px}px, ${py}px)` : undefined }}
                      onClick={() => select(i)}
                    >
                      <path d={wedge(i)} />
                      <g transform={`translate(${ix} ${iy})`}>
                        <g className="dial__icon" style={{ transform: `rotate(${-turn}deg)` }}>
                          <g transform="translate(-6.5 -6.5) scale(0.27)">
                            <Icon name={cap.icon} size={48} />
                          </g>
                        </g>
                      </g>
                    </g>
                  );
                })}
              </g>
              <circle className="dial__hub" r={R_IN - 4} />
              <g transform="translate(-19 -19)">
                <svg width="38" height="38" viewBox="0 0 100 100" overflow="visible">
                  <Mark size={100} />
                </svg>
              </g>
            </svg>
          </div>

          <div className="caps__panel">
            <div id="caps-panel" role="tabpanel" aria-labelledby={`caps-tab-${active}`} className="caps__detail" key={active}>
              <p className="caps__count">
                <b>{String(active + 1).padStart(2, "0")}</b> / {String(N).padStart(2, "0")}
              </p>
              <h3>{c.title}</h3>
              <p className="caps__body">{c.body}</p>
              <ul className="caps__chips">
                {chips(c.body).map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>

            <div
              className="caps__legend"
              role="tablist"
              aria-label="Disciplines"
              onKeyDown={onKey}
              onPointerEnter={() => setPaused(true)}
              onPointerLeave={() => setPaused(false)}
              onFocus={() => setPaused(true)}
              onBlur={() => setPaused(false)}
            >
              {CAPABILITIES.map((cap, i) => (
                <button
                  key={cap.title}
                  id={`caps-tab-${i}`}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  role="tab"
                  aria-selected={i === active}
                  aria-controls="caps-panel"
                  tabIndex={i === active ? 0 : -1}
                  className={i === active ? "is-active" : ""}
                  onClick={() => select(i)}
                >
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {cap.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
