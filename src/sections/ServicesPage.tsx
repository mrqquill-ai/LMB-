import { CadenceRule } from '../components/CadenceRule';
import { PackageCard } from '../components/PackageCard';
import { allPackages } from '../data/packages';

const PERFORMANCE_OPTIONS = [
  'Event cheering, parade',
  'Full musical performance',
  'Choir performance',
  'Live, contemporary band',
  'Horns display',
];

export function ServicesPage() {
  return (
    <>
      <section className="lmb-svc-hero lmb-section-deep">
        <div className="lmb-container">
          <div className="lmb-svc-head">
            <div className="lmb-svc-head-main">
              <div className="lmb-eyebrow lmb-eyebrow-dark">Services</div>
              <h1 className="lmb-svc-h1">Formation packages.</h1>
            </div>
            <p className="lmb-lede lmb-lede-on-dark lmb-head-aside">
              Five formations, priced for Lagos. A 50% deposit confirms your booking, the balance is
              due on or before the performance day.
            </p>
          </div>
        </div>
      </section>

      <section className="lmb-svc-packages lmb-section-cream">
        <div className="lmb-container">
          <CadenceRule tone="forest" style={{ marginBottom: 48 }} />

          <div className="lmb-svc-grid">
            {allPackages.map((pkg) => (
              <PackageCard key={pkg.name} variant="full" pkg={pkg} as="h2" />
            ))}
          </div>

          <CadenceRule tone="forest" style={{ margin: '56px 0 40px' }} />

          <div className="lmb-svc-opts">
            <div className="lmb-svc-opts-intro">
              <h2 className="lmb-h3">Performance options</h2>
              <p className="lmb-svc-opts-copy">
                Tell us which of these you need and we shape the set around it.
              </p>
            </div>
            <div className="lmb-svc-opts-list">
              {PERFORMANCE_OPTIONS.map((option) => (
                <span key={option}>{option}</span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
