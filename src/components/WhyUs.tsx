import { lazy } from "react";
import { WHY } from "../content";
import { PHONE, useMedia } from "../lib/media";
import { BrandTint } from "./BrandTint";
import { Icon } from "./Icon";
import { StarMap } from "./StarMap";
import "./why.css";

// ThreeUI effect, loaded only when the section approaches the viewport.
const ConstellationField = lazy(() =>
  import("@designcodeio/threeui/components/ConstellationField").then((m) => ({ default: m.ConstellationField })),
);

export function WhyUs() {
  const phone = useMedia(PHONE);
  return (
    <section className="why on-dark" data-nav="dark" aria-labelledby="why-title">
      {phone ? (
        <StarMap />
      ) : (
        <BrandTint strength={0.9}>
          <ConstellationField mode="dark" speed={0.6} />
        </BrandTint>
      )}
      <div className="why__veil" />
      <div className="wrap why__inner">
        <p className="eyebrow" data-reveal>
          {WHY.eyebrow}
        </p>
        <h2 id="why-title" className="why__title" data-reveal style={{ ["--reveal-delay" as string]: "80ms" }}>
          {WHY.headline[0]}
          <br />
          <span className="accent">{WHY.headline[1]}</span>
        </h2>
        <p className="why__body" data-reveal style={{ ["--reveal-delay" as string]: "160ms" }}>
          {WHY.body}
        </p>
        <ul className="why__points">
          {WHY.points.map((pt, i) => (
            <li key={pt.title} data-reveal style={{ ["--reveal-delay" as string]: `${200 + i * 90}ms` }}>
              <Icon name={(["arrow", "circles", "plus"] as const)[i]} size={36} />
              <h3>{pt.title}</h3>
              <p>{pt.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
