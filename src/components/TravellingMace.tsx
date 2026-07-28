import { useEffect, useRef } from 'react';
import { Cutout } from './Cutout';
import { prefersReducedMotion } from '../lib/motion';
import { subscribeScroll } from '../lib/scroll';

type Waypoint = {
  /** Scroll progress through the page, 0 at the top and 1 at the bottom. */
  at: number;
  /** Centre of the mace, as a fraction of the viewport. */
  x: number;
  y: number;
  rotate: number;
  scale: number;
};

/**
 * The mace leads the formation down a street, so it leads the reader down the
 * page. It enters upright in the hero's open right-hand space, swings out to
 * the margins through About, Services and Gallery, and plants itself upright
 * again beside the booking form.
 *
 * Positions are fractions of the viewport rather than pixels, so the route
 * holds its shape from a laptop to a wide display.
 */
const ROUTE: Waypoint[] = [
  // Hero: upright in the open right-hand half of the type column.
  { at: 0, x: 0.485, y: 0.5, rotate: 0, scale: 1 },
  // About is a pinned sequence three viewports tall, so it holds the screen for
  // a third of the page. The mace descends the left gutter through it rather
  // than standing still, and stays clear of the heading and copy.
  // Offset far enough left that the tilt does not swing the ferrule into the
  // heading: a 526px object at 20 degrees is 180px wider than its own width.
  { at: 0.13, x: -0.05, y: 0.3, rotate: -14, scale: 0.86 },
  { at: 0.45, x: -0.05, y: 0.72, rotate: -20, scale: 0.86 },
  // Services is deep green with open field to the right of the cards.
  { at: 0.62, x: 0.95, y: 0.5, rotate: 14, scale: 0.74 },
  // Gallery is cream and full width again, so back off the edge.
  { at: 0.82, x: 0.995, y: 0.46, rotate: 16, scale: 0.86 },
  // Contact: plants upright in the gap between the copy and the form.
  { at: 1, x: 0.45, y: 0.5, rotate: 0, scale: 0.92 },
];

/** Eased blend between waypoints. Nothing on this site moves linearly. */
const smoothstep = (t: number) => t * t * (3 - 2 * t);

function sample(progress: number): Omit<Waypoint, 'at'> {
  if (progress <= ROUTE[0].at) return ROUTE[0];
  const last = ROUTE[ROUTE.length - 1];
  if (progress >= last.at) return last;

  const index = ROUTE.findIndex((point, i) => i > 0 && progress <= point.at);
  const from = ROUTE[index - 1];
  const to = ROUTE[index];
  const t = smoothstep((progress - from.at) / (to.at - from.at));
  const mix = (a: number, b: number) => a + (b - a) * t;

  return {
    x: mix(from.x, to.x),
    y: mix(from.y, to.y),
    rotate: mix(from.rotate, to.rotate),
    scale: mix(from.scale, to.scale),
  };
}

export function TravellingMace() {
  const anchor = useRef<HTMLDivElement>(null);
  const object = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    return subscribeScroll(() => {
      const outer = anchor.current;
      const inner = object.current;
      if (!outer || !inner) return;

      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.pageYOffset / scrollable)) : 0;
      const at = sample(progress);

      // Position on the outer element and orientation on the inner one, so the
      // rotation pivots on the mace's own centre rather than the viewport.
      outer.style.transform = `translate3d(${(at.x * window.innerWidth).toFixed(1)}px, ${(
        at.y * window.innerHeight
      ).toFixed(1)}px, 0)`;
      inner.style.transform = `translate(-50%, -50%) rotate(${at.rotate.toFixed(2)}deg) scale(${at.scale.toFixed(3)})`;
    });
  }, []);

  return (
    <div className="lmb-mace" ref={anchor} aria-hidden="true">
      <div className="lmb-mace-object" ref={object}>
        <Cutout name="mace" sizes="150px" />
      </div>
    </div>
  );
}
