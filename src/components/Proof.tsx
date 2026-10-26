import { PROOF } from "../content";
import { Icon, ArrowUpRight } from "./Icon";
import "./proof.css";

// Proof-based block in place of testimonials until real client feedback exists (per the brief).
export function Proof() {
  return (
    <section className="proof on-light" data-nav="light" aria-labelledby="proof-title">
      <div className="wrap proof__grid">
        <div>
          <p className="eyebrow" data-reveal>
            {PROOF.eyebrow}
          </p>
          <h2 id="proof-title" className="proof__title" data-reveal style={{ ["--reveal-delay" as string]: "80ms" }}>
            {PROOF.headline}
          </h2>
          <p className="proof__body" data-reveal style={{ ["--reveal-delay" as string]: "160ms" }}>
            {PROOF.body}
          </p>
        </div>
        <ul className="proof__list">
          {PROOF.items.map((it, i) => (
            <li key={it.title} data-reveal style={{ ["--reveal-delay" as string]: `${i * 90}ms` }}>
              <a href={it.href}>
                <Icon name={it.icon} size={40} />
                <span className="proof__text">
                  <strong>{it.title}</strong>
                  <span>{it.body}</span>
                </span>
                <span className="proof__go">
                  <ArrowUpRight size={16} />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
