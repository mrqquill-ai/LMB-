import type { CSSProperties } from 'react';

type Props = {
  tone: 'gold' | 'forest';
  style?: CSSProperties;
};

/**
 * The dashed drumline rule that stands in for every hairline divider on the
 * site. Gold on the deep-green sections, forest green on cream.
 */
export function CadenceRule({ tone, style }: Props) {
  return <div className={`lmb-rule lmb-rule-${tone}`} style={style} aria-hidden="true" />;
}
