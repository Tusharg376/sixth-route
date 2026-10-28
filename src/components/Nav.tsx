import { useEffect, useState } from "react";
import { Lockup } from "../brand/Logo";
import { EMAIL, NAV_LINKS, SOCIAL, START_PROJECT } from "../content";
import { to } from "../lib/links";
import { COMPACT, useMedia } from "../lib/media";
import { getLenis } from "../lib/motion";
import { ArrowRight, ArrowUpRight } from "./Icon";
import "./nav.css";

type Cta = { label: string; href: string };

export function Nav({ ready, cta = START_PROJECT }: { ready: boolean; cta?: Cta }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  // The menu only exists on compact screens; widening the window closes it.
  const open = useMedia(COMPACT) && menu;

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

  // Lock the page behind the open menu (Lenis too), and let Escape close it.
  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    getLenis()?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      getLenis()?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Links close the menu and unlock scrolling straight away (not later in the effect cleanup), so
  // the anchor scroll they trigger isn't cancelled by Lenis restarting.
  const closeMenu = () => {
    document.documentElement.style.overflow = "";
    getLenis()?.start();
    setMenu(false);
  };

  const tone = open ? "dark" : theme;

  return (
    <header className={`nav nav--${tone} ${scrolled ? "is-scrolled" : ""} ${ready ? "is-ready" : ""} ${open ? "is-open" : ""}`}>
      <div className="nav__bar wrap">
        <a href={to("#top")} className="nav__brand tap" aria-label="Sixth Route home" data-nav-lockup>
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
          onClick={() => setMenu(!open)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>

      <div id="mobile-menu" className="nav__sheet" hidden={!open}>
        <nav aria-label="Mobile">
          {NAV_LINKS.map((l, i) => (
            <a key={l.label} href={to(l.href)} onClick={closeMenu} style={{ ["--i" as string]: i }}>
              <span className="nav__num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              {l.label}
            </a>
          ))}
        </nav>
        <a href={cta.href} className="btn btn--orange" onClick={closeMenu}>
          <span className="btn__label">{cta.label}</span>
          <span className="btn__dot">
            <ArrowRight />
          </span>
        </a>
        <div className="nav__reach">
          <a className="nav__mail tap" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
          <ul className="nav__social" aria-label="Social">
            {SOCIAL.map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noreferrer">
                  {l.label} <ArrowUpRight size={11} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
