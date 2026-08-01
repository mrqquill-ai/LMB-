import type { CSSProperties } from 'react';
import { photoSizes } from '../data/photos';

type Props = {
  alt: string;
  style?: CSSProperties;
};

const WIDE = 'parade-wide';
const TALL = 'hero-mace-tall';

/** Below this the hero is taller than it is wide and needs the upright crop. */
const TALL_MEDIA = '(max-width: 900px)';

/** Per crop, since the two are not the same size and do not get the same rungs. */
const srcSet = (name: keyof typeof photoSizes.photos, extension: string) =>
  photoSizes.photos[name].widths
    .map((w) => `/assets/photos/${name}-${w}.${extension} ${w}w`)
    .join(', ');

/**
 * The hero photograph, art directed.
 *
 * One frame cannot do both shapes. The parade shot is 4:3, and cover-cropping
 * that into a 390 by 844 phone viewport keeps barely a third of its width: the
 * formation disappears and what is left is sky and a mace pole. The upright
 * slot therefore holds a photograph composed vertically rather than a crop of a
 * horizontal one: the band major with the mace raised, which leads the eye up
 * the frame the way a tall viewport wants.
 *
 * Written as an explicit <picture> rather than through the shared Photo
 * component because the browser must pick exactly one of the two. Rendering
 * both and hiding one in CSS would still fetch both, and this is the LCP image.
 */
export function HeroBackdrop({ alt, style }: Props) {
  const { width, height, widths } = photoSizes.photos[WIDE];
  const fallbackWidth = widths[widths.length - 1];

  return (
    <picture>
      <source media={TALL_MEDIA} type="image/avif" srcSet={srcSet(TALL, 'avif')} sizes="100vw" />
      <source media={TALL_MEDIA} type="image/webp" srcSet={srcSet(TALL, 'webp')} sizes="100vw" />
      <source media={TALL_MEDIA} srcSet={srcSet(TALL, 'jpg')} sizes="100vw" />
      <source type="image/avif" srcSet={srcSet(WIDE, 'avif')} sizes="100vw" />
      <source type="image/webp" srcSet={srcSet(WIDE, 'webp')} sizes="100vw" />
      <img
        className="lmb-hero-bg"
        src={`/assets/photos/${WIDE}-${fallbackWidth}.jpg`}
        srcSet={srcSet(WIDE, 'jpg')}
        sizes="100vw"
        alt={alt}
        width={width}
        height={height}
        loading="eager"
        fetchPriority="high"
        decoding="sync"
        style={style}
      />
    </picture>
  );
}
