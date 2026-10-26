import { StrictMode, type ComponentType } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import "./brand/brand.css";
import { DevTools } from "./DevTools";

/** Shared bootstrap: each HTML page has its own entry that imports its page directly,
 *  so the page ships in the first request instead of a second lazy chunk. */
export function mount(Page: ComponentType) {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <Page />
      <DevTools />
    </StrictMode>,
  );
}
