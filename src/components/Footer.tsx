import { useEffect, useRef } from "react";
import { Lockup } from "../brand/Logo";
import { FOOTER } from "../content";
import { gsap, prefersReducedMotion } from "../lib/motion";
import { to } from "../lib/links";
import { PHONE, useMedia } from "../lib/media";
import { ArrowUpRight } from "./Icon";
import "./footer.css";

const YEAR = new Date().getFullYear();

type Link = { label: string; href: string };

function Links({ links }: { links: Link[] }) {
  return links.map((l) => {
    const external = l.href.startsWith("http");
    return (
      <li key={l.label}>
        <a href={to(l.href)} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
          {l.label}
          {external && <ArrowUpRight size={11} />}
        </a>
      </li>
    );
  });
}

export function Footer() {
  const root = useRef<HTMLElement>(null);
  // Phones fold the link columns into accordions and turn Social into a row of pills.
  const phone = useMedia(PHONE);
  const word = useRef<HTMLSpanElement>(null);

  // Fit SIXTHROUTE edge to edge.
  useEffect(() => {
    const el = word.current!;
    const fit = () => {
      el.style.fontSize = "100px";
      const w = el.scrollWidth;
      const box = el.parentElement!;
      const cs = getComputedStyle(box);
      const avail = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      el.style.fontSize = `${Math.floor((100 * avail) / w * 0.995)}px`;
    };
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(el.parentElement!);
    return () => ro.disconnect();
  }, []);

  // The giant wordmark rises from behind the bottom edge as the footer scrolls in.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        word.current,
        { yPercent: 62 },
        {
          yPercent: 0,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top 85%", end: "bottom bottom", scrub: 0.6 },
        },
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <footer className="footer on-dark" data-nav="dark" ref={root}>
      <div className="wrap">
        <div className="footer__top">
          <div className="footer__brand" data-reveal>
            <Lockup tone="dark" />
            <p>{FOOTER.description}</p>
          </div>
        </div>

        <nav className="footer__cols" aria-label="Footer">
          {FOOTER.columns.map((col, i) =>
            phone ? (
              col.title === "Social" ? (
                <ul key={col.title} className="footer__social" aria-label={col.title}>
                  <Links links={col.links} />
                </ul>
              ) : (
                <details key={col.title} className="footer__col footer__acc">
                  <summary>{col.title}</summary>
                  <ul>
                    <Links links={col.links} />
                  </ul>
                </details>
              )
            ) : (
              <div key={col.title} className="footer__col" data-reveal style={{ ["--reveal-delay" as string]: `${i * 90}ms` }}>
                <p className="footer__h">{col.title}</p>
                <ul>
                  <Links links={col.links} />
                </ul>
              </div>
            ),
          )}
        </nav>

        <div className="footer__legal">
          <span>© {YEAR} Sixth Route. All rights reserved.</span>
          <span className="footer__tag">Beyond the obvious.</span>
          <a href="#top" className="tap">
            Back to top ↑
          </a>
        </div>
      </div>

      <div className="footer__giant" aria-hidden="true">
        <span ref={word} className="footer__word">
          <b>SIXTH</b>
          <i>ROUTE</i>
        </span>
      </div>
    </footer>
  );
}
