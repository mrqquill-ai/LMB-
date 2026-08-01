import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../lib/motion';
import type { BandVideo } from '../data/videos';

type Props = {
  video: BandVideo;
  /**
   * Whether this panel is the one currently on show. The About sequence keeps
   * both arms mounted and stacked, so visibility cannot be read from the
   * viewport and has to be told.
   */
  active?: boolean;
  className?: string;
};

/**
 * A looping panel of the band, silent until asked otherwise.
 *
 * On sound: no browser will autoplay audio. Chrome, Safari and Firefox all
 * require a gesture first, so the clip starts muted and the control below turns
 * sound on. That is a platform rule, not a preference.
 *
 * It costs nothing until it is wanted: no src until the panel is close to the
 * viewport, and it stops once it is neither visible nor active. Under
 * prefers-reduced-motion it does not start at all and the control offers
 * playback rather than pausing it.
 *
 * Motion that starts on its own and runs past five seconds needs a way to stop
 * it (WCAG 2.2.2), so the controls are always present rather than shown on
 * hover, which a touchscreen cannot reach.
 */
export function VideoLoop({ video, active = true, className }: Props) {
  const el = useRef<HTMLVideoElement>(null);
  const still = prefersReducedMotion();
  /** Latches once the panel has been close enough to be worth fetching. */
  const [near, setNear] = useState(false);
  /** Tracks visibility continuously, so scrolling back resumes playback. */
  const [onScreen, setOnScreen] = useState(false);
  /** The reader's standing wish. Reduced motion starts it off. */
  const [wantsPlay, setWantsPlay] = useState(!still);
  const [sound, setSound] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true);
        setOnScreen(entry.isIntersecting);
      },
      { rootMargin: '100% 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Playback follows visibility, whether this arm is on show, and the reader's
  // wish, all together, rather than firing once on load. Scrolling past and
  // back resumes it; an explicit Pause is remembered.
  useEffect(() => {
    const node = el.current;
    if (!node || !near) return;
    let cancelled = false;

    if (!onScreen || !active || !wantsPlay) {
      node.pause();
      return;
    }

    node.play().catch(() => {
      // Flipping visibility quickly can interrupt a play still in flight, which
      // rejects with AbortError. That is not a refusal, so re-assert if the
      // intent still stands.
      if (cancelled || !node.paused) return;
      node.play().catch(() => setPlaying(false));
    });

    return () => {
      cancelled = true;
    };
  }, [near, onScreen, active, wantsPlay]);

  // Set on the element rather than trusted to the attribute: React applies
  // muted as a DOM property, and losing that race reads to the browser as an
  // unmuted autoplay, which it refuses. An arm that is not on show is silent
  // regardless, so the two clips can never talk over one another.
  useEffect(() => {
    const node = el.current;
    if (!node) return;
    node.muted = !sound || !active;

    // A browser that allowed this clip only because it was silent will stop it
    // the moment it gains a voice. The tap that asked for sound is itself the
    // permission to carry on, so ask again. If it is still refused, drop back to
    // silence rather than leaving a control claiming sound that is not playing.
    if (sound && active && wantsPlay && node.paused) {
      node.play().catch(() => setSound(false));
    }
  }, [sound, active, wantsPlay]);

  // Handing over to the other arm drops the sound, so it does not resume
  // unannounced when this one comes back around.
  useEffect(() => {
    if (!active) setSound(false);
  }, [active]);

  return (
    <div className={`lmb-video${className ? ` ${className}` : ''}`}>
      <video
        ref={el}
        src={near ? `/assets/video/${video.name}.mp4` : undefined}
        poster={`/assets/video/${video.name}.jpg`}
        width={576}
        height={1024}
        muted
        loop
        playsInline
        preload="none"
        aria-label={video.description}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Only the arm on show carries controls. The two arms are stacked at the
          same coordinates, so leaving them on the hidden one puts an invisible
          set of buttons over the visible one and swallows its clicks. */}
      <div className="lmb-video-controls" hidden={!active}>
        <button
          type="button"
          className="lmb-video-btn"
          onClick={() => setSound((on) => !on)}
          aria-pressed={sound}
        >
          {sound ? 'Sound on' : 'Sound off'}
        </button>
        <button
          type="button"
          className="lmb-video-btn"
          onClick={() => setWantsPlay((wants) => !wants)}
          aria-pressed={playing}
        >
          {playing ? 'Pause' : 'Play'}
        </button>
      </div>
    </div>
  );
}
