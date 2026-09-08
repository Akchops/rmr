import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { useReducedMotion } from '../lib/hooks';
import { WHATSAPP } from '../data/site';
import './Hero.css';

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    if (reduced) {
      // Reduced motion is a designed state: everything simply present.
      gsap.set(el.querySelectorAll('[data-anim]'), { clearProps: 'all', opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

      // The surface arrives through a shaped mask rather than a fade.
      tl.fromTo(
        '[data-anim="media"]',
        { clipPath: 'inset(18% 0% 18% 0%)', scale: 1.12 },
        { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.5 }
      )
        .fromTo('[data-anim="rule"]', { scaleX: 0 }, { scaleX: 1, duration: 1.1 }, 0.1)
        .fromTo(
          '[data-anim="eyebrow"]',
          { yPercent: 120, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.8 },
          0.2
        )
        // Lines rise out of their own masks: one purposeful sequence, no
        // letter-by-letter.
        .fromTo(
          '[data-anim="line"]',
          { yPercent: 108 },
          { yPercent: 0, duration: 1.05, stagger: 0.085 },
          0.3
        )
        // The sweep must finish invisible: parked anywhere on the image, its
        // edges read as a seam across the paint.
        .fromTo(
          '[data-anim="sweep"]',
          { xPercent: -120, skewX: -12, opacity: 0 },
          {
            xPercent: 210,
            skewX: -12,
            opacity: 1,
            duration: 1.7,
            ease: 'power2.inOut',
            onComplete() {
              gsap.set('[data-anim="sweep"]', { autoAlpha: 0 });
            },
          },
          0.5
        )
        .to('[data-anim="sweep"]', { opacity: 0, duration: 0.5, ease: 'none' }, 1.7)
        .fromTo(
          '[data-anim="sub"]',
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          0.72
        )
        .fromTo(
          '[data-anim="cta"]',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.07 },
          0.82
        )
        .fromTo('[data-anim="meta"]', { opacity: 0 }, { opacity: 1, duration: 0.7 }, 1);

      // Scrolling back to the top plays the opening again. The restart fires
      // once the hero is about half visible, so the sequence is on screen for
      // it rather than running behind the fold.
      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'center top',
        onEnterBack: () => tl.restart(),
      });
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  // Pointer parallax on the surface layers. Desktop pointers only.
  useEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const media = el.querySelector<HTMLElement>('[data-par="media"]');
    const glow = el.querySelector<HTMLElement>('[data-par="glow"]');
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const tick = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      if (media) media.style.transform = `translate3d(${cx * -14}px, ${cy * -10}px, 0) scale(1.05)`;
      if (glow) glow.style.transform = `translate3d(${cx * 44}px, ${cy * 30}px, 0)`;
      raf = Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001 ? requestAnimationFrame(tick) : 0;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <section className="hero" id="top" ref={root}>
      <div className="hero-media" data-anim="media">
        <img
          data-par="media"
          src="/assets/hero-surface-1600.webp"
          srcSet="/assets/hero-surface-640.webp 640w, /assets/hero-surface-1000.webp 1000w, /assets/hero-surface-1600.webp 1600w, /assets/hero-surface.webp 2400w"
          sizes="100vw"
          width={2400}
          height={1500}
          alt="Rendered study of a curved, clear-coated vehicle body panel with a crease line catching studio light."
          decoding="async"
          // react-dom 18 does not map the camelCase prop; pass the attribute through.
          {...{ fetchpriority: 'high' }}
        />
        <span className="hero-sweep" data-anim="sweep" aria-hidden="true" />
        <span className="hero-glow" data-par="glow" aria-hidden="true" />
        <span className="hero-scrim" aria-hidden="true" />
      </div>

      <div className="hero-body shell">
        <p className="eyebrow hero-eyebrow" data-anim="eyebrow">
          <span className="on">Bengaluru</span> / Paint Protection + Detailing
        </p>

        <h1 className="h-xl hero-title">
          {['Protection,', 'perfected in', 'every surface.'].map((line) => (
            <span className="hero-line" key={line}>
              <span data-anim="line">{line}</span>
            </span>
          ))}
        </h1>

        <span className="rule hero-rule" data-anim="rule" aria-hidden="true" />

        <p className="lede hero-sub" data-anim="sub">
          Paint protection film, ceramic coating, detailing and vehicle wraps in Bengaluru.
        </p>

        <div className="hero-cta">
          <a
            className="btn btn-primary"
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            data-anim="cta"
          >
            <span>Protect My Vehicle</span>
            <span className="btn-arrow" aria-hidden="true">→</span>
          </a>
          <a className="btn" href="#work" data-anim="cta">
            <span>View Recent Work</span>
          </a>
        </div>

        <p className="tech hero-meta" data-anim="meta">
          Cars / Motorcycles
        </p>
      </div>

      <div className="hero-foot shell" data-anim="meta">
        <span className="tech">Scroll — Interactive PPF visualisation</span>
        <span className="hero-foot-line" aria-hidden="true" />
      </div>
    </section>
  );
}
