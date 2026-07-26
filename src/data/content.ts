import type { PhotoName } from './photos';

/**
 * Content the band has not supplied yet. Each slot renders only once it is
 * filled; nothing on the page announces its own absence to a visitor.
 */

/**
 * Choir performance photograph. Only brigade photography exists so far.
 *
 * To add it: drop the original into `assets-src/photos/`, run `npm run images`,
 * then set `name` to the filename without its extension.
 */
export const choirPhoto: { name: PhotoName; alt: string } | null = null;

/** A real client quote. The Gallery testimonial card appears only with one set. */
export const testimonial: { quote: string; name: string; event: string; year: string } | null = null;
