import { useEffect, useRef, useState } from "react";
import { CONTACT_HREF, PROJECTS, PROJECTS_HEAD } from "../content";
import { gsap, getLenis, prefersReducedMotion } from "../lib/motion";
import { ProjectArt } from "./ProjectArt";
import { ArrowRight, ArrowUpRight } from "./Icon";
import "./projects.css";

export function Projects() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<number | null>(null);

  // Vertical scroll drives the row of cards sideways (desktop only).
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 861px)", () => {
      const t = track.current!;
      const distance = () => t.scrollWidth - t.parentElement!.clientWidth;
      gsap.to(t, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section.current!.querySelector(".work__pin"),
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.7,
          invalidateOnRefresh: true,
          onUpdate: (st) => {
            if (bar.current) bar.current.style.transform = `scaleX(${st.progress})`;
          },
        },
      });
    });
    return () => mm.revert();
  }, []);

  const open = (i: number) => {
    setActive(i);
    dialog.current?.showModal();
    getLenis()?.stop();
  };
  const close = () => {
    dialog.current?.close();
  };
  const p = active !== null ? PROJECTS[active] : null;

  return (
    <section id="work" className="work on-light" data-nav="light" ref={section}>
      <div className="work__pin">
        <header className="wrap section-head work__head">
          <div>
            <p className="eyebrow" data-reveal>
              {PROJECTS_HEAD.eyebrow}
            </p>
            <h2 data-reveal style={{ ["--reveal-delay" as string]: "80ms" }}>
              {PROJECTS_HEAD.headline}
            </h2>
          </div>
          <div className="work__aside" data-reveal style={{ ["--reveal-delay" as string]: "160ms" }}>
            <p>{PROJECTS_HEAD.body}</p>
            <a className="text-link" href={CONTACT_HREF}>
              Start a project <ArrowUpRight />
            </a>
          </div>
        </header>

        <div className="work__viewport">
          <ul className="work__track" ref={track}>
            {PROJECTS.map((proj, i) => (
              <li key={proj.title} className="card">
                <button className="card__hit" onClick={() => open(i)} aria-label={`Open ${proj.title} details`} />
                <div className="card__art">
                  <ProjectArt kind={proj.kind} />
                </div>
                <span className={`card__label ${proj.label === "Studio project" ? "is-studio" : ""}`}>{proj.label}</span>
                <span className="card__plus" aria-hidden="true" />
                <div className="card__meta">
                  <h3>{proj.title}</h3>
                  <p>{proj.disciplines.join(" · ")}</p>
                </div>
              </li>
            ))}
            <li className="card card--end">
              <a href={CONTACT_HREF} className="card__end">
                <span>Your project could be next.</span>
                <span className="btn btn--orange">
                  <span className="btn__label">Start a Project</span>
                  <span className="btn__dot">
                    <ArrowRight />
                  </span>
                </span>
              </a>
            </li>
          </ul>
        </div>

        <div className="wrap work__progress" aria-hidden="true">
          <span className="work__bar">
            <span ref={bar} />
          </span>
          <span className="work__hint">Scroll to explore · Tap + for the story</span>
        </div>
      </div>

      <dialog
        ref={dialog}
        className="case"
        onClose={() => {
          getLenis()?.start();
          setActive(null);
        }}
        onClick={(e) => e.target === dialog.current && close()}
        aria-labelledby="case-title"
      >
        {p && (
          <div className="case__inner">
            <div className="case__art">
              <ProjectArt kind={p.kind} />
            </div>
            <div className="case__body">
              <button className="case__close" onClick={close} aria-label="Close">
                <span aria-hidden="true">×</span>
              </button>
              <span className={`card__label ${p.label === "Studio project" ? "is-studio" : ""}`}>{p.label}</span>
              <h3 id="case-title">{p.title}</h3>
              <ul className="case__tags">
                {p.disciplines.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
              <dl>
                <dt>The challenge</dt>
                <dd>{p.challenge}</dd>
                <dt>Our approach</dt>
                <dd>{p.approach}</dd>
                <dt>Design decisions</dt>
                <dd>{p.decisions}</dd>
              </dl>
              <a href={CONTACT_HREF} className="btn btn--orange" onClick={close}>
                <span className="btn__label">Start a similar project</span>
                <span className="btn__dot">
                  <ArrowRight />
                </span>
              </a>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
