import { lazy, Suspense } from "react";

// Agentation (https://agentation.com): click any element to annotate it for an AI coding agent.
// Development only — the import is dropped from production builds.
// Set VITE_AGENTATION_ENDPOINT (e.g. http://localhost:4747) to sync annotations to agentation-mcp.
const Agentation = import.meta.env.DEV
  ? lazy(() => import("agentation").then((m) => ({ default: m.Agentation })))
  : null;

export function DevTools() {
  if (!Agentation) return null;
  const endpoint = import.meta.env.VITE_AGENTATION_ENDPOINT;
  return (
    <Suspense fallback={null}>
      <Agentation {...(endpoint ? { endpoint } : {})} />
    </Suspense>
  );
}
