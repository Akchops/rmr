import { useEffect, useRef, useState } from 'react';
import { SERVICES, WHATSAPP } from '../data/site';
import { useMedia } from '../lib/hooks';
import './Services.css';

export default function Services() {
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);
  const isDesktop = useMedia('(min-width: 900px)', true);
  const listRef = useRef<HTMLDivElement>(null);

  // Hover previews on desktop; a click locks the selection. On touch the
  // buttons are plain tabs — nothing depends on hover.
  const preview = (i: number) => {
    if (isDesktop && !pinned) setActive(i);
  };

  useEffect(() => {
    if (!isDesktop) setPinned(true);
  }, [isDesktop]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = SERVICES.length - 1;
    let next: number | null = null;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = active === last ? 0 : active + 1;
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = active === 0 ? last : active - 1;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = last;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    setPinned(true);
    listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus();
  };

  return (
    <section className="svc" id="services">
      <div className="shell svc-head">
        <p className="eyebrow">
          <span className="on">02</span> / Service system
        </p>
        <h2 className="h-lg svc-title">
          Four ways the studio
          <br />
          works on a surface.
        </h2>
      </div>

      <div className="shell svc-grid">
        <div
          className="svc-list"
          role="tablist"
          aria-orientation="vertical"
          aria-label="Services"
          ref={listRef}
          onKeyDown={onKeyDown}
          onMouseLeave={() => setPinned(true)}
        >
          {SERVICES.map((s, i) => {
            const on = i === active;
            return (
              <button
                key={s.n}
                role="tab"
                id={`svc-tab-${s.n}`}
                aria-selected={on}
                aria-controls={`svc-panel-${s.n}`}
                tabIndex={on ? 0 : -1}
                className={`svc-item${on ? ' is-active' : ''}`}
                onMouseEnter={() => preview(i)}
                onFocus={() => preview(i)}
                onClick={() => {
                  setActive(i);
                  setPinned(true);
                }}
              >
                <span className="svc-n">{s.n}</span>
                <span className="svc-name">{s.title}</span>
                <span className="svc-mark" aria-hidden="true" />
              </button>
            );
          })}
        </div>

        <div className="svc-media">
          {SERVICES.map((s, i) => (
            <img
              key={s.n}
              className={`svc-img${i === active ? ' is-active' : ''}`}
              src={`/assets/${s.image}-900.webp`}
              srcSet={`/assets/${s.image}-560.webp 560w, /assets/${s.image}-900.webp 900w, /assets/${s.image}.webp 1400w`}
              sizes="(min-width: 900px) 46vw, 100vw"
              width={1400}
              height={1750}
              alt={`Rendered surface study used for ${s.title.toLowerCase()}: ${s.surface.toLowerCase()}.`}
              loading="lazy"
              decoding="async"
            />
          ))}
          <span className="svc-media-tag tech" aria-hidden="true">
            {SERVICES[active].surface}
          </span>
        </div>

        <div className="svc-detail">
          {SERVICES.map((s, i) => (
            <div
              key={s.n}
              role="tabpanel"
              id={`svc-panel-${s.n}`}
              aria-labelledby={`svc-tab-${s.n}`}
              hidden={i !== active}
              className="svc-panel"
            >
              <p className="svc-panel-n tech">
                {s.n} / {s.title}
              </p>
              <p className="svc-body">{s.body}</p>
            </div>
          ))}
          <a
            className="btn btn-primary svc-cta"
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            data-cta-anchor
          >
            <span>Discuss My Vehicle</span>
            <span className="btn-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
