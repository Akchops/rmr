import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { INSTAGRAM, SLOTS } from '../data/site';
import { useMedia, useReducedMotion } from '../lib/hooks';
import './Work.css';

export default function Work() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const isDesktop = useMedia('(min-width: 900px)', true);

  // Desktop: the gallery is pinned and driven horizontally by vertical scroll.
  // Mobile keeps native horizontal swipe with scroll-snap, which is faster and
  // more predictable than pinning on a small screen.
  useEffect(() => {
    const el = section.current;
    const st = stage.current;
    const tr = track.current;
    if (!el || !st || !tr || !isDesktop || reduced) return;

    const ctx = gsap.context(() => {
      const distance = () => Math.max(0, tr.scrollWidth - window.innerWidth + 120);
      gsap.to(tr, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: st,
          start: 'top top',
          end: () => `+=${distance() + window.innerHeight * 0.4}`,
          pin: st,
          scrub: 0.5,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [isDesktop, reduced]);

  // Pointer-proximity lift: a restrained reward for exploring on desktop.
  useEffect(() => {
    const tr = track.current;
    if (!tr || reduced) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const figures = Array.from(tr.querySelectorAll<HTMLElement>('.work-fig'));
    const onMove = (e: PointerEvent) => {
      for (const f of figures) {
        const r = f.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        const near = Math.max(0, 1 - Math.hypot(dx, dy) / 1.4);
        const img = f.querySelector<HTMLElement>('img');
        if (img) img.style.transform = `scale(${1.04 + near * 0.045}) translate(${dx * near * -10}px, ${dy * near * -8}px)`;
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      figures.forEach((f) => {
        const img = f.querySelector<HTMLElement>('img');
        if (img) img.style.transform = '';
      });
    };
  }, [reduced, isDesktop]);

  return (
    <section className="work" id="work" ref={section}>
      <div className="shell work-head">
        <p className="eyebrow">
          <span className="on">03</span> / Recent work — asset slots
        </p>
        <h2 className="h-lg work-title">
          The frames are built.
          <br />
          The work goes here.
        </h2>
        <p className="lede work-lede">
          Every frame below is a finished slot with its crop and treatment already set. The surfaces
          shown are rendered studies standing in for Morphed's own photography, which drops straight
          into place.
        </p>
      </div>

      <div className="work-stage" ref={stage}>
        <div className="work-viewport">
          <div className="work-track" ref={track}>
            {SLOTS.map((s) => (
              <figure className={`work-fig is-${s.size}`} key={s.id}>
              <div className="work-frame">
                <img
                  src={`/assets/${s.image}-${s.size === 'wide' ? 1000 : 800}.webp`}
                  srcSet={
                    s.size === 'wide'
                      ? `/assets/${s.image}-640.webp 640w, /assets/${s.image}-1000.webp 1000w, /assets/${s.image}.webp 1600w`
                      : `/assets/${s.image}-520.webp 520w, /assets/${s.image}-800.webp 800w, /assets/${s.image}.webp 1200w`
                  }
                  sizes="(min-width: 900px) 40vw, 78vw"
                  width={s.size === 'wide' ? 1600 : 1200}
                  height={s.size === 'wide' ? 1100 : 1500}
                  alt={`Rendered surface study: ${s.surface.toLowerCase()}.`}
                  loading="lazy"
                  decoding="async"
                />
                <span className="work-slot tech" aria-hidden="true">
                  Slot {s.id}
                </span>
              </div>
              <figcaption className="work-cap">
                <span className="work-surface tech">{s.surface}</span>
                <span className="work-intended">
                  Reserved for: <b>{s.intended}</b>
                </span>
              </figcaption>
            </figure>
          ))}

            <div className="work-end">
              <p className="h-md work-end-title">
                See the studio&rsquo;s own work on Instagram.
              </p>
              <a className="btn" href={INSTAGRAM} target="_blank" rel="noopener noreferrer">
                <span>View More on Instagram</span>
                <span className="btn-arrow" aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>

        <p className="shell work-hint tech" aria-hidden="true">
          {isDesktop && !reduced ? 'Scroll to advance —' : 'Swipe to advance —'}
        </p>
      </div>
    </section>
  );
}
