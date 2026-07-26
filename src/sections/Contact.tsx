import type { MouseEvent } from 'react';
import { BookingForm } from '../components/BookingForm';
import { CadenceRule } from '../components/CadenceRule';
import { Logo } from '../components/Photo';
import { contact, whatsappHref } from '../data/contact';
import type { Navigate } from '../lib/useRoute';

type Props = {
  navigate: Navigate;
};

/**
 * Booking form and footer. Sits outside the routed view so it stays put while
 * Home and Services cross over, which also makes #contact a valid target from
 * either route.
 */
export function Contact({ navigate }: Props) {
  const go = (hash?: string) => (event: MouseEvent) => {
    event.preventDefault();
    navigate('home', true, hash);
  };

  const goServices = (event: MouseEvent) => {
    event.preventDefault();
    navigate('services', true);
  };

  const whatsapp = whatsappHref();
  const hasContactDetails = Boolean(contact.phone || contact.email || contact.instagram);

  return (
    <section id="contact" className="lmb-contact lmb-section-deep">
      <div className="lmb-container">
        <CadenceRule tone="gold" style={{ marginBottom: 48 }} />

        <div className="lmb-book">
          <div className="lmb-book-main">
            <h2 className="lmb-h2-lead">Book the band.</h2>
            <p className="lmb-book-copy">
              Send the date, the venue and the formation you want. We reply with availability and a
              quote. A 50% deposit holds the date.
            </p>

            <ul className="lmb-book-terms">
              <li>
                <span className="lmb-beat" aria-hidden="true" />
                50% deposit confirms the date
              </li>
              <li>
                <span className="lmb-beat" aria-hidden="true" />
                Transport within Lagos included
              </li>
              <li>
                <span className="lmb-beat" aria-hidden="true" />
                Outside Lagos quoted on request
              </li>
            </ul>

            {whatsapp && (
              <a
                className="lmb-link-underline lmb-link-on-dark lmb-book-direct"
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
              >
                Or message on WhatsApp
              </a>
            )}
          </div>

          <BookingForm />
        </div>

        <CadenceRule tone="gold" style={{ opacity: 0.5 }} />

        <div className="lmb-footer">
          <div className="lmb-footer-brand">
            <Logo />
            <div className="lmb-footer-brand-note">
              NYSC Community Development Service group.
              <br />
              Lagos State, Nigeria.
            </div>
          </div>

          <div className="lmb-footer-cols">
            <div className="lmb-footer-col">
              <div className="lmb-footer-col-head">Pages</div>
              <a href="#/services" onClick={goServices}>
                Services
              </a>
              <a href="#/#gallery" onClick={go('gallery')}>
                Gallery
              </a>
              <a href="#/#about" onClick={go('about')}>
                About
              </a>
              <a href="#contact">Contact</a>
            </div>

            {hasContactDetails && (
              <div className="lmb-footer-col">
                <div className="lmb-footer-col-head">Contact</div>
                {contact.phone && <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a>}
                {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
                {contact.instagram && (
                  <a
                    href={`https://instagram.com/${contact.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    @{contact.instagram}
                  </a>
                )}
              </div>
            )}

            <div className="lmb-footer-col">
              <div className="lmb-footer-col-head">Booking</div>
              <div>50% deposit confirms</div>
              <div>Lagos transport included</div>
              <div>Outside Lagos on request</div>
            </div>
          </div>
        </div>

        <div className="lmb-colophon">
          <span>One band, one sound, one voice.</span>
          <span>Lagos Musical Band, 2026.</span>
        </div>
      </div>
    </section>
  );
}
