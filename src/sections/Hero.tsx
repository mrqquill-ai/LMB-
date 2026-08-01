import type { CSSProperties, MouseEvent } from 'react';
import { Arrow } from '../components/Arrow';
import { HeroBackdrop } from '../components/HeroBackdrop';
import { fadeIn } from '../lib/motion';
import { scrollToSection } from '../lib/scrollToSection';

type Props = {
  /** Flips true a frame after mount and starts the cadence load-in. */
  play: boolean;
};

const HEADLINE = ['One band.', 'One sound.', 'One voice.'];

/** Each line is counted in by the one before it, roughly a beat apart. */
const LINE_STAGGER = 100;
const LINE_DELAY = 300;

export function Hero({ play }: Props) {
  const jumpTo = (id: string) => (event: MouseEvent) => {
    event.preventDefault();
    scrollToSection(id);
  };

  const dashStyle: CSSProperties = {
    width: play ? '88px' : '0px',
    animation: play ? 'lmb-dash-draw 520ms var(--ease-out-strong) 120ms forwards' : 'none',
  };

  const photoStyle: CSSProperties = {
    transform: play ? 'scale(1)' : 'scale(1.06)',
    animation: play ? 'lmb-photo-settle 1100ms var(--ease-out-strong) 80ms forwards' : 'none',
  };

  return (
    <section className="lmb-hero">
      {/* The photograph is the hero now, not a panel beside it. It is the LCP
          element, so it loads eagerly at high priority and is preloaded in
          index.html with a matching srcset. */}
      <HeroBackdrop
        style={photoStyle}
        alt="The Lagos Musical Band on the parade ground, the band major out front and the drumline and horns ranked behind"
      />
      <div className="lmb-hero-scrim" aria-hidden="true" />

      <div className="lmb-split">
        <div className="lmb-type">
          <div style={{ position: 'relative' }}>
            <div className="lmb-dash" style={dashStyle} aria-hidden="true" />
            <div className="lmb-kicker lmb-fade" style={fadeIn(play, 200)}>
              Lagos State. NYSC Community Development Service.
            </div>
            <h1 className="lmb-h1">
              {HEADLINE.map((line, index) => (
                <div
                  key={line}
                  className="lmb-line"
                  style={{
                    clipPath: play ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)',
                    animation: play
                      ? `lmb-line-reveal 460ms var(--ease-out-strong) ${
                          index * LINE_STAGGER + LINE_DELAY
                        }ms forwards`
                      : 'none',
                  }}
                >
                  {line}
                </div>
              ))}
            </h1>
          </div>

          <div className="lmb-foot">
            <p className="lmb-subhead lmb-fade" style={fadeIn(play, 780)}>
              Drumline, horns and choir for parades, ceremonies and private events across Lagos. Pick
              a formation that fits your space.
            </p>
            <div className="lmb-cta-row lmb-fade" style={fadeIn(play, 900)}>
              <a href="#contact" onClick={jumpTo('contact')} className="lmb-cta-solid">
                Book The Band <Arrow />
              </a>
              <a
                href="#gallery"
                onClick={jumpTo('gallery')}
                className="lmb-link-underline lmb-link-on-dark"
              >
                View Performances
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
