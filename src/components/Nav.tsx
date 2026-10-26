import { useEffect, useState } from "react";
import { Lockup } from "../brand/Logo";
import { CONTACT_HREF, NAV_LINKS } from "../content";
import { to } from "../lib/links";
import { ArrowRight } from "./Icon";
import "./nav.css";

type Cta = { label: string; href: string };

export function Nav({ ready, cta = { label: "Start a Project", href: CONTACT_HREF } }: { ready: boolean; cta?: Cta }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Match the nav's colours to whatever section sits under it.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      setScrolled(window.scrollY > 40);
      const probe = 44;
      const sections = document.querySelectorAll<HTMLElement>("[data-nav]");
      for (const s of sections) {
        const r = s.getBoundingClientRect();
        if (r.top <= probe && r.bottom > probe) {
          setTheme(s.dataset.nav === "light" ? "light" : "dark");
          break;
        }
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const tone = open ? "dark" : theme;

  return (
    <header className={`nav nav--${tone} ${scrolled ? "is-scrolled" : ""} ${ready ? "is-ready" : ""} ${open ? "is-open" : ""}`}>
      <div className="nav__bar wrap">
        <a href={to("#top")} className="nav__brand" aria-label="Sixth Route home" data-nav-lockup>
          <Lockup tone={tone === "light" ? "light" : "dark"} />
        </a>

        <nav className="nav__links" aria-label="Main">
          {NAV_LINKS.slice(1).map((l) => (
            <a key={l.label} href={to(l.href)}>
              {l.label}
            </a>
          ))}
        </nav>

        <a href={cta.href} className="btn btn--orange nav__cta">
          <span className="btn__label">{cta.label}</span>
          <span className="btn__dot">
            <ArrowRight />
          </span>
        </a>

        <button
          className="nav__burger"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>

      <div id="mobile-menu" className="nav__sheet" hidden={!open}>
        <nav aria-label="Mobile">
          {NAV_LINKS.map((l, i) => (
            <a key={l.label} href={to(l.href)} onClick={() => setOpen(false)} style={{ ["--i" as string]: i }}>
              {l.label}
            </a>
          ))}
        </nav>
        <a href={cta.href} className="btn btn--orange" onClick={() => setOpen(false)}>
          <span className="btn__label">{cta.label}</span>
          <span className="btn__dot">
            <ArrowRight />
          </span>
        </a>
      </div>
    </header>
  );
}
