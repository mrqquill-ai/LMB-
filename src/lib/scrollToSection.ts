import { prefersReducedMotion } from './motion';

/** Clears the fixed nav when jumping to an anchor. Matches useRoute's offset. */
const ANCHOR_OFFSET = 90;

/** Scrolls an on-page section into view below the fixed nav. */
export function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;

  window.scrollTo({
    top: target.getBoundingClientRect().top + window.pageYOffset - ANCHOR_OFFSET,
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
  });
}
