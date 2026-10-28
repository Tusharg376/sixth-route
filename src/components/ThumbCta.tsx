import { useEffect, useState } from "react";
import { START_PROJECT } from "../content";
import { PHONE, useMedia } from "../lib/media";
import { ArrowRight } from "./Icon";
import "./thumbcta.css";

/**
 * Phones hide the nav's "Start a Project" button, so this one sits within thumb reach instead.
 * One such button on screen at a time: it steps aside whenever another contact CTA is visible
 * (the hero's, the FAQ's, the last project card, the closing section) and over the footer.
 */
export function ThumbCta() {
  const phone = useMedia(PHONE);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!phone) return;
    const others = document.querySelectorAll(`a.btn[href="${START_PROJECT.href}"]:not(.thumb__btn), a.card__end, #contact, footer`);
    const inView = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? inView.add(e.target) : inView.delete(e.target)));
      setShown(inView.size === 0);
    });
    others.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [phone]);

  if (!phone) return null;
  return (
    <div className={`thumb ${shown ? "is-shown" : ""}`} inert={!shown}>
      <a href={START_PROJECT.href} className="btn btn--orange thumb__btn">
        <span className="btn__label">{START_PROJECT.label}</span>
        <span className="btn__dot">
          <ArrowRight />
        </span>
      </a>
    </div>
  );
}
