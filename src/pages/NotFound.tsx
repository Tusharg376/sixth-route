import { useState } from "react";
import { Nav } from "../components/Nav";
import { Mascot } from "../components/Mascot";
import { ArrowRight, ArrowUpRight } from "../components/Icon";
import { CONTACT_HREF, NOT_FOUND } from "../content";
import "./notfound.css";

export default function NotFound() {
  // Route cheers up when the visitor heads for a way out.
  const [happy, setHappy] = useState(false);
  const cheer = { onPointerEnter: () => setHappy(true), onPointerLeave: () => setHappy(false), onFocus: () => setHappy(true), onBlur: () => setHappy(false) };

  return (
    <>
      <Nav ready />
      <main id="main" className="nf on-dark" data-nav="dark">
        <div className="nf__ember nf__ember--a" />
        <div className="nf__ember nf__ember--b" />
        <div className="wrap nf__inner">
          <p className="nf__code" aria-label="Error 404">
            <span aria-hidden="true">4</span>
            <Mascot happy={happy} className="nf__mascot" />
            <span aria-hidden="true">4</span>
          </p>
          <h1 className="nf__title">{NOT_FOUND.headline}</h1>
          <p className="nf__body">{NOT_FOUND.body}</p>
          <div className="nf__actions">
            <a href="/" className="btn btn--orange" {...cheer}>
              <span className="btn__label">Back to Home</span>
              <span className="btn__dot">
                <ArrowRight />
              </span>
            </a>
            <a href={CONTACT_HREF} className="btn btn--ghost" {...cheer}>
              Start a Project <ArrowUpRight />
            </a>
          </div>
          <nav className="nf__routes" aria-label="Popular pages">
            <span>Popular routes</span>
            {NOT_FOUND.links.map((l) => (
              <a key={l.label} href={l.href} className="tap" {...cheer}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </main>
    </>
  );
}
