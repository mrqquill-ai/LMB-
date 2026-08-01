/**
 * Turns the band's original photography in assets-src/ into the derivatives the
 * site actually serves: AVIF, WebP and a JPEG fallback at four widths each.
 *
 * The originals are 1920x2560 phone portraits, roughly 3x more pixels than any
 * slot renders. They stay out of public/ so they are never shipped.
 *
 *   npm run images
 */
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import sharp from 'sharp';

const SRC_PHOTOS = 'assets-src/photos';
const SRC_LOGOS = 'assets-src/logos';
const SRC_CUTOUTS = 'assets-src/cutouts';
const OUT_PHOTOS = 'public/assets/photos';
const OUT_LOGOS = 'public/assets/logos';
const OUT_SOCIAL = 'public/assets/social';
const OUT_CUTOUTS = 'public/assets/cutouts';

/** Covers 1x and 2x for every slot on the page, from a 390px phone up to 1440. */
const WIDTHS = [480, 720, 1080, 1440];

/** The open graph card. Cropped from the widest photograph the band has. */
const SOCIAL_SOURCE = 'assembly-wide.jpg';
const SOCIAL_SIZE = { width: 1200, height: 630 };

const QUALITY = { avif: 55, webp: 76, jpeg: 80 };

const kb = (bytes) => `${(bytes / 1024).toFixed(0)}kB`;

async function emptyDir(dir) {
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
}

async function buildPhoto(file) {
  const name = basename(file, extname(file));
  const image = sharp(join(SRC_PHOTOS, file));
  const { width, height } = await image.metadata();
  let total = 0;
  // Only the widths at or under the source. Anything wider is never written, so
  // it must never be advertised either: a candidate in a srcset that 404s is a
  // broken image on exactly the densest screens, which are the ones that reach
  // for it.
  const widths = WIDTHS.filter((w) => w <= width);

  for (const target of widths) {
    const resized = sharp(join(SRC_PHOTOS, file)).resize({ width: target, withoutEnlargement: true });

    for (const [format, options] of [
      ['avif', { quality: QUALITY.avif }],
      ['webp', { quality: QUALITY.webp }],
      ['jpg', { quality: QUALITY.jpeg, mozjpeg: true }],
    ]) {
      const out = join(OUT_PHOTOS, `${name}-${target}.${format}`);
      const info = await resized
        .clone()
        [format === 'jpg' ? 'jpeg' : format](options)
        .toFile(out);
      total += info.size;
    }
  }

  console.log(`  ${name.padEnd(20)} ${width}x${height} -> ${widths.join('/')}w, ${kb(total)}`);
  return { name, width, height, widths };
}

/** Alpha at or below this is invisible on screen but still reads as coverage. */
const ALPHA_FLOOR = 16;
/** An edge line below this alpha is an artifact, not artwork. */
const EDGE_ARTIFACT_MAX = 128;

/**
 * Strips the faint 1px frame baked into the outermost rows and columns of the
 * crest. Every edge line is fully populated at alpha 67 to 88, which is why the
 * logo rendered inside a visible rectangle. Walks inward while an edge is fully
 * covered but too faint to be artwork.
 */
function clearEdgeArtifacts(data, width, height) {
  const alpha = (x, y) => data[(y * width + x) * 4 + 3];
  const clear = (x, y) => {
    data[(y * width + x) * 4 + 3] = 0;
  };

  let cleared = 0;
  const scan = (coords) => {
    let max = 0;
    let covered = 0;
    for (const [x, y] of coords) {
      const a = alpha(x, y);
      if (a > max) max = a;
      if (a > 0) covered++;
    }
    if (covered !== coords.length || max > EDGE_ARTIFACT_MAX) return false;
    for (const [x, y] of coords) clear(x, y);
    cleared += coords.length;
    return true;
  };

  const row = (y) => Array.from({ length: width }, (_, x) => [x, y]);
  const col = (x) => Array.from({ length: height }, (_, y) => [x, y]);

  for (let y = 0; y < height && scan(row(y)); y++);
  for (let y = height - 1; y >= 0 && scan(row(y)); y--);
  for (let x = 0; x < width && scan(col(x)); x++);
  for (let x = width - 1; x >= 0 && scan(col(x)); x--);

  return cleared;
}

/**
 * The crest also carries a haze of near-transparent pixels across its bitmap,
 * roughly 13,000 at alpha 2 to 13. Invisible to the eye, but anything reading
 * the alpha channel sees them. Both cleanups keep the shipped asset honest
 * about its own silhouette.
 */
async function buildLogo() {
  const src = join(SRC_LOGOS, 'lmb-logo-white.png');
  const { width, height } = await sharp(src).metadata();

  const original = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const edgePixels = clearEdgeArtifacts(original.data, original.info.width, original.info.height);

  // Floored after the resize: downscaling interpolates the haze back in.
  const { data, info } = await sharp(original.data, {
    raw: { width: original.info.width, height: original.info.height, channels: 4 },
  })
    .resize({ width: 320, withoutEnlargement: true })
    .raw()
    .toBuffer({ resolveWithObject: true });

  let cleared = edgePixels;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > 0 && data[i] <= ALPHA_FLOOR) {
      data[i] = 0;
      cleared++;
    }
  }

  const cleaned = sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  });

  let total = 0;
  // The logo never renders above 135 CSS px, so 320 covers it at 2x.
  for (const format of ['webp', 'png']) {
    const out = await cleaned
      .clone()
      [format]({ quality: 90 })
      .toFile(join(OUT_LOGOS, `lmb-logo-white-320.${format}`));
    total += out.size;
  }

  console.log(
    `  ${'lmb-logo-white'.padEnd(20)} ${width}x${height} -> 320w, ${kb(total)}, ${cleared} haze pixels cleared`,
  );
  return { width, height };
}

/**
 * Cut-outs keep an alpha channel, so they ship as AVIF and WebP with a PNG
 * fallback and never a JPEG. Their widths come from the source rather than the
 * shared ladder: a mace is 157px wide and a trombone 1099px, so a fixed ladder
 * would either upscale or skip them entirely.
 */
async function buildCutout(file) {
  const name = basename(file, extname(file));
  const src = join(SRC_CUTOUTS, file);
  const { width, height } = await sharp(src).metadata();

  const widths = [...new Set([width, Math.round(width * 0.6)])]
    .filter((w) => w >= 160)
    .sort((a, b) => a - b);
  if (widths.length === 0) widths.push(width);

  let total = 0;
  for (const target of widths) {
    const resized = sharp(src).resize({ width: target, withoutEnlargement: true });
    for (const [format, options] of [
      ['avif', { quality: QUALITY.avif }],
      ['webp', { quality: QUALITY.webp, alphaQuality: 90 }],
      ['png', { compressionLevel: 9 }],
    ]) {
      const out = await resized.clone()[format](options).toFile(
        join(OUT_CUTOUTS, `${name}-${target}.${format}`),
      );
      total += out.size;
    }
  }

  console.log(`  ${name.padEnd(20)} ${width}x${height} -> ${widths.join('/')}w, ${kb(total)}`);
  return { name, width, height, widths };
}

async function buildSocialCard() {
  const info = await sharp(join(SRC_PHOTOS, SOCIAL_SOURCE))
    // The source is a portrait phone photo, so let sharp pick the band of the
    // frame carrying the most detail rather than centre-cropping the sky.
    .resize({ ...SOCIAL_SIZE, fit: 'cover', position: sharp.strategy.attention })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(join(OUT_SOCIAL, 'share-card.jpg'));

  console.log(`  ${'share-card'.padEnd(20)} 1200x630, ${kb(info.size)}`);
}

const [photoFiles, cutoutFiles] = await Promise.all([
  readdir(SRC_PHOTOS),
  readdir(SRC_CUTOUTS).catch(() => []),
  emptyDir(OUT_PHOTOS)
    .then(() => Promise.all([emptyDir(OUT_LOGOS), emptyDir(OUT_SOCIAL), emptyDir(OUT_CUTOUTS)])),
]);

console.log('Building image derivatives:');
const photos = [];
for (const file of photoFiles.filter((f) => /\.(jpe?g|png)$/i.test(f))) {
  photos.push(await buildPhoto(file));
}
const cutouts = [];
for (const file of cutoutFiles.filter((f) => /\.png$/i.test(f))) {
  cutouts.push(await buildCutout(file));
}
const logo = await buildLogo();
await buildSocialCard();

// The intrinsic dimensions travel with the derivatives so <img> can carry
// width/height and reserve its box before the bytes land.
await writeFile(
  'src/data/imageSizes.json',
  `${JSON.stringify(
    {
      widths: WIDTHS,
      photos: Object.fromEntries(
        photos.map((p) => [p.name, { width: p.width, height: p.height, widths: p.widths }]),
      ),
      cutouts: Object.fromEntries(
        cutouts.map((c) => [c.name, { width: c.width, height: c.height, widths: c.widths }]),
      ),
      logo,
    },
    null,
    2,
  )}\n`,
);

console.log('Wrote src/data/imageSizes.json');
