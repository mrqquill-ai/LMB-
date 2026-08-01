import { useEffect, useState } from 'react';
import { NavBar } from './components/NavBar';
import { useRoute } from './lib/useRoute';
import { useScrolled } from './lib/useScrolled';
import { About } from './sections/About';
import { Contact } from './sections/Contact';
import { Gallery } from './sections/Gallery';
import { Hero } from './sections/Hero';
import { ServicesPage } from './sections/ServicesPage';
import { ServicesPreview } from './sections/ServicesPreview';

/** Held one frame past mount so the cadence load-in starts from a painted page. */
const PLAY_DELAY = 60;

export default function App() {
  const { route, phase, navigate } = useRoute();
  const scrolled = useScrolled(40);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setPlay(true), PLAY_DELAY);
    return () => window.clearTimeout(timer);
  }, []);

  const leaving = phase === 'out';

  return (
    <div className="lmb-shell">
      <a className="lmb-skip" href="#main">
        Skip to content
      </a>

      <NavBar route={route} scrolled={scrolled} navigate={navigate} />


      <main
        id="main"
        tabIndex={-1}
        className="lmb-view"
        style={{
          opacity: leaving ? 0 : 1,
          transform: leaving ? 'translateY(14px)' : 'translateY(0)',
          transition:
            'opacity 240ms var(--ease-out-strong), transform 420ms var(--ease-out-strong)',
        }}
      >
        {route === 'home' ? (
          <>
            <Hero play={play} />
            <About />
            <ServicesPreview navigate={navigate} />
            <Gallery />
          </>
        ) : (
          <ServicesPage />
        )}
      </main>

      <Contact navigate={navigate} />
    </div>
  );
}
