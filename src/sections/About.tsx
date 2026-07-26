import { CadenceRule } from '../components/CadenceRule';
import { choirPhoto } from '../data/content';
import { useParallax } from '../lib/useParallax';

export function About() {
  const bandMajorRef = useParallax(48);
  const choirRef = useParallax(48);

  return (
    <section id="about" className="lmb-section lmb-section-cream">
      <div className="lmb-container">
        <CadenceRule tone="forest" style={{ marginBottom: 40 }} />

        <div className="lmb-section-head" style={{ marginBottom: 64 }}>
          <div className="lmb-head-main">
            <div className="lmb-eyebrow lmb-eyebrow-forest">What we are</div>
            <h2 className="lmb-h2 lmb-measure-12">Two arms. One formation.</h2>
          </div>
          <p className="lmb-lede lmb-lede-on-cream lmb-head-aside">
            The band works in two arms. Book either on its own, or both together for a full ceremony.
          </p>
        </div>

        <div className="lmb-arms">
          <div className="lmb-arm">
            <div className="lmb-arm-frame">
              <img
                ref={bandMajorRef}
                src="/assets/photos/bandmajor-mace.jpg"
                alt="Band major of the Lagos Musical Band holding the mace, drumline behind"
              />
            </div>
            <div>
              <div className="lmb-arm-title-row">
                <h3 className="lmb-h3">Brigade</h3>
                <span className="lmb-arm-meta">Drums and horns</span>
              </div>
              <p className="lmb-arm-copy">
                Snares, bass, cymbals and brass, led by the mace. Percussive and loud enough to carry
                a street. Built for parades, processions and matriculation marches.
              </p>
            </div>
          </div>

          <div className="lmb-arms-rule" aria-hidden="true" />

          <div className="lmb-arm">
            {choirPhoto ? (
              <div className="lmb-arm-frame">
                <img ref={choirRef} src={choirPhoto.src} alt={choirPhoto.alt} />
              </div>
            ) : (
              // Until the band supplies choir photography this panel carries the
              // arm's name in the display face rather than a note about what is
              // missing. Drop a photo into data/content.ts and it swaps out.
              <div className="lmb-arm-panel" aria-hidden="true">
                <span className="lmb-arm-panel-word">Choir</span>
                <span className="lmb-arm-panel-rule" />
              </div>
            )}
            <div>
              <div className="lmb-arm-title-row">
                <h3 className="lmb-h3">Choir</h3>
                <span className="lmb-arm-meta">Voices and strings</span>
              </div>
              <p className="lmb-arm-copy">
                Open, sustained singing with or without instrumental backing. Suited to church
                services, memorials, weddings and indoor ceremonies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
