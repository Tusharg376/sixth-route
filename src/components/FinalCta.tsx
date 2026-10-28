import { lazy } from "react";
import { CONTACT_HREF, CTA, EMAIL } from "../content";
import { TOUCH, useMedia } from "../lib/media";
import { BrandTint } from "./BrandTint";
import { ArrowRight, ArrowUpRight } from "./Icon";
import "./cta.css";

// ThreeUI effect, loaded only when the section approaches the viewport.
const RibbonFieldBackground = lazy(() =>
  import("@designcodeio/threeui/components/RibbonFieldBackground").then((m) => ({ default: m.RibbonFieldBackground })),
);

export function FinalCta() {
  // No pointer to follow on touch screens; keep the field drifting on its own.
  const touch = useMedia(TOUCH);
  return (
    <section id="contact" className="cta on-dark" data-nav="dark" aria-labelledby="cta-title">
      <BrandTint strength={0.95}>
        <RibbonFieldBackground speed={0.7} pointerAmount={touch ? 0 : 0.6} brightness={1.25} />
      </BrandTint>
      <div className="cta__veil" />
      <div className="wrap cta__inner">
        <p className="eyebrow" data-reveal>
          {CTA.eyebrow}
        </p>
        <h2 id="cta-title" className="cta__title" data-reveal style={{ ["--reveal-delay" as string]: "80ms" }}>
          {CTA.headline[0]}
          <br />
          <span className="accent">{CTA.headline[1]}</span>
        </h2>
        <div className="cta__row" data-reveal style={{ ["--reveal-delay" as string]: "160ms" }}>
          <div className="cta__actions">
            <a href={CONTACT_HREF} className="btn">
              <span className="btn__label">{CTA.primary}</span>
              <span className="btn__dot">
                <ArrowRight />
              </span>
            </a>
            <a href={CONTACT_HREF} className="btn btn--ghost">
              {CTA.secondary} <ArrowUpRight />
            </a>
          </div>
          <div className="cta__mail">
            <p>Or write to us</p>
            <a href={`mailto:${EMAIL}`} className="tap">
              {EMAIL}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
