import { useEffect, useState } from 'react';
import { WHATSAPP } from '../data/site';
import './StickyCta.css';

/**
 * Mobile-only WhatsApp bar. Appears once the hero has been passed and hides
 * again over the footer so it never covers the closing CTA or the disclosures.
 */
export default function StickyCta() {
  const [show, setShow] = useState(false);

  const [past, setPast] = useState(false);
  const [blocked, setBlocked] = useState(false);

  // Appears once the hero has been passed.
  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Yields whenever the page's own CTAs are on screen, so the bar never covers
  // the button it duplicates. A fixed pixel threshold cannot do this: the
  // sections it must clear change height with the viewport.
  useEffect(() => {
    const anchors = document.querySelectorAll('[data-cta-anchor]');
    if (!anchors.length) return;
    const visible = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target);
          else visible.delete(e.target);
        }
        setBlocked(visible.size > 0);
      },
      // Extra bottom margin: the bar sits above the viewport's bottom edge.
      { rootMargin: '0px 0px 96px 0px' }
    );
    anchors.forEach((a) => io.observe(a));
    return () => io.disconnect();
  }, []);

  useEffect(() => setShow(past && !blocked), [past, blocked]);

  return (
    <div className={`sticky-cta${show ? ' is-on' : ''}`} aria-hidden={!show}>
      <a
        className="btn btn-primary"
        href={WHATSAPP}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={show ? 0 : -1}
      >
        <span>Protect My Vehicle</span>
        <span className="btn-arrow" aria-hidden="true">→</span>
      </a>
    </div>
  );
}
