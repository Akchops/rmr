import { useEffect, useState } from 'react';
import './TechRail.css';

/**
 * Fixed left-edge technical rail: a persistent structural element that runs
 * the height of the page, carrying scroll progress and the current section.
 * Desktop only — it is decorative, and the same information is available in
 * the navigation.
 */
const SECTIONS = [
  { id: 'top', label: 'Hero' },
  { id: 'protection', label: 'Protection' },
  { id: 'services', label: 'Services' },
  { id: 'work', label: 'Work' },
  { id: 'studio', label: 'Studio' },
  { id: 'contact', label: 'Contact' },
];

export default function TechRail() {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState('Hero');

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const found = SECTIONS.find((s) => s.id === e.target.id);
            if (found) setActive(found.label);
          }
        }
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <aside className="rail" aria-hidden="true">
      <span className="rail-word">MORPHED</span>
      <span className="rail-track">
        <span className="rail-fill" style={{ transform: `scaleY(${progress})` }} />
      </span>
      <span className="rail-label">{active}</span>
      <span className="rail-pct">{String(Math.round(progress * 100)).padStart(3, '0')}</span>
    </aside>
  );
}
