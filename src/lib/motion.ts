import { useEffect, useLayoutEffect, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);
// Phones show and hide the address bar while scrolling; don't re-measure every pin for that.
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger };

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let lenis: Lenis | null = null;
export const getLenis = () => lenis;

/**
 * Scroll animations are an extra, never a gate on content. Until someone actually scrolls, every
 * section is in its finished state: a crawler, a full-page screenshot, a reader that never
 * scrolls or a printout sees all of it. The first scroll "arms" the page: from then on content
 * below the fold waits to be scrolled into view, plays its animation once and stays. A link with
 * a #hash arms it from the start, so the jump lands on the final layout.
 */
let armed = typeof window !== "undefined" && window.location.hash.length > 1;
const armedListeners = new Set<() => void>();
export const isArmed = () => armed;
function arm() {
  if (armed) return;
  armed = true;
  window.removeEventListener("scroll", arm);
  document.documentElement.classList.add("is-armed");
  armedListeners.forEach((l) => l());
}
if (typeof window !== "undefined") {
  if (armed) document.documentElement.classList.add("is-armed");
  else window.addEventListener("scroll", arm, { passive: true });
}
/** Runs `fn` now if the page is armed, else on the first scroll. Returns a cleanup. */
export function whenArmed(fn: () => void) {
  if (armed) {
    fn();
    return () => {};
  }
  const once = () => {
    armedListeners.delete(once);
    fn();
  };
  armedListeners.add(once);
  return () => armedListeners.delete(once);
}
/** Re-renders when the page arms (see above). */
export function useArmed() {
  return useSyncExternalStore(
    (onChange) => {
      armedListeners.add(onChange);
      return () => armedListeners.delete(onChange);
    },
    isArmed,
    () => false,
  );
}

/**
 * A scroll-scrubbed animation that only ever plays forward. It follows the scroll like `scrub`
 * does, but scrolling back up leaves it where it got to, so content that has appeared never goes
 * away again. Landing past it (an anchor link, a restored scroll position) jumps straight to its
 * finished state.
 */
export function scrubOnce(animation: gsap.core.Animation, vars: ScrollTrigger.Vars, smooth = 0.6) {
  animation.pause();
  let reached = 0;
  const advance = (self: ScrollTrigger) => {
    if (self.progress <= reached) return;
    reached = self.progress;
    gsap.to(animation, { progress: reached, duration: smooth, ease: "power2.out", overwrite: true });
  };
  const st = ScrollTrigger.create({ ...vars, onUpdate: advance, onRefresh: advance });
  if (st.progress > 0) {
    reached = st.progress;
    animation.progress(reached);
  }
  return st;
}

/** Smooth scrolling (Lenis) wired into GSAP's ticker so ScrollTrigger stays in sync. */
export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // In-page anchors scroll through Lenis.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href")!;
      const target = id === "#top" ? 0 : document.querySelector<HTMLElement>(id);
      if (target === null) return;
      e.preventDefault();
      // Land below the fixed nav; forms get focus once the scroll settles.
      lenis?.scrollTo(target, {
        offset: target === 0 ? 0 : -96,
        duration: 1.2,
        onComplete: () => {
          if (target instanceof HTMLFormElement) target.querySelector<HTMLElement>("input, textarea")?.focus({ preventScroll: true });
        },
      });
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
    };
  }, []);
}

/**
 * Fades [data-reveal] elements in once, as they scroll into view; they never fade out again.
 * Elements on the first screen are hidden before the first paint so they fade in on load; the
 * rest stay visible until the page is armed (see above), then wait below the fold.
 */
export function useReveal() {
  useLayoutEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const show = (el: Element) => el.classList.add("is-in");
    if (prefersReducedMotion()) {
      els.forEach(show);
      return;
    }
    const waiting = new Set<HTMLElement>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          show(e.target);
          waiting.delete(e.target as HTMLElement);
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    const watch = (el: HTMLElement) => {
      el.classList.add("is-armed");
      waiting.add(el);
      io.observe(el);
    };
    const below = els.filter((el) => {
      if (el.getBoundingClientRect().top >= window.innerHeight) return true;
      watch(el);
      return false;
    });
    const stopWaiting = whenArmed(() => {
      // Only what is still off screen is hidden; whatever is already in view stays as it is.
      below.forEach((el) => el.getBoundingClientRect().top >= window.innerHeight && watch(el));
    });
    // A fast jump can carry an element past the screen without it ever intersecting.
    let frame = 0;
    const sweep = () => {
      frame = 0;
      for (const el of waiting) {
        if (el.getBoundingClientRect().bottom >= 0) continue;
        show(el);
        waiting.delete(el);
        io.unobserve(el);
      }
    };
    const onScroll = () => {
      if (!frame && waiting.size) frame = requestAnimationFrame(sweep);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      stopWaiting();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      io.disconnect();
      els.forEach((el) => el.classList.remove("is-armed", "is-in"));
    };
  }, []);
}
