import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Logo } from './Photo';
import { whatsappHref } from '../data/contact';
import { scrollToSection } from '../lib/scrollToSection';
import type { Navigate, Route } from '../lib/useRoute';

type Props = {
  route: Route;
  scrolled: boolean;
  navigate: Navigate;
};

export function NavBar({ route, scrolled, navigate }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const sheet = useRef<HTMLDivElement>(null);

  const go = (to: Route, hash?: string) => (event: MouseEvent) => {
    event.preventDefault();
    setMenuOpen(false);
    navigate(to, true, hash);
  };

  // "Book the band" goes to the booking form, which lives outside the routed
  // view and so exists on both routes.
  const goBooking = (event: MouseEvent) => {
    event.preventDefault();
    setMenuOpen(false);
    scrollToSection('contact');
  };

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    sheet.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      menuButton.current?.focus();
    };
  }, [menuOpen]);

  const whatsapp = whatsappHref();

  return (
    <header
      className={`lmb-nav${scrolled ? ' lmb-nav-scrolled' : ''}${
        menuOpen ? ' lmb-nav-menu-open' : ''
      }`}
    >
      <a href="#/" onClick={go('home')} className="lmb-nav-logo-wrap">
        <Logo className="lmb-nav-logo" />
      </a>

      <nav className="lmb-nav-links" aria-label="Primary">
        <div className="lmb-nav-group">
          <a
            href="#/services"
            onClick={go('services')}
            className={`lmb-nav-link${route === 'services' ? ' lmb-nav-link-active' : ''}`}
            aria-current={route === 'services' ? 'page' : undefined}
          >
            Services
          </a>
          <a href="#/#gallery" onClick={go('home', 'gallery')} className="lmb-nav-link">
            Gallery
          </a>
          <a href="#/#about" onClick={go('home', 'about')} className="lmb-nav-link">
            About
          </a>
        </div>
        <a href="#contact" onClick={goBooking} className="lmb-nav-cta">
          Book The Band
        </a>
      </nav>

      <button
        type="button"
        className="lmb-menu-button"
        ref={menuButton}
        onClick={() => setMenuOpen((open) => !open)}
        aria-expanded={menuOpen}
        aria-controls="lmb-menu"
      >
        {menuOpen ? 'Close' : 'Menu'}
      </button>

      {menuOpen && (
        <div
          className="lmb-menu"
          id="lmb-menu"
          ref={sheet}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          tabIndex={-1}
          onClick={(event) => {
            if (event.target === event.currentTarget) setMenuOpen(false);
          }}
        >
          <div className="lmb-menu-links">
            <a
              href="#/services"
              onClick={go('services')}
              className={route === 'services' ? 'lmb-menu-link-active' : undefined}
              aria-current={route === 'services' ? 'page' : undefined}
            >
              Services
            </a>
            <a href="#/#gallery" onClick={go('home', 'gallery')}>
              Gallery
            </a>
            <a href="#/#about" onClick={go('home', 'about')}>
              About
            </a>
          </div>

          <div className="lmb-menu-actions">
            <a href="#contact" onClick={goBooking} className="lmb-cta-solid">
              Book the band <span aria-hidden="true">&#8599;</span>
            </a>
            {whatsapp && (
              <a
                className="lmb-link-underline lmb-link-on-dark"
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
              >
                Message on WhatsApp
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
