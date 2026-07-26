import type { MouseEvent } from 'react';
import { CadenceRule } from '../components/CadenceRule';
import { PackageCard } from '../components/PackageCard';
import { previewPackages } from '../data/packages';
import type { Navigate } from '../lib/useRoute';

type Props = {
  navigate: Navigate;
};

/** Three of the five formations, on the Home page, ahead of the Services route. */
export function ServicesPreview({ navigate }: Props) {
  const goServices = (event: MouseEvent) => {
    event.preventDefault();
    navigate('services', true);
  };

  return (
    <section id="services" className="lmb-section lmb-section-deep">
      <div className="lmb-container">
        <CadenceRule tone="gold" style={{ marginBottom: 40 }} />

        <div className="lmb-section-head" style={{ marginBottom: 56 }}>
          <div className="lmb-head-main">
            <div className="lmb-eyebrow lmb-eyebrow-dark">Formations</div>
            <h2 className="lmb-h2 lmb-h2-on-dark lmb-measure-14">Pick the size of the sound.</h2>
          </div>
          <div className="lmb-head-aside-stack">
            <p className="lmb-lede lmb-lede-on-dark">
              Three of the five packages, priced for Lagos. A 50% deposit confirms the date, the
              balance is due on or before the performance day.
            </p>
            <a
              href="#/services"
              onClick={goServices}
              className="lmb-link-underline lmb-link-on-dark-strong"
            >
              See all five packages
            </a>
          </div>
        </div>

        <div className="lmb-packages">
          {previewPackages.map((pkg) => (
            <PackageCard key={pkg.name} variant="preview" pkg={pkg} />
          ))}
        </div>

        <div className="lmb-packages-note">
          Transport and logistics within Lagos are included. Performances outside Lagos attract
          travel and accommodation costs.
        </div>
      </div>
    </section>
  );
}
