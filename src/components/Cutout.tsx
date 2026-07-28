import type { CSSProperties } from 'react';
import { photoSizes, type CutoutName } from '../data/photos';

type Props = {
  name: CutoutName;
  /** How wide the cut-out renders at each breakpoint. */
  sizes: string;
  /**
   * Cut-outs are decoration. They carry no alt text and are hidden from
   * assistive technology unless a caller passes one deliberately.
   */
  alt?: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * An instrument cut-out on a real alpha channel. AVIF and WebP with a PNG
 * fallback, never JPEG. Widths come from the build rather than a shared ladder,
 * since these range from a 147px mace to a 1099px trombone.
 */
export function Cutout({ name, sizes, alt, className, style }: Props) {
  const { width, height, widths } = photoSizes.cutouts[name];
  const srcSet = (extension: string) =>
    widths.map((w) => `/assets/cutouts/${name}-${w}.${extension} ${w}w`).join(', ');
  const fallbackWidth = widths[widths.length - 1];

  return (
    <picture>
      <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet('webp')} sizes={sizes} />
      <img
        src={`/assets/cutouts/${name}-${fallbackWidth}.png`}
        srcSet={srcSet('png')}
        sizes={sizes}
        alt={alt ?? ''}
        aria-hidden={alt ? undefined : true}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className={className}
        style={style}
      />
    </picture>
  );
}
