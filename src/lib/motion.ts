import type { CSSProperties } from 'react';

/**
 * The band's motion rule: nothing linear, nothing default. Every entrance uses
 * the strong ease-out from the design tokens, and everything collapses to its
 * final state when the visitor asks for reduced motion.
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Opacity rise used by the kicker, the subhead and the CTA row. */
export function fadeIn(play: boolean, delay: number): CSSProperties {
  return {
    opacity: play ? 1 : 0,
    animation: play ? `lmb-rise 340ms var(--ease-out-strong) ${delay}ms forwards` : 'none',
  };
}
