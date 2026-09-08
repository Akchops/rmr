import {
  ADDRESS_LINES,
  DISCLAIMER_ASSETS,
  DISCLAIMER_MAIN,
  EMAIL,
  FACEBOOK,
  INSTAGRAM,
  PHONE_DISPLAY,
  PHONE_E164,
  WHATSAPP,
} from '../data/site';
import './Closing.css';

export default function Closing() {
  return (
    <>
      <section className="close">
        <div className="shell close-in">
          <p className="eyebrow">
            <span className="on">06</span> / Bengaluru
          </p>
          <h2 className="h-xl close-title" data-reveal="rise">
            Ready to protect
            <br />
            what you drive?
          </h2>
          <div className="close-cta" data-cta-anchor data-reveal="lift">
            <a className="btn btn-primary" href={WHATSAPP} target="_blank" rel="noopener noreferrer">
              <span>Protect My Vehicle</span>
              <span className="btn-arrow" aria-hidden="true">→</span>
            </a>
            <a className="btn" href={`tel:${PHONE_E164}`}>
              <span>Call {PHONE_DISPLAY}</span>
            </a>
          </div>
        </div>
      </section>

      <footer className="foot">
        <div className="shell">
          <div className="foot-grid">
            <div className="foot-col">
              <span className="foot-mark">MORPHED</span>
              <address className="foot-address">
                {ADDRESS_LINES.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </address>
            </div>

            <div className="foot-col">
              <span className="tech foot-h">Contact</span>
              <a href={`tel:${PHONE_E164}`}>{PHONE_DISPLAY}</a>
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </div>

            <div className="foot-col">
              <span className="tech foot-h">Follow</span>
              <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">
                Instagram ↗
              </a>
              <a href={FACEBOOK} target="_blank" rel="noopener noreferrer">
                Facebook ↗
              </a>
            </div>
          </div>

          <div className="foot-legal">
            <p>{DISCLAIMER_MAIN}</p>
            <p>{DISCLAIMER_ASSETS}</p>
          </div>
        </div>
      </footer>
    </>
  );
}
