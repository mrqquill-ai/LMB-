import sizeData from './imageSizes.json';

/**
 * Intrinsic dimensions and the width ladder, written by `npm run images`.
 * Adding a photograph to `assets-src/photos/` and re-running that script widens
 * `PhotoName` automatically.
 */
export const photoSizes = sizeData;

export type PhotoName = keyof typeof sizeData.photos;
