import { useEffect } from 'react';
import Nav from './components/Nav';
import TechRail from './components/TechRail';
import Hero from './components/Hero';
import PpfReveal from './components/PpfReveal';
import Services from './components/Services';
import Work from './components/Work';
import Signal from './components/Signal';
import Contact from './components/Contact';
import Closing from './components/Closing';
import StickyCta from './components/StickyCta';
import { ScrollTrigger } from './lib/gsap';
import { initReveals } from './lib/reveal';
import { useReducedMotion } from './lib/hooks';

export default function App() {
  const reduced = useReducedMotion();

  // Scroll reveals replay on every pass; see src/lib/reveal.ts.
  useEffect(() => initReveals(reduced), [reduced]);

  // Images and webfonts finishing late change section heights, which would
  // leave every trigger measured against a stale layout — and a reveal whose
  // range is wrong can strand its element in the hidden from-state. Refresh
  // once the page has actually settled rather than trusting first layout.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    document.fonts?.ready.then(refresh);
    const t = window.setTimeout(refresh, 900);
    return () => {
      window.removeEventListener('load', refresh);
      window.clearTimeout(t);
    };
  }, []);

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Nav />
      <TechRail />
      <main id="main">
        <Hero />
        <PpfReveal />
        <Services />
        <Work />
        <Signal />
        <Contact />
        <Closing />
      </main>
      <StickyCta />
    </>
  );
}
