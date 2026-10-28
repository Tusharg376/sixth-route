import { useEffect, useRef, useState, type PointerEvent } from "react";
import { CONTACT_HREF, PROJECTS, PROJECTS_HEAD } from "../content";
import { gsap, getLenis, prefersReducedMotion } from "../lib/motion";
import { DESKTOP, PHONE, useMedia } from "../lib/media";
import { ProjectArt } from "./ProjectArt";
import { ArrowRight, ArrowUpRight } from "./Icon";
import "./projects.css";

const studio = (label: string) => (label === "Studio project" ? "is-studio" : "");

export function Projects() {
  const [active, setActive] = useState<number | null>(null);
  const phone = useMedia(PHONE);

  return (
    <section id="work" className={`work on-light ${phone ? "work--index" : ""}`} data-nav="light">
      {phone ? <ProjectIndex onOpen={setActive} /> : <ProjectRow onOpen={setActive} />}
      <CaseDialog active={active} sheet={phone} onClosed={() => setActive(null)} />
    </section>
  );
}

function ProjectsHead() {
  return (
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
  );
}

/** Desktop and tablet: the row of tall cards. */
function ProjectRow({ onOpen }: { onOpen: (i: number) => void }) {
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  // Vertical scroll drives the row of cards sideways (desktop only).
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const mm = gsap.matchMedia();
    mm.add(DESKTOP, () => {
      const t = track.current!;
      const distance = () => t.scrollWidth - t.parentElement!.clientWidth;
      gsap.to(t, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: pin.current!,
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

  return (
    <div className="work__pin" ref={pin}>
      <ProjectsHead />

      <div className="work__viewport">
        <ul className="work__track" ref={track}>
          {PROJECTS.map((proj, i) => (
            <li key={proj.title} className="card">
              <button className="card__hit" onClick={() => onOpen(i)} aria-label={`Open ${proj.title} details`} />
              <div className="card__art">
                <ProjectArt kind={proj.kind} />
              </div>
              <span className={`card__label ${studio(proj.label)}`}>{proj.label}</span>
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
      </div>
    </div>
  );
}

/**
 * Phones: an index instead of a sideways row. A preview window sticks at the top while the
 * project titles scroll up beneath it; whichever title crosses the line just under the window
 * takes over the preview. Every project is visible as a title; tap one for its case study.
 */
function ProjectIndex({ onOpen }: { onOpen: (i: number) => void }) {
  const list = useRef<HTMLOListElement>(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setShown(Number((e.target as HTMLElement).dataset.row))),
      { rootMargin: "-62% 0px -37% 0px" },
    );
    list.current!.querySelectorAll("[data-row]").forEach((r) => io.observe(r));
    return () => io.disconnect();
  }, []);

  const p = PROJECTS[shown];
  return (
    <div className="wx">
      <ProjectsHead />
      <div className="wx__stage wrap">
        <div className="wx__preview">
          <div className="wx__frame">
            {PROJECTS.map((proj, i) => (
              <div key={proj.title} className={`wx__slide ${i === shown ? "is-shown" : ""}`} aria-hidden="true">
                <ProjectArt kind={proj.kind} />
              </div>
            ))}
            <span className={`card__label ${studio(p.label)}`}>{p.label}</span>
            <span className="card__plus" aria-hidden="true" />
            <button className="card__hit" onClick={() => onOpen(shown)} aria-label={`Open ${p.title} details`} />
          </div>
        </div>

        <ol className="wx__list" ref={list}>
          {PROJECTS.map((proj, i) => (
            <li key={proj.title} data-row={i}>
              <button className={`wx__row ${i === shown ? "is-active" : ""}`} onClick={() => onOpen(i)}>
                <span className="wx__num">{String(i + 1).padStart(2, "0")}</span>
                <span className="wx__text">
                  <span className="wx__title">{proj.title}</span>
                  <span className="wx__tags">{proj.disciplines.join(" · ")}</span>
                </span>
                <span className="wx__go" aria-hidden="true" />
              </button>
            </li>
          ))}
          <li>
            <a href={CONTACT_HREF} className="wx__end">
              <span>Your project could be next.</span>
              <span className="wx__end-dot" aria-hidden="true">
                <ArrowRight />
              </span>
            </a>
          </li>
        </ol>
      </div>
    </div>
  );
}

/**
 * The case study. Desktop: a centred dialog. Phones: a bottom sheet that slides up and can be
 * dragged down by its top (handle and artwork) to close.
 */
function CaseDialog({ active, sheet, onClosed }: { active: number | null; sheet: boolean; onClosed: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const drag = useRef<{ id: number; y: number; dy: number; t: number } | null>(null);
  const close = () => dialog.current?.close();
  const p = active !== null ? PROJECTS[active] : null;

  // Choosing a project opens the dialog (and holds the page still behind it).
  useEffect(() => {
    const d = dialog.current;
    if (active === null || !d || d.open) return;
    d.showModal();
    getLenis()?.stop();
  }, [active]);

  const onDown = (e: PointerEvent<HTMLElement>) => {
    drag.current = { id: e.pointerId, y: e.clientY, dy: 0, t: e.timeStamp };
    e.currentTarget.setPointerCapture(e.pointerId);
    dialog.current!.style.transition = "none";
  };
  const onMove = (e: PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (d?.id !== e.pointerId) return;
    d.dy = Math.max(0, e.clientY - d.y);
    dialog.current!.style.transform = `translateY(${d.dy}px)`;
  };
  const onUp = (e: PointerEvent<HTMLElement>) => {
    const d = drag.current;
    const el = dialog.current!;
    if (d?.id !== e.pointerId) return;
    drag.current = null;
    // Far enough, or a quick downward flick: let it go; otherwise spring back.
    const fling = d.dy / Math.max(e.timeStamp - d.t, 1) > 0.6;
    el.style.transition = "transform 0.35s var(--ease-out)";
    if (d.dy > 120 || (fling && d.dy > 30)) {
      el.style.transform = "translateY(100%)";
      window.setTimeout(close, 300);
    } else {
      el.style.transform = "";
    }
  };
  const grab = sheet ? { onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp, onPointerCancel: onUp } : {};

  return (
    <dialog
      ref={dialog}
      className={`case ${sheet ? "case--sheet" : ""}`}
      onClose={() => {
        getLenis()?.start();
        dialog.current?.style.removeProperty("transform");
        dialog.current?.style.removeProperty("transition");
        onClosed();
      }}
      onClick={(e) => e.target === dialog.current && close()}
      aria-labelledby="case-title"
    >
      {p && (
        <div className="case__inner">
          <div className="case__art" {...grab}>
            {sheet && <span className="case__grab" aria-hidden="true" />}
            <ProjectArt kind={p.kind} />
          </div>
          <div className="case__body">
            <button className="case__close" onClick={close} aria-label="Close">
              <span aria-hidden="true">×</span>
            </button>
            <span className={`card__label ${studio(p.label)}`}>{p.label}</span>
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
  );
}
