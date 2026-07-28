import { useCallback, useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from './motion';

export type Route = 'home' | 'services';

/** The outgoing view exits before the incoming one enters, so routes never hard cut. */
export type Phase = 'in' | 'out';

export type Navigate = (route: Route, push: boolean, hash?: string) => void;

/** Offset that clears the fixed nav when jumping to an anchor. */
const ANCHOR_OFFSET = 90;
const EXIT_DURATION = 240;

function routeFromHash(): Route {
  return (window.location.hash || '').indexOf('/services') > -1 ? 'services' : 'home';
}

export function useRoute() {
  const [route, setRoute] = useState<Route>(routeFromHash);
  const [phase, setPhase] = useState<Phase>('in');

  // navigate() is handed to links and to popstate, so it reads the live route
  // from a ref rather than closing over a stale one.
  const routeRef = useRef(route);
  routeRef.current = route;
  const exitTimer = useRef<number>();

  const navigate = useCallback<Navigate>((next, push, hash) => {
    // Already where we are being sent. Rather than doing nothing, return to the
    // top: the crest is the way home from anywhere, including from halfway down
    // the page you are already on.
    if (next === routeRef.current && !hash) {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      return;
    }

    const land = () => {
      setRoute(next);
      setPhase('in');
      window.requestAnimationFrame(() => {
        if (hash) {
          const target = document.getElementById(hash);
          if (target) {
            window.scrollTo(0, target.getBoundingClientRect().top + window.pageYOffset - ANCHOR_OFFSET);
          }
          return;
        }
        window.scrollTo(0, 0);
      });
    };

    if (push) {
      window.history.pushState({ route: next }, '', next === 'services' ? '#/services' : '#/');
    }

    if (prefersReducedMotion()) {
      land();
      return;
    }

    setPhase('out');
    window.clearTimeout(exitTimer.current);
    exitTimer.current = window.setTimeout(land, EXIT_DURATION);
  }, []);

  useEffect(() => {
    const onPopState = () => navigate(routeFromHash(), false);
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.clearTimeout(exitTimer.current);
    };
  }, [navigate]);

  return { route, phase, navigate };
}
