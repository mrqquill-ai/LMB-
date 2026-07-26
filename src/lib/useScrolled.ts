import { useEffect, useState } from 'react';
import { subscribeScroll } from './scroll';

/** True once the page has scrolled past `threshold`, used to condense the nav. */
export function useScrolled(threshold = 40): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(
    () => subscribeScroll(() => setScrolled(window.pageYOffset > threshold)),
    [threshold],
  );

  return scrolled;
}
