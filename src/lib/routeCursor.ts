import { matches } from "./media";

/** A mouse that can hover. Touch screens have no cursor to replace (design.md → Mobile and touch). */
const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** How long a point of the trail lives. Short on purpose: a comet's tail, not a ribbon. */
const TRAIL_MS = 180;
const TRAIL_MAX_WIDTH = 4.5;
/** Caps the tail's length in px, so a fast flick of the mouse doesn't draw a long streak. */
const TRAIL_MAX_LENGTH = 90;
/** Points closer than this to the last one add nothing but cost. */
const TRAIL_MIN_STEP = 1.5;

/** Things you can click: the head swells into a ring over them. */
const ACTIVE = [
  "a",
  "button",
  "summary",
  "label",
  '[role="button"]',
  '[role="tab"]',
  'input[type="checkbox"]',
  'input[type="radio"]',
  'input[type="submit"]',
  ".dial__seg",
  ".loader",
].join(",");

/** Text entry keeps the system cursor, so the I-beam and the caret are never hidden. */
const NATIVE = [
  "textarea",
  "select",
  '[contenteditable=""]',
  '[contenteditable="true"]',
  'input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="range"])',
].join(",");

type Point = { x: number; y: number; t: number };

/**
 * The route-trail cursor: an orange head that draws a short orange route line behind it as the
 * mouse moves (design.md → Cursor). Mounted once per page; does nothing on touch screens or when
 * the visitor asks for reduced motion. Styles: src/styles/cursor.css.
 */
export function initRouteCursor() {
  if (!matches(FINE_POINTER) || matches(REDUCED_MOTION)) return;

  const root = document.documentElement;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const rgb = getComputedStyle(root).getPropertyValue("--sr-orange-rgb").trim() || "255, 130, 33";
  const head = document.createElement("div");
  canvas.className = "route-cursor__trail";
  head.className = "route-cursor__head";
  canvas.setAttribute("aria-hidden", "true");
  head.setAttribute("aria-hidden", "true");
  document.body.append(canvas, head);

  let width = 0;
  let height = 0;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  let points: Point[] = [];
  let frame = 0;
  let x = 0;
  let y = 0;
  let seen = false;
  let native = false;

  // Each segment is a smoothed curve between midpoints, thinner and fainter the older it is.
  const draw = (now: number) => {
    frame = 0;
    while (points.length && now - points[0].t > TRAIL_MS) points.shift();
    ctx.clearRect(0, 0, width, height);
    if (!points.length) return;
    ctx.lineCap = "round";
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const cur = points[i];
      const next = points[i + 1];
      const life = Math.max(0, 1 - (now - cur.t) / TRAIL_MS);
      ctx.strokeStyle = `rgba(${rgb}, ${life.toFixed(2)})`;
      ctx.lineWidth = 1 + (TRAIL_MAX_WIDTH - 1) * life;
      ctx.beginPath();
      ctx.moveTo((prev.x + cur.x) / 2, (prev.y + cur.y) / 2);
      if (next) ctx.quadraticCurveTo(cur.x, cur.y, (cur.x + next.x) / 2, (cur.y + next.y) / 2);
      else ctx.lineTo(cur.x, cur.y);
      ctx.stroke();
    }
    frame = requestAnimationFrame(draw);
  };

  // What the pointer is over decides the head's state: swell on clickable things, step aside
  // for text entry.
  const classify = (el: Element | null) => {
    const overText = !!el?.closest(NATIVE);
    if (overText !== native) {
      native = overText;
      root.classList.toggle("route-cursor--native", native);
      head.classList.toggle("is-hidden", native);
      if (native) points = [];
    }
    head.classList.toggle("is-active", !native && !!el?.closest(ACTIVE));
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    x = e.clientX;
    y = e.clientY;
    if (!seen) {
      seen = true;
      root.classList.add("route-cursor");
    }
    head.classList.remove("is-away");
    head.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    classify(e.target instanceof Element ? e.target : null);
    if (native) return;
    const last = points[points.length - 1];
    if (!last || Math.hypot(x - last.x, y - last.y) >= TRAIL_MIN_STEP) points.push({ x, y, t: performance.now() });
    let length = 0;
    for (let i = points.length - 1; i > 0; i--) {
      length += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
      if (length > TRAIL_MAX_LENGTH) {
        points = points.slice(i);
        break;
      }
    }
    if (!frame) frame = requestAnimationFrame(draw);
  };

  // Smooth scrolling moves content under a still pointer; re-check what it is over.
  let syncing = 0;
  const onScroll = () => {
    if (!seen || syncing) return;
    syncing = requestAnimationFrame(() => {
      syncing = 0;
      classify(document.elementFromPoint(x, y));
    });
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pointerdown", () => head.classList.add("is-down"));
  window.addEventListener("pointerup", () => head.classList.remove("is-down"));
  window.addEventListener("pointercancel", () => head.classList.remove("is-down"));
  root.addEventListener("mouseleave", () => {
    head.classList.add("is-away");
    points = [];
  });
}
