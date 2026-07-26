/**
 * One passive scroll listener, one animation frame per scroll tick, shared by
 * every subscriber. The nav shrink and the photograph parallax both hang off
 * this so scrolling never schedules more than a single frame of work.
 */

type Listener = () => void;

const listeners = new Set<Listener>();
let frame = 0;

function flush() {
  frame = 0;
  listeners.forEach((listener) => listener());
}

function onScroll() {
  if (frame) return;
  frame = requestAnimationFrame(flush);
}

/** Subscribes to scroll and runs the listener once immediately. Returns an unsubscribe. */
export function subscribeScroll(listener: Listener): () => void {
  if (listeners.size === 0) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  }
  listeners.add(listener);
  listener();

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    }
  };
}
