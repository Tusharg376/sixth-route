import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { BriefForm } from "../components/BriefForm";
import { ArrowUpRight } from "../components/Icon";
import { CONTACT_PAGE, EMAIL, SOCIAL } from "../content";
import { useReveal, useSmoothScroll } from "../lib/motion";
import "./contact.css";

export default function Contact() {
  useSmoothScroll();
  useReveal();
  return (
    <>
      <a className="skip-link" href="#brief">
        Skip to the form
      </a>
      <Nav ready cta={{ label: "Send a brief", href: "#brief" }} />
      <main id="main">
        <section id="top" className="ct-hero on-dark" data-nav="dark">
          <div className="ct-hero__ember" />
          {/* The visitor's route in: a line that draws across the band and drops into the form. */}
          <svg className="ct-hero__route" viewBox="0 0 1440 520" preserveAspectRatio="none" aria-hidden="true">
            <path d="M-20 380 C 220 380, 300 160, 520 170 S 760 420, 980 330 S 1180 120, 1260 260 S 1150 520, 1240 560" pathLength={1} />
          </svg>
          <div className="wrap ct-hero__inner">
            <p className="eyebrow ct-in" style={{ ["--d" as string]: 0 }}>
              {CONTACT_PAGE.eyebrow}
            </p>
            <h1 className="ct-hero__title">
              <span className="ct-in" style={{ ["--d" as string]: 1 }}>
                {CONTACT_PAGE.headline}
              </span>
              <span className="accent ct-in" style={{ ["--d" as string]: 2 }}>
                {CONTACT_PAGE.accent}
              </span>
            </h1>
            <p className="ct-hero__body ct-in" style={{ ["--d" as string]: 3 }}>
              {CONTACT_PAGE.body}
            </p>
          </div>
        </section>

        <section className="ct-main on-light" data-nav="light" aria-label="Send us your brief">
          <div className="wrap ct-grid">
            <aside className="ct-side">
              <div className="ct-block" data-reveal>
                <p className="eyebrow">What happens next</p>
                <ol className="ct-steps">
                  {CONTACT_PAGE.next.map((s, i) => (
                    <li key={s.title}>
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      <div>
                        <h2>{s.title}</h2>
                        <p>{s.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="ct-block" data-reveal style={{ ["--reveal-delay" as string]: "100ms" }}>
                <p className="eyebrow">Prefer email?</p>
                <a className="ct-mail tap" href={`mailto:${EMAIL}`}>
                  {EMAIL}
                </a>
              </div>
              <div className="ct-block" data-reveal style={{ ["--reveal-delay" as string]: "180ms" }}>
                <p className="eyebrow">Elsewhere</p>
                <ul className="ct-social">
                  {SOCIAL.map((l) => (
                    <li key={l.label}>
                      <a href={l.href} target="_blank" rel="noreferrer">
                        {l.label} <ArrowUpRight size={12} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
            <div className="ct-form">
              <BriefForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
