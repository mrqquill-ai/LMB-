import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from './motion';
import { subscribeScroll } from './scroll';

/**
 * Scroll-linked drift on a photograph, tied directly to scroll position rather
 * than a binary fade once visible. The image is taller than its frame, so the
 * travel stays inside the crop. `travel` is the total range in pixels.
 *
 * The frame is passed explicitly rather than read off the image's parent, since
 * <picture> sits between them in the markup.
 */
export function useParallax(travel: number) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    return subscribeScroll(() => {
      const image = imageRef.current;
      const frame = frameRef.current;
      if (!image || !frame) return;

      const viewport = window.innerHeight;
      const rect = frame.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > viewport) return;

      const progress = (viewport - rect.top) / (viewport + rect.height);
      image.style.transform = `translate3d(0, ${((0.5 - progress) * travel).toFixed(2)}px, 0)`;
    });
  }, [travel]);

  return { frameRef, imageRef };
}
