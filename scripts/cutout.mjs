/**
 * Keys a flat chroma background out of a generated object shot and returns or
 * writes a PNG with a real alpha channel.
 *
 * Generating against flat magenta and keying here costs nothing, where the
 * hosted background remover costs credits per image. Magenta is chosen because
 * no brass, chrome, drum head or wood in this set comes near it.
 *
 *   node scripts/cutout.mjs <input> <output> [--inner 45] [--outer 105]
 */
import { basename } from 'node:path';
import sharp from 'sharp';

/** Below this distance from the background colour a pixel is fully cut. */
const INNER = 45;
/** Above this distance it is fully kept. Between the two it feathers. */
const OUTER = 105;
/** How many opaque pixels inward from the edge still carry key spill. */
const SPILL_RADIUS = 3;

const distance = (r, g, b, bg) => Math.hypot(r - bg[0], g - bg[1], b - bg[2]);

/** Median of the four corners, which are always background. */
function sampleBackground(data, width, height, channels) {
  const at = (x, y) => {
    const i = (y * width + x) * channels;
    return [data[i], data[i + 1], data[i + 2]];
  };
  const corners = [at(2, 2), at(width - 3, 2), at(2, height - 3), at(width - 3, height - 3)];
  return [0, 1, 2].map((c) => {
    const values = corners.map((corner) => corner[c]).sort((a, b) => a - b);
    return Math.round((values[1] + values[2]) / 2);
  });
}

/** Keys the background out and returns the raw RGBA buffer, untrimmed. */
export async function keyToRgba(input, { inner = INNER, outer = OUTER } = {}) {
  const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const count = width * height;
  const background = sampleBackground(data, width, height, channels);

  const alphas = new Uint8Array(count);
  for (let p = 0; p < count; p++) {
    const s = p * channels;
    const d = distance(data[s], data[s + 1], data[s + 2], background);
    alphas[p] = d <= inner ? 0 : d >= outer ? 255 : Math.round(((d - inner) / (outer - inner)) * 255);
  }

  // Spill strength per pixel. Feathered pixels get it in full; opaque pixels
  // get it in proportion to how close they sit to the cut edge, which is where
  // the render's own antialiasing mixed background into the object.
  const spill = new Float32Array(count);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      if (alphas[p] === 0) continue;
      if (alphas[p] < 255) {
        spill[p] = 1 - alphas[p] / 255;
        continue;
      }
      let nearest = Infinity;
      for (let dy = -SPILL_RADIUS; dy <= SPILL_RADIUS; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= height) continue;
        for (let dx = -SPILL_RADIUS; dx <= SPILL_RADIUS; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= width) continue;
          if (alphas[yy * width + xx] < 255) {
            const dist = Math.hypot(dx, dy);
            if (dist < nearest) nearest = dist;
          }
        }
      }
      if (nearest <= SPILL_RADIUS) spill[p] = 1 - nearest / (SPILL_RADIUS + 1);
    }
  }

  const rgba = Buffer.alloc(count * 4);
  for (let p = 0; p < count; p++) {
    const s = p * channels;
    let [r, g, b] = [data[s], data[s + 1], data[s + 2]];

    // Despill. The magenta key leaves a violet cast where red and blue sit
    // above green. Pull them back toward green, scaled by spill strength.
    if (spill[p] > 0) {
      const cast = (r + b) / 2 - g;
      if (cast > 0) {
        const pull = cast * spill[p];
        r = Math.max(0, Math.round(r - pull));
        b = Math.max(0, Math.round(b - pull));
      }
    }

    const t = p * 4;
    rgba[t] = r;
    rgba[t + 1] = g;
    rgba[t + 2] = b;
    rgba[t + 3] = alphas[p];
  }

  return { rgba, width, height, background };
}

/** Keys a single-object shot and writes it trimmed to its content bounds. */
export async function cutout(input, output, options = {}) {
  const { rgba, width, height, background } = await keyToRgba(input, options);

  const info = await sharp(rgba, { raw: { width, height, channels: 4 } })
    .png()
    .trim({ threshold: 0 })
    .toFile(output);

  console.log(
    `  ${basename(output).padEnd(20)} bg rgb(${background}) -> ${info.width}x${info.height}`,
  );
  return info;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [input, output] = process.argv.slice(2);
  if (!input || !output) {
    console.error('usage: node scripts/cutout.mjs <input> <output>');
    process.exit(1);
  }
  const flag = (name, fallback) => {
    const i = process.argv.indexOf(`--${name}`);
    return i > -1 ? Number(process.argv[i + 1]) : fallback;
  };
  await cutout(input, output, { inner: flag('inner', INNER), outer: flag('outer', OUTER) });
}
