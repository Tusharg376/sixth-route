import { CAPABILITIES } from "../content";
import "./ticker.css";

export function Ticker() {
  const items = CAPABILITIES.map((c) => c.title);
  const run = (hidden: boolean) => (
    <ul className="ticker__run" aria-hidden={hidden || undefined}>
      {items.map((t) => (
        <li key={t}>
          <span className="ticker__slash">/</span>
          {t}
        </li>
      ))}
    </ul>
  );
  return (
    <div className="ticker" data-nav="light" aria-label="Our disciplines">
      <div className="ticker__track">
        {run(false)}
        {run(true)}
      </div>
    </div>
  );
}
