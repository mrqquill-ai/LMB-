import sizeData from './imageSizes.json';

/**
 * Intrinsic dimensions and width ladders, written by `npm run images`.
 * Adding an asset to `assets-src/` and re-running that script widens these
 * types automatically.
 */
export const photoSizes = sizeData;

export type PhotoName = keyof typeof sizeData.photos;
export type CutoutName = keyof typeof sizeData.cutouts;
