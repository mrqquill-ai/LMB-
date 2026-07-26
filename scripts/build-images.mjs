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
const OUT_PHOTOS = 'public/assets/photos';
const OUT_LOGOS = 'public/assets/logos';
const OUT_SOCIAL = 'public/assets/social';

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

  for (const target of WIDTHS) {
    if (target > width) continue;
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

  console.log(`  ${name.padEnd(20)} ${width}x${height} -> ${WIDTHS.length} widths, ${kb(total)}`);
  return { name, width, height };
}

async function buildLogo() {
  const src = join(SRC_LOGOS, 'lmb-logo-white.png');
  const { width, height } = await sharp(src).metadata();
  let total = 0;

  // The logo never renders above 135 CSS px, so 320 covers it at 2x.
  for (const format of ['webp', 'png']) {
    const info = await sharp(src)
      .resize({ width: 320, withoutEnlargement: true })
      [format]({ quality: 90 })
      .toFile(join(OUT_LOGOS, `lmb-logo-white-320.${format}`));
    total += info.size;
  }

  console.log(`  ${'lmb-logo-white'.padEnd(20)} ${width}x${height} -> 320w, ${kb(total)}`);
  return { width, height };
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

const [photoFiles] = await Promise.all([
  readdir(SRC_PHOTOS),
  emptyDir(OUT_PHOTOS).then(() => Promise.all([emptyDir(OUT_LOGOS), emptyDir(OUT_SOCIAL)])),
]);

console.log('Building image derivatives:');
const photos = [];
for (const file of photoFiles.filter((f) => /\.(jpe?g|png)$/i.test(f))) {
  photos.push(await buildPhoto(file));
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
      photos: Object.fromEntries(photos.map((p) => [p.name, { width: p.width, height: p.height }])),
      logo,
    },
    null,
    2,
  )}\n`,
);

console.log('Wrote src/data/imageSizes.json');
