import { CONTACT_HREF, HERO } from "../content";
import { ArrowRight, ArrowUpRight } from "./Icon";
import "./hero.css";

export function Hero(_props: { ready: boolean }) {
  return (
    <section id="top" className="hero on-dark" data-nav="dark">
      <div className="hero__inner wrap">
        <p className="hero__eyebrow">{HERO.eyebrow}</p>
        <h1 className="hero__title">
          <span>{HERO.headline[0]}</span>{" "}
          <span>{HERO.headline[1]}</span>{" "}
          <span className="accent">{HERO.accent}</span>
        </h1>

        <div className="hero__foot">
          <p className="hero__body">{HERO.body}</p>
          <div className="hero__ctas">
            <a href={CONTACT_HREF} className="btn">
              <span className="btn__label">{HERO.primary}</span>
              <span className="btn__dot">
                <ArrowRight />
              </span>
            </a>
            <a href="#work" className="btn btn--ghost">
              {HERO.secondary} <ArrowUpRight />
            </a>
          </div>
          <a href="#about" className="hero__scroll" aria-label="Scroll to About">
            <span />
            Scroll
          </a>
        </div>
      </div>
    </section>
  );
}
