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

export default function App() {
  // Images finishing late change section heights; refresh pinned measurements
  // once the page has settled rather than trusting first layout.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
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
