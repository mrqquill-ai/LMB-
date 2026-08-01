import { CadenceRule } from '../components/CadenceRule';
import { Cutout } from '../components/Cutout';
import { Photo } from '../components/Photo';
import { testimonial } from '../data/content';
import { scrollToSection } from '../lib/scrollToSection';
import type { PhotoName } from '../data/photos';

/**
 * The band's own photography from the Lagos camp parades.
 *
 * Ordered for rhythm rather than by section of the band: no two neighbouring
 * frames share an instrument, and the wide frame leads so the grid opens on
 * the whole formation before it starts picking out players.
 */
const FRAMES: { name: PhotoName; alt: string; wide?: boolean }[] = [
  {
    name: 'parade-wide',
    alt: 'The band on the march behind its mace bearer, instruments raised against an open sky',
    wide: true,
  },
  { name: 'mace-bearer', alt: 'The band major carrying the mace, its tassels catching the light' },
  { name: 'snare-smiling', alt: 'Snare drummer of the Lagos Musical Band resting between numbers' },
  { name: 'bassdrum-tilt', alt: 'Bass drummer with the drum tilted across the shoulder' },
  { name: 'trumpet-raised', alt: 'Trumpeter playing with the bell raised' },
  { name: 'sax-lead', alt: 'Saxophonist at the head of the reed line' },
  { name: 'cymbals', alt: 'Cymbal player mid-crash on the parade ground' },
  { name: 'snare-strike', alt: 'Snare drummer mid-strike, sticks crossed over the head' },
  { name: 'trumpet-blue', alt: 'Trumpeter playing a blue lacquered horn' },
  { name: 'sousaphone', alt: 'Sousaphone player carrying the bass line through the formation' },
  { name: 'bassdrum-portrait', alt: 'Bass drummer of the Lagos Musical Band, beater in hand' },
  { name: 'sax-line', alt: 'Saxophonist playing with the rest of the band ranked behind' },
  { name: 'trumpet-portrait', alt: 'Trumpeter of the Lagos Musical Band on the march' },
];

const EVENTS = [
  'Parades',
  'Matriculation marches',
  'Church services',
  'Weddings',
  'Memorials',
  'Corporate events',
];

export function Gallery() {
  return (
    <section id="gallery" className="lmb-section lmb-section-cream">
      <Cutout name="drumsticks" className="lmb-static lmb-static-drumsticks" sizes="(max-width: 900px) 120px, 200px" />

      <div className="lmb-container">
        <CadenceRule tone="forest" style={{ marginBottom: 40 }} />

        <div className="lmb-section-head" style={{ marginBottom: 56 }}>
          <div className="lmb-head-main">
            <div className="lmb-eyebrow lmb-eyebrow-forest">Past performances</div>
            <h2 className="lmb-h2 lmb-measure-14">See us on the street.</h2>
          </div>
          {/* Jumps past the lead pair to the grid. Handled in JS rather than
              left as a bare fragment link: a raw href would overwrite the route
              hash and leave a history entry that sends the back button to the
              top of the page. */}
          <a
            href="#frames"
            onClick={(event) => {
              event.preventDefault();
              scrollToSection('frames');
            }}
            className="lmb-link-underline lmb-link-on-cream"
          >
            View the full gallery
          </a>
        </div>

        <div className="lmb-proof">
          <div className="lmb-proof-lead">
            <Photo
              name="assembly-wide"
              sizes="(max-width: 900px) 100vw, 56vw"
              alt="The Lagos Musical Band assembled on the parade ground with drums, horns and cymbals"
            />
          </div>

          {/* With no client quote yet the snare photograph takes the whole
              column rather than sitting above an empty card. */}
          <div className={`lmb-proof-side${testimonial ? '' : ' lmb-proof-side-single'}`}>
            <div className="lmb-proof-snare">
              <Photo
                name="snare-player"
                sizes="(max-width: 900px) 100vw, 40vw"
                alt="Snare drummer of the Lagos Musical Band, sticks resting on the head"
              />
            </div>
            {testimonial && (
              <figure className="lmb-quote-card">
                <blockquote>{testimonial.quote}</blockquote>
                <figcaption className="lmb-quote-attribution">
                  {testimonial.name}
                  <br />
                  {testimonial.event}, {testimonial.year}
                </figcaption>
              </figure>
            )}
          </div>
        </div>

        <div className="lmb-frames" id="frames">
          {FRAMES.map((frame) => (
            <figure
              key={frame.name}
              className={`lmb-frame${frame.wide ? ' lmb-frame-wide' : ''}`}
            >
              <Photo
                name={frame.name}
                sizes={
                  frame.wide
                    ? '(max-width: 700px) 100vw, (max-width: 1100px) 66vw, 50vw'
                    : '(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw'
                }
                alt={frame.alt}
              />
            </figure>
          ))}
        </div>


        <div className="lmb-events">
          {EVENTS.map((event) => (
            <span key={event}>{event}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
