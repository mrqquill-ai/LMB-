import { useEffect, useRef } from 'react';
import { Cutout } from './Cutout';
import { prefersReducedMotion } from '../lib/motion';
import { subscribeScroll } from '../lib/scroll';

/**
 * A viewport fraction, or a function of viewport width where the safe lane
 * depends on how the layout has reflowed.
 */
type Track = number | ((viewportWidth: number) => number);

type Waypoint = {
  /** Which section this waypoint belongs to. */
  section: keyof typeof SECTIONS;
  /** How far through that section's own scroll range, 0 to 1. */
  at: number;
  /** Centre of the mace, as a fraction of the viewport. Outside 0..1 is off-canvas. */
  x: Track;
  y: number;
  rotate: number;
  scale: number;
};

/** Off the right edge by more than the mace's own width. */
const PARKED = 1.16;

/**
 * Just past the hero's seam, which the split puts at 56% at every width. The
 * mace is nearly as tall as the hero, so no horizontal band inside the type
 * column clears both the headline and the CTA row at every viewport height.
 * Standing it on the seam does, and it reads as belonging to the gold rule.
 */
const HERO_SEAM = 0.575;

/** Content column width, matching --container-max and the section padding. */
const containerWidth = (vw: number) => Math.min(1240, vw - 112);

/** Half the mace's bounding box once rotated, with a little air. */
const CLEARANCE = 90;

/**
 * Beside the package cards, but only as far in as the right-hand gutter allows.
 * Wide screens have room to show it; narrow ones would push it over the cards,
 * so it parks instead.
 */
const servicesLane: Track = (vw) => {
  const edge = (vw + containerWidth(vw)) / 2;
  return Math.min(PARKED, (edge + CLEARANCE) / vw);
};

/**
 * The gap between the booking copy and the form. That gap only exists while the
 * two sit side by side; below roughly 1024 the grid collapses to one column and
 * there is nowhere to plant, so the mace stays off-canvas.
 */
const contactLane: Track = (vw) => {
  const container = containerWidth(vw);
  if (container < 1000) return PARKED;
  const formWidth = 520;
  const gap = 72;
  const copyWidth = container - gap - formWidth;
  const gapCentre = (vw - container) / 2 + copyWidth + gap / 2;
  return gapCentre / vw;
};

const SECTIONS = {
  hero: '.lmb-hero',
  about: '#about',
  services: '#services',
  gallery: '#gallery',
  contact: '#contact',
} as const;

/**
 * The mace leads the formation down a street, so it leads the reader down the
 * page.
 *
 * Waypoints are anchored to sections rather than to fixed page fractions. The
 * About sequence alone is three viewports tall and every section reflows at
 * different widths, so hardcoded fractions drift out of step as soon as the
 * viewport changes. Anchoring keeps the route in the same relationship to the
 * content at any size.
 *
 * The through-line: it never crosses body copy. It stands in the hero's open
 * right-hand space, leaves across the photograph rather than across the type,
 * waits off-canvas while the About sequence owns the screen, returns for the
 * open field beside the package cards, then rises above the viewport and
 * descends to plant itself beside the booking form.
 */
const ROUTE: Waypoint[] = [
  { section: 'hero', at: 0, x: HERO_SEAM, y: 0.5, rotate: 0, scale: 1 },
  { section: 'hero', at: 0.55, x: HERO_SEAM, y: 0.5, rotate: 0, scale: 1 },
  // Exits to the right, over the photograph, so it clears the headline and CTA.
  { section: 'hero', at: 1, x: PARKED, y: 0.5, rotate: 18, scale: 0.9 },
  // Parked off-canvas: About is a pinned sequence with its own motion, and its
  // copy runs the full container width, so there is no lane to travel in.
  { section: 'about', at: 0.92, x: PARKED, y: 0.5, rotate: 18, scale: 0.9 },
  // Services is deep green with open field to the right of the cards.
  { section: 'services', at: 0.42, x: servicesLane, y: 0.5, rotate: 14, scale: 0.74 },
  // Leaves early and climbs, so it is gone before the Gallery header, whose
  // "view the full gallery" link sits in the same right-hand lane.
  { section: 'services', at: 0.8, x: PARKED, y: 0.1, rotate: 16, scale: 0.8 },
  // Crosses above the Gallery rather than over its grid.
  { section: 'gallery', at: 0.2, x: PARKED, y: -0.6, rotate: 10, scale: 0.85 },
  { section: 'gallery', at: 1, x: contactLane, y: -0.6, rotate: 2, scale: 0.9 },
  // Descends and plants upright in the gap between the copy and the form.
  { section: 'contact', at: 0.12, x: contactLane, y: 0.5, rotate: 0, scale: 0.92 },
];

/** Eased blend between waypoints. Nothing on this site moves linearly. */
const smoothstep = (t: number) => t * t * (3 - 2 * t);
const clamp = (v: number) => Math.min(1, Math.max(0, v));

/** Absolute scroll position of each waypoint, recomputed whenever layout changes. */
function resolveRoute() {
  const stops: { at: number; x: number; y: number; rotate: number; scale: number }[] = [];

  for (const point of ROUTE) {
    const el = document.querySelector(SECTIONS[point.section]);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    const top = rect.top + window.pageYOffset;
    const x = typeof point.x === 'function' ? point.x(window.innerWidth) : point.x;
    stops.push({ ...point, x, at: top + point.at * rect.height });
  }

  // Monotonic, so the interpolator can walk it in order.
  return stops.sort((a, b) => a.at - b.at);
}

function sample(stops: ReturnType<typeof resolveRoute>, scroll: number) {
  if (stops.length === 0) return null;
  if (scroll <= stops[0].at) return stops[0];
  const last = stops[stops.length - 1];
  if (scroll >= last.at) return last;

  const index = stops.findIndex((stop, i) => i > 0 && scroll <= stop.at);
  const from = stops[index - 1];
  const to = stops[index];
  const span = to.at - from.at;
  const t = smoothstep(span > 0 ? clamp((scroll - from.at) / span) : 0);
  const mix = (a: number, b: number) => a + (b - a) * t;

  return {
    at: scroll,
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

    let stops = resolveRoute();
    // Section heights move with the viewport, so the route is rebuilt on resize
    // and whenever the layout settles after images load.
    const rebuild = () => {
      stops = resolveRoute();
    };
    const observer = new ResizeObserver(rebuild);
    observer.observe(document.body);

    const unsubscribe = subscribeScroll(() => {
      const outer = anchor.current;
      const inner = object.current;
      if (!outer || !inner) return;

      const at = sample(stops, window.pageYOffset);
      if (!at) return;

      // Position on the outer element and orientation on the inner one, so the
      // rotation pivots on the mace's own centre rather than the viewport.
      outer.style.transform = `translate3d(${(at.x * window.innerWidth).toFixed(1)}px, ${(
        at.y * window.innerHeight
      ).toFixed(1)}px, 0)`;
      inner.style.transform = `translate(-50%, -50%) rotate(${at.rotate.toFixed(2)}deg) scale(${at.scale.toFixed(3)})`;
    });

    return () => {
      observer.disconnect();
      unsubscribe();
    };
  }, []);

  return (
    <div className="lmb-mace" ref={anchor} aria-hidden="true">
      <div className="lmb-mace-object" ref={object}>
        <Cutout name="mace" sizes="150px" />
      </div>
    </div>
  );
}
