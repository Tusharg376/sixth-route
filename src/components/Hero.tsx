import { lazy, Suspense, useRef } from "react";
import { CONTACT_HREF, HERO } from "../content";
import { ArrowRight, ArrowUpRight } from "./Icon";
import "./hero.css";

const HeroScene = lazy(() => import("../three/HeroScene"));

const Line = ({ children, i }: { children: React.ReactNode; i: number }) => (
  <span className="hero__line" style={{ ["--i" as string]: i }}>
    <span>{children}</span>
  </span>
);

export function Hero({ ready }: { ready: boolean }) {
  const slot = useRef<HTMLDivElement>(null);
  return (
    <section id="top" className={`hero on-dark ${ready ? "is-ready" : ""}`} data-nav="dark">
      <div className="hero__ember hero__ember--a" />
      <div className="hero__ember hero__ember--b" />
      <Suspense fallback={null}>
        <HeroScene slot={slot} started={ready} />
      </Suspense>

      <div className="hero__inner wrap">
        <p className="hero__eyebrow">
          <Line i={0}>{HERO.eyebrow}</Line>
        </p>
        <h1 className="hero__title">
          <span className="hero__top">
            <Line i={1}>{HERO.headline[0]}</Line>
            <Line i={2}>{HERO.headline[1]}</Line>
          </span>
          <span className="hero__slot" ref={slot} aria-hidden="true">
            <span className="hero__halo" />
          </span>
          <span className="hero__bottom accent">
            <Line i={4}>{HERO.accent}</Line>
          </span>
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
