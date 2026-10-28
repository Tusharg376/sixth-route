import { useCallback, useEffect, useState } from "react";
import { Loader } from "../components/Loader";
import { Nav } from "../components/Nav";
import { Hero } from "../components/Hero";
import { Ticker } from "../components/Ticker";
import { BrandIntro } from "../components/BrandIntro";
import { Manifesto } from "../components/Manifesto";
import { Capabilities } from "../components/Capabilities";
import { Projects } from "../components/Projects";
import { WhyUs } from "../components/WhyUs";
import { Process } from "../components/Process";
import { Proof } from "../components/Proof";
import { Faq } from "../components/Faq";
import { FinalCta } from "../components/FinalCta";
import { Footer } from "../components/Footer";
import { ThumbCta } from "../components/ThumbCta";
import { getLenis, ScrollTrigger, useReveal, useSmoothScroll } from "../lib/motion";
import "@designcodeio/threeui/style.css";

export default function Home() {
  const [ready, setReady] = useState(false);
  const onDone = useCallback(() => setReady(true), []);
  useSmoothScroll();
  useReveal();

  // Re-measure scroll-driven sections once fonts and the loader have settled, then honour
  // an incoming #anchor (e.g. a link to /#faq from another page).
  useEffect(() => {
    if (!ready) return;
    document.fonts?.ready.then(() => {
      ScrollTrigger.refresh();
      const target = window.location.hash && document.querySelector<HTMLElement>(window.location.hash);
      if (!target) return;
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(target, { immediate: true });
      else target.scrollIntoView();
    });
  }, [ready]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {!ready && <Loader onDone={onDone} />}
      <Nav ready={ready} />
      <main id="main">
        <Hero ready={ready} />
        <Ticker />
        <BrandIntro />
        <Manifesto />
        <Capabilities />
        <Projects />
        <WhyUs />
        <Process />
        <Proof />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      {ready && <ThumbCta />}
    </>
  );
}
