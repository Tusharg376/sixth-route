import { useSyncExternalStore } from "react";

/**
 * Layout tiers (design.md → Mobile). CSS can't read custom properties inside @media, so the
 * stylesheets repeat these exact values: phone ≤ 600px, compact (tablet and phone) ≤ 1024px.
 */
export const PHONE = "(max-width: 600px)";
export const COMPACT = "(max-width: 1024px)";
export const DESKTOP = "(min-width: 1025px)";
/** Touch-first input, whatever the width: no hover, coarse pointer. */
export const TOUCH = "(hover: none)";
/** A phone on its side: too short for pinned scenes (CSS repeats this query). */
export const LANDSCAPE_PHONE = "(orientation: landscape) and (max-height: 500px) and (hover: none)";

export const matches = (query: string) => typeof window !== "undefined" && window.matchMedia(query).matches;

/** Live media-query match; re-renders when it flips (resize, rotation). */
export function useMedia(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

type NetworkInfo = { saveData?: boolean };

/**
 * Devices that should get still images instead of WebGL: data saver on, a browser that reports
 * 4 GB of memory or less, or no WebGL at all. `?poster` forces it for testing.
 */
export function prefersLowPower() {
  if (typeof window === "undefined") return false;
  if (new URLSearchParams(location.search).has("poster")) return true;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: NetworkInfo };
  if (nav.connection?.saveData) return true;
  if (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) return true;
  try {
    const gl = document.createElement("canvas").getContext("webgl2") ?? document.createElement("canvas").getContext("webgl");
    if (!gl) return true;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    return true;
  }
  return false;
}
