import { useId, useState } from "react";
import { CONTACT_HREF, FAQ_HEAD, FAQS } from "../content";
import { ArrowRight } from "./Icon";
import "./faq.css";

export function Faq() {
  const [open, setOpen] = useState(0);
  const [all, setAll] = useState(false);
  const base = useId();
  return (
    <section id="faq" className="faq on-light" data-nav="light" aria-labelledby="faq-title">
      <div className="wrap faq__grid">
        <div className="faq__side">
          <p className="eyebrow">{FAQ_HEAD.eyebrow}</p>
          <h2 id="faq-title" className="faq__title">
            {FAQ_HEAD.headline} <span className="accent">{FAQ_HEAD.body}</span>
          </h2>
          <a href={CONTACT_HREF} className="btn btn--orange">
            <span className="btn__label">Ask us directly</span>
            <span className="btn__dot">
              <ArrowRight />
            </span>
          </a>
        </div>
        <ul id={`${base}-list`} className={`faq__list ${all ? "is-all" : ""}`}>
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            const id = `${base}-${i}`;
            return (
              <li key={f.q} className={`faq__item ${isOpen ? "is-open" : ""}`}>
                <h3>
                  <button aria-expanded={isOpen} aria-controls={id} onClick={() => setOpen(isOpen ? -1 : i)}>
                    <span className="faq__n">{String(i + 1).padStart(2, "0")}</span>
                    <span className="faq__q">{f.q}</span>
                    <span className="faq__icon" aria-hidden="true" />
                  </button>
                </h3>
                <div id={id} className="faq__a" role="region" aria-hidden={!isOpen}>
                  <div>
                    <p>{f.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {/* Phones show the first four questions (faq.css); the rest stay in the page, one tap away. */}
        {!all && (
          <button className="faq__more" aria-expanded={false} aria-controls={`${base}-list`} onClick={() => setAll(true)}>
            Show all {FAQS.length} questions
          </button>
        )}
      </div>
    </section>
  );
}
