import { useEffect, useRef } from 'react';
import { Cutout } from '../components/Cutout';
import { Photo } from '../components/Photo';
import { choirPhoto } from '../data/content';
import { prefersReducedMotion } from '../lib/motion';
import { subscribeScroll } from '../lib/scroll';

/** The stage holds one arm at a time, so the image gets the full viewport. */
const ARM_SIZES = '(max-width: 900px) 100vw, 46vw';

/** Scroll progress through the section at which one arm hands over to the next. */
const HANDOVER_FROM = 0.38;
const HANDOVER_TO = 0.64;
/** Vertical drift inside each frame, in pixels. */
const PARALLAX = 70;

const smoothstep = (t: number) => t * t * (3 - 2 * t);
const clamp = (v: number) => Math.min(1, Math.max(0, v));

export function About() {
  const section = useRef<HTMLElement>(null);
  const media = useRef<(HTMLDivElement | null)[]>([]);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const copies = useRef<(HTMLDivElement | null)[]>([]);
  const beats = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    return subscribeScroll(() => {
      const el = section.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      if (travel <= 0) return;
      const progress = clamp(-rect.top / travel);

      // The handover: Choir wipes in over Brigade, left to right, the same
      // direction the hero headline reveals.
      const t = smoothstep(clamp((progress - HANDOVER_FROM) / (HANDOVER_TO - HANDOVER_FROM)));

      const incoming = panels.current[1];
      if (incoming) incoming.style.clipPath = `inset(0 ${((1 - t) * 100).toFixed(2)}% 0 0)`;

      // Each image drifts through its own frame, and warps as it hands over.
      const drift = [progress * PARALLAX - PARALLAX * 0.5, (progress - 0.5) * PARALLAX];
      const zoom = [1 + t * 0.09, 0.93 + t * 0.07];
      media.current.forEach((frame, i) => {
        if (frame) {
          frame.style.transform = `translate3d(0, ${drift[i].toFixed(1)}px, 0) scale(${zoom[i].toFixed(3)})`;
        }
      });

      // Copy crosses over a beat behind the image, not alongside it.
      const copyOut = clamp(1 - t * 1.6);
      const copyIn = clamp((t - 0.35) / 0.65);
      [copyOut, copyIn].forEach((value, i) => {
        const copy = copies.current[i];
        if (copy) {
          copy.style.opacity = String(value);
          copy.style.transform = `translate3d(0, ${((1 - value) * 18).toFixed(1)}px, 0)`;
        }
      });

      beats.current.forEach((beat, i) => {
        if (beat) beat.classList.toggle('lmb-beat-on', i === 0 ? t < 0.5 : t >= 0.5);
      });
    });
  }, []);

  const setRef =
    (store: React.MutableRefObject<(never | null)[] | (HTMLElement | null)[]>, index: number) =>
    (node: HTMLElement | null) => {
      (store.current as (HTMLElement | null)[])[index] = node;
    };

  return (
    <section id="about" className="lmb-arms-seq lmb-section-cream" ref={section}>
      <Cutout name="cymbals" className="lmb-static lmb-static-cymbals" sizes="(max-width: 900px) 180px, 300px" />

      <div className="lmb-arms-stage">
        <div className="lmb-arms-label">
          <div className="lmb-eyebrow lmb-eyebrow-forest">What we are</div>
          <h2 className="lmb-h2 lmb-arms-title">Two arms. One formation.</h2>
        </div>

        <div className="lmb-arm-stage" ref={setRef(panels, 0) as never}>
          <div className="lmb-arm-media">
            <div className="lmb-arm-media-inner" ref={setRef(media, 0) as never}>
              <Photo
                name="bandmajor-mace"
                sizes={ARM_SIZES}
                alt="Band major of the Lagos Musical Band holding the mace, drumline behind"
              />
            </div>
          </div>
          <div className="lmb-arm-copy" ref={setRef(copies, 0) as never}>
            <div className="lmb-arm-title-row">
              <h3 className="lmb-h3">Brigade</h3>
              <span className="lmb-arm-meta">Drums and horns</span>
            </div>
            <p className="lmb-arm-copy-text">
              Snares, bass, cymbals and brass, led by the mace. Percussive and loud enough to carry a
              street. Built for parades, processions and matriculation marches.
            </p>
          </div>
        </div>

        {/* Second in the DOM so it reads after Brigade, and on top so it can wipe
            in over it. Ordering it visually with CSS would leave the reading
            order wrong for a screen reader. */}
        <div className="lmb-arm-stage lmb-arm-stage-over" ref={setRef(panels, 1) as never}>
          <div className="lmb-arm-media">
            <div className="lmb-arm-media-inner" ref={setRef(media, 1) as never}>
              {choirPhoto ? (
                <Photo name={choirPhoto.name} sizes={ARM_SIZES} alt={choirPhoto.alt} />
              ) : (
                <div className="lmb-arm-panel" aria-hidden="true">
                  <span className="lmb-arm-panel-word">Choir</span>
                  <span className="lmb-arm-panel-rule" />
                </div>
              )}
            </div>
          </div>
          <div className="lmb-arm-copy" ref={setRef(copies, 1) as never}>
            <div className="lmb-arm-title-row">
              <h3 className="lmb-h3">Choir</h3>
              <span className="lmb-arm-meta">Voices and strings</span>
            </div>
            <p className="lmb-arm-copy-text">
              Open, sustained singing with or without instrumental backing. Suited to church
              services, memorials, weddings and indoor ceremonies.
            </p>
          </div>
        </div>

        <div className="lmb-arms-beats" aria-hidden="true">
          <span className="lmb-arms-beat lmb-beat-on" ref={setRef(beats, 0) as never} />
          <span className="lmb-arms-beat" ref={setRef(beats, 1) as never} />
        </div>
      </div>
    </section>
  );
}
