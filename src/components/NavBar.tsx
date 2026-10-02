import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Arrow } from './Arrow';
import { Logo } from './Photo';
import { whatsappHref } from '../data/contact';
import { prefersReducedMotion } from '../lib/motion';
import { scrollToSection } from '../lib/scrollToSection';
import type { Navigate, Route } from '../lib/useRoute';

type Props = {
  route: Route;
  scrolled: boolean;
  navigate: Navigate;
};

/** Matches the duration of lmb-menu-out, so the node leaves the instant its
 *  exit transition finishes rather than before or after it. */
const SHEET_EXIT_DURATION = 200;

export function NavBar({ route, scrolled, navigate }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  // Stays true a beat after menuOpen goes false, so the sheet plays an exit
  // transition instead of vanishing on the same frame the state flips.
  const [sheetMounted, setSheetMounted] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number>();

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
    window.clearTimeout(closeTimer.current);

    if (menuOpen) {
      setSheetMounted(true);
      return;
    }
    if (!sheetMounted) return;

    // Reduced motion gets the same instant-appear, instant-gone treatment as
    // every other entrance on the site, rather than a cross-fade invented just
    // for this one element.
    if (prefersReducedMotion()) {
      setSheetMounted(false);
      return;
    }

    closeTimer.current = window.setTimeout(() => setSheetMounted(false), SHEET_EXIT_DURATION);
    return () => window.clearTimeout(closeTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuOpen, sheetMounted]);

  // Keyed on sheetMounted rather than menuOpen, so the body stays locked and
  // the dialog keeps the Escape key for the whole time the sheet is visible,
  // including while it is animating out, not just while it is logically open.
  useEffect(() => {
    if (!sheetMounted) return;

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
  }, [sheetMounted]);

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

      {sheetMounted && (
        <div
          className={`lmb-menu${menuOpen ? '' : ' lmb-menu-closing'}`}
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
              Book the band <Arrow />
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
