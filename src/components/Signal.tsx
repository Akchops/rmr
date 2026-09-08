import { SELF_CLAIMS, WHATSAPP } from '../data/site';
import './Signal.css';

/**
 * Services-credibility band.
 *
 * This section previously carried a third-party numeric rating. That figure
 * could not be re-verified, so it was removed outright rather than softened or
 * dated — an unverifiable number on a page the owner shows customers is his
 * liability, not a credential.
 *
 * What replaces it is the studio's own public self-description, presented as
 * exactly that: the business's claim, attributed in plain sight and linked to
 * the profile it came from. It is deliberately NOT set in the display-numeral
 * treatment the rating used, because that styling reads as an independent
 * credential.
 */
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
            <span className="on">04</span> / In the studio&rsquo;s own words
          </p>

          <ul className="claims">
            {SELF_CLAIMS.items.map((c) => (
              <li className="claim" key={c.n}>
                <span className="claim-n" aria-hidden="true">
                  {c.n}
                </span>
                <span className="claim-text">{c.text}</span>
              </li>
            ))}
          </ul>

          <p className="claims-src">
            <a
              className="claims-link"
              href={SELF_CLAIMS.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {SELF_CLAIMS.handle}
              <span className="btn-arrow" aria-hidden="true">
                {' '}
                ↗
              </span>
            </a>
            <span className="claims-note">{SELF_CLAIMS.attribution}</span>
          </p>

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
