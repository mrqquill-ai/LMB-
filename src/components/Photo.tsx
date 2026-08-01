import { forwardRef, type CSSProperties } from 'react';
import { photoSizes, type PhotoName } from '../data/photos';

type Props = {
  /** Base filename in public/assets/photos, without width or extension. */
  name: PhotoName;
  alt: string;
  /** How wide the image renders at each breakpoint, so the browser can choose. */
  sizes: string;
  /** Set on the hero only: loads eagerly at high priority as the LCP element. */
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * Built from the widths actually written for this photograph, not the global
 * ladder. A source narrower than the top rung never gets that rung, and naming
 * it anyway hands the densest screens a candidate that 404s.
 */
const srcSet = (name: PhotoName, extension: string) =>
  photoSizes.photos[name].widths
    .map((width) => `/assets/photos/${name}-${width}.${extension} ${width}w`)
    .join(', ');

/**
 * Serves AVIF, then WebP, then a JPEG fallback, at four widths each. The
 * intrinsic dimensions come from the build so the box is reserved before the
 * bytes land.
 */
export const Photo = forwardRef<HTMLImageElement, Props>(function Photo(
  { name, alt, sizes, priority = false, className, style },
  ref,
) {
  const { width, height, widths } = photoSizes.photos[name];
  const fallbackWidth = widths[widths.length - 1];

  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(name, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(name, 'webp')} sizes={sizes} />
      <img
        ref={ref}
        src={`/assets/photos/${name}-${fallbackWidth}.jpg`}
        srcSet={srcSet(name, 'jpg')}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
        className={className}
        style={style}
      />
    </picture>
  );
});

type LogoProps = {
  className?: string;
  alt?: string;
};

/** The crest never renders above 135 CSS px, so one 320w derivative covers it. */
export function Logo({ className, alt = 'Lagos Musical Band' }: LogoProps) {
  return (
    <picture>
      <source type="image/webp" srcSet="/assets/logos/lmb-logo-white-320.webp" />
      <img
        src="/assets/logos/lmb-logo-white-320.png"
        alt={alt}
        width={photoSizes.logo.width}
        height={photoSizes.logo.height}
        className={className}
      />
    </picture>
  );
}
