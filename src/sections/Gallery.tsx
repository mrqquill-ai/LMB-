import { CadenceRule } from '../components/CadenceRule';
import { Photo } from '../components/Photo';
import { testimonial } from '../data/content';
import { useParallax } from '../lib/useParallax';

const EVENTS = [
  'Parades',
  'Matriculation marches',
  'Church services',
  'Weddings',
  'Memorials',
  'Corporate events',
];

export function Gallery() {
  const assembly = useParallax(56);
  const snare = useParallax(40);

  return (
    <section id="gallery" className="lmb-section lmb-section-cream">
      <div className="lmb-container">
        <CadenceRule tone="forest" style={{ marginBottom: 40 }} />

        <div className="lmb-section-head" style={{ marginBottom: 56 }}>
          <div className="lmb-head-main">
            <div className="lmb-eyebrow lmb-eyebrow-forest">Past performances</div>
            <h2 className="lmb-h2 lmb-measure-14">See us on the street.</h2>
          </div>
          <a href="#gallery" className="lmb-link-underline lmb-link-on-cream">
            View the full gallery
          </a>
        </div>

        <div className="lmb-proof">
          <div className="lmb-proof-lead" ref={assembly.frameRef}>
            <Photo
              ref={assembly.imageRef}
              name="assembly-wide"
              sizes="(max-width: 900px) 100vw, 56vw"
              alt="The Lagos Musical Band assembled on the parade ground with drums, horns and cymbals"
            />
          </div>

          {/* With no client quote yet the snare photograph takes the whole
              column rather than sitting above an empty card. */}
          <div className={`lmb-proof-side${testimonial ? '' : ' lmb-proof-side-single'}`}>
            <div className="lmb-proof-snare" ref={snare.frameRef}>
              <Photo
                ref={snare.imageRef}
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

        <div className="lmb-events">
          {EVENTS.map((event) => (
            <span key={event}>{event}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
