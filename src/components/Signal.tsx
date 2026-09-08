import { RATING, WHATSAPP } from '../data/site';
import './Signal.css';

export default function Signal() {
  return (
    <section className="signal" id="studio">
      <div className="shell signal-grid">
        <div className="signal-media">
          <img
            src="/assets/signal-surface-1000.webp"
            srcSet="/assets/signal-surface-640.webp 640w, /assets/signal-surface-1000.webp 1000w, /assets/signal-surface.webp 1600w"
            sizes="(min-width: 900px) 44vw, 100vw"
            width={1600}
            height={1400}
            alt="Rendered study of a dark, clear-coated body panel under studio light."
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="signal-body">
          <p className="eyebrow">
            <span className="on">04</span> / Review signal
          </p>

          <div className="signal-rating">
            <span className="signal-value">{RATING.value}</span>
            <span className="signal-meta">
              <a href={RATING.href} target="_blank" rel="noopener noreferrer" className="signal-link">
                {RATING.count} online ratings on {RATING.source}
                <span className="btn-arrow" aria-hidden="true"> ↗</span>
              </a>
              <span className="signal-note">
                Third-party rating observed during concept research. Verify current listing before
                official launch.
              </span>
            </span>
          </div>

          <h2 className="h-lg signal-title">
            Your vehicle.
            <br />
            The right protection
            <br />
            conversation.
          </h2>

          <p className="lede signal-lede">
            Tell Morphed what you drive and what you want to protect. The studio can discuss the
            available service options for your vehicle.
          </p>

          <a className="btn btn-primary" href={WHATSAPP} target="_blank" rel="noopener noreferrer">
            <span>Message Morphed on WhatsApp</span>
            <span className="btn-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
