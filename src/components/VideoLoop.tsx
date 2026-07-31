import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../lib/motion';
import type { VideoLoop as Loop } from '../data/videos';

type Props = {
  loop: Loop;
  className?: string;
};

/**
 * A silent looping panel.
 *
 * Three things this has to get right.
 *
 * It never costs anyone bytes they did not ask for: the <video> carries no src
 * until it is close to the viewport, and it stops playing once it leaves, so a
 * reader who scrolls past pays for nothing and a reader who stops is not
 * decoding video off-screen for the rest of their visit.
 *
 * Under prefers-reduced-motion it does not play at all. The poster frame is the
 * content, and the control offers playback rather than pausing it, so the
 * choice to see motion is the reader's.
 *
 * Motion that starts on its own and runs past five seconds needs a way to stop
 * it (WCAG 2.2.2), so the control is always present rather than appearing on
 * hover, which would put it out of reach on a touchscreen.
 */
export function VideoLoop({ loop, className }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const still = prefersReducedMotion();
  /** Latches once the panel has been close enough to be worth fetching. */
  const [near, setNear] = useState(false);
  /** Tracks visibility continuously, so scrolling back resumes playback. */
  const [onScreen, setOnScreen] = useState(false);
  /** The reader's standing wish. Reduced motion starts it off. */
  const [wantsPlay, setWantsPlay] = useState(!still);
  const [playing, setPlaying] = useState(false);

  const poster = `/assets/video/${loop.name}.jpg`;

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true);
        setOnScreen(entry.isIntersecting);
      },
      { rootMargin: '100% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Playback follows visibility and the reader's wish together, rather than
  // firing once on load. Someone who scrolls past and comes back finds it
  // running again, while someone who pressed Pause finds it still paused.
  //
  // play() returns a promise that rejects when a browser refuses autoplay, in a
  // data-saving mode for instance. That is not an error worth surfacing: the
  // panel simply stays on its poster with a control offering playback.
  useEffect(() => {
    const el = video.current;
    if (!el || !near) return;
    let cancelled = false;

    // Asserted on the element rather than trusted to the attribute. React sets
    // muted as a DOM property, and if play() wins that race the browser sees an
    // unmuted autoplay and refuses it.
    el.muted = true;

    if (!onScreen || !wantsPlay) {
      el.pause();
      return;
    }

    el.play().catch(() => {
      // Scrolling quickly flips visibility fast enough that a pause can
      // interrupt a play still in flight, which rejects with AbortError. That
      // is not a refusal, so re-assert once things settle if the intent stands.
      if (cancelled || !el.paused) return;
      el.play().catch(() => setPlaying(false));
    });

    return () => {
      cancelled = true;
    };
  }, [near, onScreen, wantsPlay]);

  const toggle = () => setWantsPlay((wants) => !wants);

  return (
    <div className={`lmb-video${className ? ` ${className}` : ''}`}>
      <video
        ref={video}
        src={near ? `/assets/video/${loop.name}.mp4` : undefined}
        poster={poster}
        width={576}
        height={1024}
        muted
        loop
        playsInline
        preload="none"
        aria-label={loop.description}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button type="button" className="lmb-video-toggle" onClick={toggle} aria-pressed={playing}>
        {playing ? 'Pause' : 'Play'}
      </button>
    </div>
  );
}
