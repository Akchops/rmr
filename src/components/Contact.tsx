import {
  ADDRESS_LINES,
  DIRECTIONS,
  EMAIL,
  INSTAGRAM,
  PHONE_DISPLAY,
  PHONE_E164,
  WHATSAPP,
} from '../data/site';
import './Contact.css';

export default function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="shell contact-grid">
        <div className="contact-main">
          <p className="eyebrow">
            <span className="on">05</span> / Location + contact
          </p>
          <h2 className="h-lg contact-title">Morphed Detailing Studio</h2>

          <address className="contact-address">
            {ADDRESS_LINES.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </address>

          <dl className="contact-list">
            <div>
              <dt className="tech">Phone / WhatsApp</dt>
              <dd>
                <a href={`tel:${PHONE_E164}`}>{PHONE_DISPLAY}</a>
              </dd>
            </div>
            <div>
              <dt className="tech">Email</dt>
              <dd>
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              </dd>
            </div>
            <div>
              <dt className="tech">Instagram</dt>
              <dd>
                <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">
                  @morphedetailingstudio
                </a>
              </dd>
            </div>
          </dl>

          <div className="contact-actions" data-cta-anchor>
            <a className="btn btn-primary" href={WHATSAPP} target="_blank" rel="noopener noreferrer">
              <span>Protect My Vehicle</span>
              <span className="btn-arrow" aria-hidden="true">→</span>
            </a>
            <a className="btn" href={`tel:${PHONE_E164}`}>
              <span>Call the Studio</span>
            </a>
            <a className="btn" href={DIRECTIONS} target="_blank" rel="noopener noreferrer">
              <span>Get Directions</span>
            </a>
            <a className="btn" href={INSTAGRAM} target="_blank" rel="noopener noreferrer">
              <span>Follow on Instagram</span>
            </a>
          </div>
        </div>

        {/* A treatment, not a map: no invented coordinates, and the directions
            link is generated from the verified public address. */}
        <a
          className="contact-plot"
          href={DIRECTIONS}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open directions to Morphed Detailing Studio in Google Maps"
        >
          <span className="contact-plot-grid" aria-hidden="true" />
          <img
            src="/assets/studio-dark-1100.webp"
            srcSet="/assets/studio-dark-700.webp 700w, /assets/studio-dark-1100.webp 1100w, /assets/studio-dark.webp 1800w"
            sizes="(min-width: 900px) 42vw, 100vw"
            width={1800}
            height={1200}
            alt=""
            loading="lazy"
            decoding="async"
          />
          <span className="contact-plot-pin" aria-hidden="true" />
          <span className="contact-plot-label">
            <span className="tech">KHBS Layout — Bengaluru 560086</span>
            <span className="contact-plot-cta">
              Get Directions
              <span className="btn-arrow" aria-hidden="true"> ↗</span>
            </span>
          </span>
        </a>
      </div>
    </section>
  );
}
