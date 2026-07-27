/**
 * Splits a keyed contact sheet into one trimmed PNG per object.
 *
 * Generating several objects in a single frame costs one credit batch instead
 * of several, so the sheets arrive as rows of instruments on flat magenta. This
 * keys the sheet, finds each object as a connected region of opaque pixels, and
 * writes them out left to right. Stray render fragments fall out because only
 * the largest regions are kept.
 *
 *   node scripts/split-sheet.mjs <sheet.png> <outDir> snare,bass,cymbals,sticks
 */
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { keyToRgba } from './cutout.mjs';

/** Alpha above this counts as object when tracing regions. */
const SOLID = 24;

/** Traces 8-connected regions of opaque pixels and returns their bounding boxes. */
function findRegions(alphas, width, height) {
  const seen = new Uint8Array(width * height);
  const regions = [];

  for (let start = 0; start < alphas.length; start++) {
    if (seen[start] || alphas[start] < SOLID) continue;

    const stack = [start];
    seen[start] = 1;
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let area = 0;

    while (stack.length) {
      const p = stack.pop();
      const x = p % width;
      const y = (p / width) | 0;
      area++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;

      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= height) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= width) continue;
          const q = yy * width + xx;
          if (seen[q] || alphas[q] < SOLID) continue;
          seen[q] = 1;
          stack.push(q);
        }
      }
    }

    regions.push({ minX, minY, maxX, maxY, area });
  }

  return regions;
}

export async function splitSheet(sheet, outDir, names, options = {}) {
  const { rgba, width, height } = await keyToRgba(sheet, options);

  const alphas = new Uint8Array(width * height);
  for (let p = 0; p < alphas.length; p++) alphas[p] = rgba[p * 4 + 3];

  const regions = findRegions(alphas, width, height)
    .sort((a, b) => b.area - a.area)
    .slice(0, names.length)
    .sort((a, b) => a.minX - b.minX);

  if (regions.length < names.length) {
    console.warn(`  ! found ${regions.length} regions for ${names.length} names`);
  }

  await mkdir(outDir, { recursive: true });
  const written = [];

  for (const [index, region] of regions.entries()) {
    const name = names[index];
    // A couple of pixels of margin keeps the feathered edge intact.
    const pad = 2;
    const left = Math.max(0, region.minX - pad);
    const top = Math.max(0, region.minY - pad);
    const w = Math.min(width - left, region.maxX - region.minX + 1 + pad * 2);
    const h = Math.min(height - top, region.maxY - region.minY + 1 + pad * 2);

    const file = join(outDir, `${name}.png`);
    const info = await sharp(rgba, { raw: { width, height, channels: 4 } })
      .extract({ left, top, width: w, height: h })
      .png()
      .toFile(file);

    console.log(`  ${name.padEnd(16)} ${info.width}x${info.height}  (${region.area.toLocaleString()} px)`);
    written.push({ name, width: info.width, height: info.height });
  }

  return written;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [sheet, outDir, nameList] = process.argv.slice(2);
  if (!sheet || !outDir || !nameList) {
    console.error('usage: node scripts/split-sheet.mjs <sheet.png> <outDir> name1,name2,...');
    process.exit(1);
  }
  await splitSheet(sheet, outDir, nameList.split(',').map((n) => n.trim()));
}
