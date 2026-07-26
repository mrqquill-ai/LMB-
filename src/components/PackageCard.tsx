import type { Package } from '../data/packages';

type Props = {
  /** `preview` is the three-up on Home, `full` is the five-up on Services. */
  variant: 'preview' | 'full';
  pkg: Package;
  /** Heading level, so the Services page keeps a single h1 above its cards. */
  as?: 'h2' | 'h3';
};

export function PackageCard({ variant, pkg, as: Heading = 'h3' }: Props) {
  const tone = pkg.featured ? 'lmb-card-featured' : 'lmb-card-plain';

  return (
    <div className={`lmb-card lmb-card-${variant} ${tone}`}>
      <div className="lmb-card-head">
        <Heading className="lmb-card-name">{pkg.name}</Heading>
        <div className="lmb-card-meta">{pkg.instruments}</div>
      </div>

      {/* Neither Big Shoulders Display nor IBM Plex Sans carries the naira sign,
          so the unit is set as a word in the meta style rather than falling back
          to a system glyph beside the condensed numerals. */}
      <p className="lmb-card-price">
        <span className="lmb-card-currency">NGN</span>
        <span className="lmb-card-figure">{pkg.price}</span>
      </p>

      <p className="lmb-card-note">{pkg.note}</p>

      {variant === 'full' && pkg.terms && pkg.terms.length > 0 && (
        <ul className="lmb-card-terms">
          {pkg.terms.map((term) => (
            <li key={term}>
              <span className="lmb-beat" aria-hidden="true" />
              {term}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
