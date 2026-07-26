import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from './motion';
import { subscribeScroll } from './scroll';

/**
 * Scroll-linked drift on a photograph, tied directly to scroll position rather
 * than a binary fade once visible. The image is taller than its frame, so the
 * travel stays inside the crop. `travel` is the total range in pixels.
 */
export function useParallax(travel: number) {
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    return subscribeScroll(() => {
      const el = ref.current;
      const frame = el?.parentElement;
      if (!el || !frame) return;

      const viewport = window.innerHeight;
      const rect = frame.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > viewport) return;

      const progress = (viewport - rect.top) / (viewport + rect.height);
      el.style.transform = `translate3d(0, ${((0.5 - progress) * travel).toFixed(2)}px, 0)`;
    });
  }, [travel]);

  return ref;
}
